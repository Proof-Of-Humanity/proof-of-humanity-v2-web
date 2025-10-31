import { HttpStatusCode } from "axios";
import { getChainRpc, paramToChain } from "config/chains";
import datalake from "config/supabase";

import { getContractInfo } from "contracts";
import { NextRequest, NextResponse } from "next/server";
import {
  Address,
  Hash,
  createPublicClient,
  http,
  verifyTypedData,
} from "viem";

interface AddVouchBody {
  pohId: Hash;
  claimer: Address;
  voucher: Address;
  expiration: number;
  signature: Hash;
}

interface AddVouchParams {
  chain: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: AddVouchParams },
) {
  try {
    const chain = paramToChain(params.chain);

    if (!chain) throw new Error("unsupported chain");

    const { pohId, claimer, voucher, expiration, signature }: AddVouchBody =
      await request.json();

    if (!claimer || !voucher || !pohId || !expiration || !signature)
      throw new Error("Invalid body");

    const isSelfVouch = voucher === claimer;
    if (isSelfVouch) throw new Error("Cannot vouch for yourself");

    if (expiration < Math.floor(Date.now() / 1000))
      throw new Error("Vouch already expired");

    const publicClient = createPublicClient({
      chain,
      transport: http(getChainRpc(chain.id)),
    });

    const isVoucherHuman = await publicClient.readContract({
      abi: getContractInfo("ProofOfHumanity", chain.id).abi,
      address: getContractInfo("ProofOfHumanity", chain.id).address as `0x${string}`,
      functionName: 'isHuman',
      args: [voucher],
    });

    if (!isVoucherHuman) throw new Error("Voucher is not human");

    const validSignature = await verifyTypedData({
      address: voucher,
      domain: {
        name: "Proof of Humanity",
        chainId: chain.id,
        verifyingContract: getContractInfo("ProofOfHumanity", chain.id).address as `0x${string}`,
      },
      types: {
        IsHumanVoucher: [
          { name: "vouched", type: "address" },
          { name: "humanityId", type: "bytes20" },
          { name: "expirationTimestamp", type: "uint256" },
        ],
      },
      primaryType: "IsHumanVoucher",
      message: {
        vouched: claimer,
        humanityId: pohId,
        expirationTimestamp: BigInt(expiration),
      },
      signature,
    });

    if (!validSignature) throw new Error("Invalid signature");

    /*     await datalake
      .from("poh-vouchdb")
      .delete()
      .eq("pohId", pohId.toLowerCase())
      .eq("voucher", voucher.toLowerCase());
 */
    await datalake
      .from("poh-vouchdb")
      .upsert({
        chainId: chain.id,
        pohId: pohId.toLowerCase(),
        claimer: claimer.toLowerCase(),
        voucher: voucher.toLowerCase(),
        expiration,
        signature: signature.toLowerCase(),
      })
      .select();

    return NextResponse.json(
      { message: "Vouch added" },
      { status: HttpStatusCode.Accepted },
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
