import { HttpStatusCode } from "axios";
import { paramToChain } from "config/chains";
import datalake from "config/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RequestParams {
  chain: string;
  min: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: RequestParams },
) {
  try {
    const chain = paramToChain(params.chain);

    if (!chain) throw new Error("unsupported chain");

    // Currently only taking one vouch as min
    const { data, error } = await datalake
      .from("poh-vouchdb")
      .select("*")
      .eq("chainId", chain.id);

    if (error) throw new Error(error.message);

    return NextResponse.json(data, { status: HttpStatusCode.Ok });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
