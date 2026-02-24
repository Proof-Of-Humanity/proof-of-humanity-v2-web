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
    console.log("=== API ROUTE HIT: /api/vouch/[chain]/for-request/[claimer]/[pohid] ===");
    console.log("Raw params:", params);

    const chain = paramToChain(params.chain);
    console.log("Resolved chain ID:", chain?.id);

    if (!chain) {
      console.error("Unsupported chain provided:", params.chain);
      throw new Error("unsupported chain");
    }

    const claimerLower = params.claimer.toLowerCase();
    const pohidLower = params.pohid.toLowerCase();

    console.log("Querying datalake with:", {
      chainId: chain.id,
      pohId: pohidLower,
      claimer: claimerLower,
    });

    const { data, error } = await datalake
      .from("poh-vouchdb")
      .select("*")
      .eq("chainId", chain.id)
      .eq("pohId", pohidLower)
      .eq("claimer", claimerLower);

    console.log("Supabase response:", {
      dataFound: data ? data.length : 0,
      firstRecordId: data?.[0]?.transactionHash || null,
      error,
    });

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data, { status: HttpStatusCode.Ok });
  } catch (err: any) {
    console.error("=== API ERROR in /api/vouch/[chain]/for-request/[claimer]/[pohid] ===", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
