import {
  getAllTimeUniqueEstimate,
  getCorsHeaders,
  getMetricsRangeTotal,
  isOriginAllowed,
  toUtcDayStart,
} from "./_seerAnalytics";

export default async (request: Request) => {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    if (!isOriginAllowed(origin)) {
      return new Response(null, { status: 403, headers: corsHeaders });
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  if (!isOriginAllowed(origin)) {
    return new Response(null, { status: 403, headers: corsHeaders });
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

  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const from = Number(fromParam);
  const to = Number(toParam);

  if (!fromParam || !toParam || !Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < 0 || from > to) {
    return new Response(null, { status: 400, headers: corsHeaders });
  }

  const startDay = toUtcDayStart(from);
  const endDay = toUtcDayStart(to);
  const totalUniqueEstimate = await getMetricsRangeTotal(startDay, endDay);

  return new Response(
    JSON.stringify({
      metric: "seer_claim_render",
      from,
      to,
      totalUniqueEstimate,
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
