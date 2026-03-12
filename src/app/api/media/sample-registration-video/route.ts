import { NextRequest } from "next/server";

const SAMPLE_VIDEO_URL =
  "https://cdn.kleros.link/ipfs/QmXhHdV6rW6MT97E5pP8KXntf7h1ueA628SpKJZ4FD6Heu";

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
  const response = await fetch(SAMPLE_VIDEO_URL, {
    headers: range ? { Range: range } : undefined,
  });

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
  const response = await fetch(SAMPLE_VIDEO_URL, {
    headers: range ? { Range: range } : undefined,
  });

  if (!response.ok && response.status !== 206) {
    return new Response("Failed to load sample video", { status: response.status });
  }

  return new Response(response.body, {
    status: response.status,
    headers: buildHeaders(response),
  });
}
