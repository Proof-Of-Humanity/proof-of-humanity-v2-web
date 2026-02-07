import { extractErrorMessage, extractStatusCode } from "utils/errors";

interface EmailFlowErrorOptions {
  isResend?: boolean;
}

export const getEmailFlowErrorMessage = (
  error: unknown,
  options?: EmailFlowErrorOptions,
): string => {
  const message = extractErrorMessage(error).toLowerCase();
  const statusCode = extractStatusCode(error);

  if (message.includes("rejected") || message.includes("denied")) {
    return "Request Rejected";
  }
  if (message.includes("wallet not connected")) {
    return "Reconnect your wallet to continue.";
  }
  if (statusCode === 401 || statusCode === 403) {
    return "Your session expired. Please sign in again.";
  }
  if (statusCode === 408 || statusCode === 504) {
    return "Request timed out. Please try again.";
  }
  if (statusCode === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (statusCode === 400 || statusCode === 422) {
    return "Please check the email address and try again.";
  }
  if (statusCode !== null && statusCode >= 500) {
    return "Email service is temporarily unavailable. Please try again.";
  }

  if (options?.isResend) return "Couldn't resend verification email. Please try again.";
  return "Couldn't save email. Please try again.";
};
