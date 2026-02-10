import { HttpStatusCode } from "axios";
import { paramToChain } from "config/chains";
import datalake from "config/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Address, Hash } from "viem";

interface RequestParams {
  chain: string;
  claimer: Address;
  pohid: Hash;
}

export const dynamic = "force-dynamic";
export async function GET(
  _request: NextRequest,
  { params }: { params: RequestParams },
) {
  try {
    const chain = paramToChain(params.chain);
    console.log("API Route GET called with params:", params);

    if (!chain) {
      console.error("API Route Error: Unsupported chain", params.chain);
      throw new Error("unsupported chain");
    }
    console.log("API Route resolved chain ID:", chain.id);


    const { data, error } = await datalake
      .from("poh-vouchdb")
      .select("*")
      .eq("chainId", chain.id)
      .eq("pohId", params.pohid.toLowerCase())
      .eq("claimer", params.claimer.toLowerCase());

    console.log("API Route DB Query Params:", {
      chainId: chain.id,
      pohId: params.pohid.toLowerCase(),
      claimer: params.claimer.toLowerCase()
    });


    console.log("vouches for request:", data);
    if (error) throw new Error(error.message);

    return NextResponse.json(data, { status: HttpStatusCode.Ok });
  } catch (err: any) {
    console.error("API Route Execution Error:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
