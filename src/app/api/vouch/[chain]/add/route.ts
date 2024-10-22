import { HttpStatusCode } from "axios";
import { SupportedChain, getChainRpc, paramToChain } from "config/chains";
import datalake from "config/supabase";
import { Contract } from "contracts";
import abis from "contracts/abis";
import { NextRequest, NextResponse } from "next/server";
import {
  Address,
  Hash,
  createPublicClient,
  getContract,
  http,
  verifyTypedData,
} from "viem";

const getProofOfHumanity = (chain: SupportedChain) =>
  getContract({
    abi: abis.ProofOfHumanity,
    address: Contract.ProofOfHumanity[chain.id] as `0x${string}`,
    publicClient: createPublicClient({
      chain,
      transport: http(getChainRpc(chain.id)),
    }),
  });

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

    const poh = getProofOfHumanity(chain);

    const isVoucherHuman = await poh.read.isHuman([voucher]);
    if (!isVoucherHuman) throw new Error("Voucher is not human");

    const validSignature = await verifyTypedData({
      address: voucher,
      domain: {
        name: "Proof of Humanity",
        chainId: chain.id,
        verifyingContract: Contract.ProofOfHumanity[chain.id] as `0x${string}`,
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
