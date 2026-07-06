import { getSdk as getAtlasSdk } from "generated/atlas";
import { GraphQLClient } from "graphql-request";

/**
 * Atlas SDK carrying the signed-in user's session token. Atlas operations are
 * self-scoped server-side, so no ids are passed from the client.
 */
export const getAuthedAtlasSdk = () => {
  if (!process.env.ATLAS_URI) throw new Error("Missing ATLAS_URI");

  let token: string | null = null;
  if (typeof window !== "undefined") {
    const storedToken = window.sessionStorage.getItem("authToken");
    token = storedToken ? (JSON.parse(storedToken) as string) : null;
  }

  const client = new GraphQLClient(`${process.env.ATLAS_URI}/graphql`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });

  return getAtlasSdk(client);
};
