import {
  getAllTimeUniqueEstimate,
  getCorsHeaders,
  getMetricsRangeTotal,
  toUtcDayStart,
} from "../../src/utils/seerAnalytics";

export default async (request: Request) => {
  const corsHeaders = getCorsHeaders();

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  if (scope === "global") {
    const uniqueEstimate = await getAllTimeUniqueEstimate();
    return new Response(
      JSON.stringify({
        metric: "seer_claim_render",
        scope: "global",
        uniqueEstimate,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const dayParam = url.searchParams.get("day");
  const day = Number(dayParam);
  if (!dayParam || !Number.isFinite(day) || day < 0) {
    return new Response(null, { status: 400, headers: corsHeaders });
  }

  const dayStart = toUtcDayStart(day);
  const uniqueEstimate = await getMetricsRangeTotal(dayStart, dayStart);

  return new Response(
    JSON.stringify({
      metric: "seer_claim_render",
      scope: "day",
      day: dayStart,
      uniqueEstimate,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
};
