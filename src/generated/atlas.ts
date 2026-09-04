import type { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Address scalar type to represent ethereum addresses */
  Address: { input: string; output: string };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
  /** Hex-encoded 32-byte hash with 0x prefix, case-insensitive */
  Hash32: { input: string; output: string };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
};

export type AddUserSettingsDto = {
  /** Ethereum address of the user. If present, must be equal to logged wallet address */
  address?: InputMaybe<Scalars["Address"]["input"]>;
  /** Email of the user */
  email: Scalars["String"]["input"];
  /** If the user email has been confirmed */
  isEmailVerified?: InputMaybe<Scalars["String"]["input"]>;
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: Scalars["Boolean"]["input"];
  product?: InputMaybe<SignupProduct>;
  /** Role/s assigned to the user. Only admins can modify this role. */
  roles?: InputMaybe<Array<Role>>;
};

export type AdminHumanityPaginationInput = {
  /** Column to order the results by */
  orderBy?: AdminHumanitySortField;
  /** Direction of the ordering */
  orderDirection?: SortDirection;
  /** Number of items to skip */
  skip?: Scalars["Int"]["input"];
  /** Number of items to return */
  take?: Scalars["Int"]["input"];
};

/** Column a page of results is ordered by */
export enum AdminHumanitySortField {
  UpdatedAt = "UPDATED_AT",
}

export type AdminReferralFilter = {
  /** Only referrals created at or after this time. */
  createdAtFrom?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** Only referrals created at or before this time. */
  createdAtTo?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** Only referrals whose payout is in one of these states. */
  payoutStatus?: InputMaybe<Array<ReferralPayoutFilter>>;
  /** The referral for this referee humanity (referee is unique, so at most one). */
  refereeHumanityId?: InputMaybe<Scalars["Address"]["input"]>;
  /** Only referrals made by this referrer humanity. */
  referrerHumanityId?: InputMaybe<Scalars["Address"]["input"]>;
  /** Only referrals with one of these review statuses. */
  reviewStatus?: InputMaybe<Array<PohReferralReviewStatus>>;
};

export type ConfirmEmailInput = {
  /** Ethereum address of the user */
  address: Scalars["Address"]["input"];
  /** Token to confirm email */
  token: Scalars["String"]["input"];
};

export enum CourtV2Deployment {
  Beta = "Beta",
  Devnet = "Devnet",
  Testnet = "Testnet",
  University = "University",
}

export type CourtV2EvidenceSpamDto = {
  deployment: CourtV2Deployment;
  dispute: Scalars["String"]["input"];
  evidenceGroupId: Scalars["String"]["input"];
  evidenceIndex: Scalars["String"]["input"];
};

/** Lifecycle state for a PoH referral payout transaction. */
export enum PohReferralPayoutTransactionStatus {
  /** Payout transaction was confirmed successfully. */
  Confirmed = "Confirmed",
  /** Payout transaction hash was precomputed and saved, but the bot has not marked it broadcast yet. */
  NotSent = "NotSent",
  /** Payout transaction was broadcasted and is waiting for confirmation. */
  Pending = "Pending",
}

/** Review state for a PoH referral attribution. */
export enum PohReferralReviewStatus {
  /** Referral is active and can proceed through payout eligibility checks. */
  Active = "Active",
  /** Referral was approved by an admin and can proceed through payout eligibility checks. */
  Approved = "Approved",
  /** Referral requires admin review before payout. */
  NeedsReview = "NeedsReview",
  /** Referral was rejected by an admin. */
  Rejected = "Rejected",
}

/** Column a page of results is ordered by */
export enum PohReferralSortField {
  CreatedAt = "CREATED_AT",
}

export enum Products {
  CourtV1 = "CourtV1",
  CourtV2 = "CourtV2",
  Curate = "Curate",
  Escrow = "Escrow",
  Governor = "Governor",
  ProofOfHumanity = "ProofOfHumanity",
  Reality = "Reality",
  Test = "Test",
  TokenList = "TokenList",
}

export type ReferralPaginationInput = {
  /** Column to order the results by */
  orderBy?: PohReferralSortField;
  /** Direction of the ordering */
  orderDirection?: SortDirection;
  /** Number of items to skip */
  skip?: Scalars["Int"]["input"];
  /** Number of items to return */
  take?: Scalars["Int"]["input"];
};

/** Payout state to filter admin referrals by. */
export enum ReferralPayoutFilter {
  /** Payout transaction confirmed. */
  Confirmed = "Confirmed",
  /** Payout transaction prepared but not yet broadcast. */
  NotSent = "NotSent",
  /** Payout transaction broadcast, awaiting confirmation. */
  Pending = "Pending",
  /** No payout transaction has been assigned to the referral yet. */
  Unassigned = "Unassigned",
}

/** User roles. This give the user different permissions. */
export enum Role {
  /** Admin role. This gives the user access to the datastream mutations. */
  Admin = "Admin",
  /** Admin role for Foresight market registration. */
  ForesightAdmin = "ForesightAdmin",
  /** Proof of Humanity admin role. This gives the user access to PoH admin mutations. */
  PohAdmin = "PohAdmin",
  /** Service role. Used by internal services for inter-service communication. */
  Service = "Service",
  /** Super Admin role. This gives the user full access to the system. Can grant admin role to other users */
  SuperAdmin = "SuperAdmin",
  /** User role. */
  User = "User",
}

export enum Roles {
  CurateItemFile = "CurateItemFile",
  CurateItemImage = "CurateItemImage",
  Evidence = "Evidence",
  Generic = "Generic",
  IdentificationVideo = "IdentificationVideo",
  Logo = "Logo",
  MetaEvidence = "MetaEvidence",
  Photo = "Photo",
  Policy = "Policy",
  Test = "Test",
}

export enum SignupProduct {
  CourtV1 = "CourtV1",
  CourtV2 = "CourtV2",
  Foresight = "Foresight",
  PohV2 = "PohV2",
}

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export type UpdateNotificationSettingsDto = {
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateUserSettingsDto = {
  /** Email of the user */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** If the user email has been confirmed */
  isEmailVerified?: InputMaybe<Scalars["String"]["input"]>;
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Role/s assigned to the user. Only admins can modify this role. */
  roles?: InputMaybe<Array<Role>>;
};

export type LinkReferralAttributionMutationVariables = Exact<{
  referrerHumanityId: Scalars["Address"]["input"];
}>;

export type LinkReferralAttributionMutation = {
  __typename?: "Mutation";
  linkReferralAttribution: {
    __typename?: "PohReferralAttribution";
    refereeHumanityId: string;
  };
};

export type PohReferralDashboardQueryVariables = Exact<{
  pagination?: InputMaybe<ReferralPaginationInput>;
}>;

export type PohReferralDashboardQuery = {
  __typename?: "Query";
  humanityFlag: boolean;
  pohReferralStats: {
    __typename?: "PohReferralStats";
    verifiedReferrals: number;
    paidRewardsAmountInWei: string;
    pendingRewardsAmountInWei: string;
  };
  pohReferrals: {
    __typename?: "PohReferralPage";
    count: number;
    items: Array<{
      __typename?: "PohReferralAttributionItem";
      item: {
        __typename?: "PohReferralAttribution";
        refereeHumanityId: string;
        reviewStatus: PohReferralReviewStatus;
        rewardAmount: string;
        createdAt: string;
        payoutTransaction?: {
          __typename?: "PohReferralPayoutTransaction";
          status: PohReferralPayoutTransactionStatus;
          txHash: string;
          createdAt: string;
        } | null;
        refereeFlag?: {
          __typename?: "PohFlaggedHumanity";
          isFlagged: boolean;
        } | null;
      };
    }>;
  };
};

export const LinkReferralAttributionDocument = gql`
  mutation LinkReferralAttribution($referrerHumanityId: Address!) {
    linkReferralAttribution(referrerHumanityId: $referrerHumanityId) {
      refereeHumanityId
    }
  }
`;
export const PohReferralDashboardDocument = gql`
  query PohReferralDashboard($pagination: ReferralPaginationInput) {
    humanityFlag
    pohReferralStats {
      verifiedReferrals
      paidRewardsAmountInWei
      pendingRewardsAmountInWei
    }
    pohReferrals(pagination: $pagination) {
      count
      items {
        item {
          refereeHumanityId
          reviewStatus
          rewardAmount
          createdAt
          payoutTransaction {
            status
            txHash
            createdAt
          }
          refereeFlag {
            isFlagged
          }
        }
      }
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    LinkReferralAttribution(
      variables: LinkReferralAttributionMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<LinkReferralAttributionMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<LinkReferralAttributionMutation>({
            document: LinkReferralAttributionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "LinkReferralAttribution",
        "mutation",
        variables,
      );
    },
    PohReferralDashboard(
      variables?: PohReferralDashboardQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<PohReferralDashboardQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<PohReferralDashboardQuery>({
            document: PohReferralDashboardDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "PohReferralDashboard",
        "query",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
