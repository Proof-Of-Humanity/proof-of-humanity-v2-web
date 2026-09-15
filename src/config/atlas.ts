import { getSdk as getAtlasSdk, SdkFunctionWrapper } from "generated/atlas";
import { ClientError, GraphQLClient } from "graphql-request";

const keepPartialDataOnFieldErrors: SdkFunctionWrapper = async <T>(
  action: () => Promise<T>,
  operationName: string,
  operationType?: string,
) => {
  try {
    return await action();
  } catch (error) {
    if (
      operationType !== "query" ||
      !(error instanceof ClientError) ||
      !error.response.data ||
      isAtlasApiUnavailable(error)
    )
      throw error;

    console.warn(
      `Atlas ${operationName}: rendering partial data, some fields errored`,
      error.response.errors,
    );
    return error.response.data as T;
  }
};

export const getAuthedAtlasSdk = () => {
  if (!process.env.ATLAS_URI) throw new Error("Missing ATLAS_URI");

  let token: string | null = null;
  if (typeof window !== "undefined") {
    const storedToken = window.sessionStorage.getItem("authToken");
    if (storedToken) {
      try {
        token = JSON.parse(storedToken) as string;
      } catch {
        token = null;
      }
    }
  }

  const client = new GraphQLClient(`${process.env.ATLAS_URI}/graphql`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });

  return getAtlasSdk(client, keepPartialDataOnFieldErrors);
};

export const getAtlasError = (error: unknown) => {
  const graphQLError =
    error instanceof ClientError ? error.response.errors?.[0] : undefined;
  const extensions = graphQLError?.extensions;
  return {
    message: graphQLError?.message,
    code: extensions?.code as string | undefined,
    httpStatus: extensions?.equivalentHTTPStatusCode as number | undefined,
  };
};

export const isAtlasApiUnavailable = (error: unknown): boolean =>
  error instanceof ClientError &&
  (error.response.status === 503 ||
    error.response.errors?.some(
      ({ extensions }) =>
        extensions?.code === "ApiTemporarilyUnavailableError" ||
        extensions?.equivalentHTTPStatusCode === 503,
    ) === true);
