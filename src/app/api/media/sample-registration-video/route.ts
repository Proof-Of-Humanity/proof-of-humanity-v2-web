import { NextRequest } from "next/server";

const SAMPLE_VIDEO_URL =
  "https://cdn.kleros.link/ipfs/QmUzdGku3BMdQXdNgWWjycqGBBPC3fvqNfKVr6LEt8wJwB#t=0.001";

const buildHeaders = (response: Response) => {
  const headers = new Headers();
  ["accept-ranges", "content-length", "content-range", "content-type", "etag", "last-modified"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });
  headers.set("Cache-Control", "public, max-age=86400");
  return headers;
};

export async function HEAD(request: NextRequest) {
  const range = request.headers.get("range");
  let response: Response;
  try {
    response = await fetch(SAMPLE_VIDEO_URL, {
      headers: range ? { Range: range } : undefined,
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }

    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!response.ok && response.status !== 206) {
    return new Response(null, { status: response.status });
  }

  return new Response(null, {
    status: response.status,
    headers: buildHeaders(response),
  });
}

export async function GET(request: NextRequest) {
  const range = request.headers.get("range");
  let response: Response;
  try {
    response = await fetch(SAMPLE_VIDEO_URL, {
      headers: range ? { Range: range } : undefined,
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response("Request aborted", { status: 499 });
    }

    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!response.ok && response.status !== 206) {
    return new Response("Failed to load sample video", { status: response.status });
  }

  return new Response(response.body, {
    status: response.status,
    headers: buildHeaders(response),
  });
}
