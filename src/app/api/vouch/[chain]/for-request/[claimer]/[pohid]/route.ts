import { HttpStatusCode } from "axios";
import { paramToChainAny } from "config/chains";
import datalake from "config/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RequestParams {
  chain: string;
  claimer: string;
  pohid: string;
}

export const dynamic = "force-dynamic";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RequestParams> },
) {
  try {
    const { chain: chainParam, claimer, pohid } = await params;
    const chain = paramToChainAny(chainParam);
    console.log("API Route GET called with params:", { chain: chainParam, claimer, pohid });

    if (!chain) {
      console.error("API Route Error: Unsupported chain", chainParam);
      throw new Error("unsupported chain");
    }
    console.log("API Route resolved chain ID:", chain.id);

    const claimerLower = claimer.toLowerCase();
    const pohidLower = pohid.toLowerCase();

    const { data, error } = await datalake
      .from("poh-vouchdb")
      .select("*")
      .eq("chainId", chain.id)
      .eq("pohId", pohidLower)
      .eq("claimer", claimerLower);

    console.log("API Route DB Query Params:", {
      chainId: chain.id,
      pohId: pohidLower,
      claimer: claimerLower,
    });

    console.log("vouches for request:", data);
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data, { status: HttpStatusCode.Ok });
  } catch (err: any) {
    console.error("API Route Execution Error:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
