import { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";

export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];

export type Scalars = {
  Address: string;
};

/** Review state for a PoH referral attribution. */
export enum PohReferralReviewStatus {
  /** Referral is active and can proceed through payout eligibility checks. */
  Active = "ACTIVE",
  /** Referral was approved by an admin and can proceed through payout eligibility checks. */
  Approved = "APPROVED",
  /** Referral requires admin review before payout. */
  NeedsReview = "NEEDS_REVIEW",
  /** Referral was rejected by an admin. */
  Rejected = "REJECTED",
}

export type LinkReferralAttributionMutationVariables = Exact<{
  referrerHumanityId: Scalars["Address"];
}>;

export type LinkReferralAttributionMutation = {
  __typename?: "Mutation";
  linkReferralAttribution: {
    __typename?: "PohReferralAttribution";
    refereeHumanityId: string;
    referrerHumanityId: string;
    reviewStatus: PohReferralReviewStatus;
  };
};

export const LinkReferralAttributionDocument = gql`
  mutation LinkReferralAttribution($referrerHumanityId: Address!) {
    linkReferralAttribution(referrerHumanityId: $referrerHumanityId) {
      refereeHumanityId
      referrerHumanityId
      reviewStatus
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: unknown,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    LinkReferralAttribution(
      variables: LinkReferralAttributionMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<LinkReferralAttributionMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<LinkReferralAttributionMutation>(
            LinkReferralAttributionDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "LinkReferralAttribution",
        "mutation",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
