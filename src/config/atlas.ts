import { getSdk as getAtlasSdk } from "generated/atlas";
import { ClientError, GraphQLClient } from "graphql-request";

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

  return getAtlasSdk(client);
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
