import { GraphQLClient } from "graphql-request";

if (!process.env.ATLAS_URI) {
  throw new Error("ATLAS_URI environment variable is not set");
}

export const atlasGqlClient = new GraphQLClient(`${process.env.ATLAS_URI}/graphql`);