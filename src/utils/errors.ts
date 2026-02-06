import { BaseError } from "viem";

export function extractErrorMessage(error: unknown): string {
  const defaultMessage = "Something went wrong. Please try again.";
  if (!error) return defaultMessage;

  if (error instanceof BaseError) {
    const withShortMessage = error as BaseError & { shortMessage?: string; details?: string };
    return withShortMessage.shortMessage || withShortMessage.details || error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  if (typeof error === "string") {
    return error || defaultMessage;
  }

  return defaultMessage;
}

export function extractStatusCode(error: unknown): number | null {
  if (error && typeof error === "object") {
    const withStatus = error as { status?: unknown };
    if (typeof withStatus.status === "number") return withStatus.status;

    const withResponse = error as { response?: { status?: unknown } };
    if (typeof withResponse.response?.status === "number") return withResponse.response.status;
  }

  const message = extractErrorMessage(error);
  const match = message.match(/\b([1-5]\d{2})\b/);
  return match ? Number(match[1]) : null;
}

