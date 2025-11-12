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


