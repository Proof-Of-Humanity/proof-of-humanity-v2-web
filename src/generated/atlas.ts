import type { GraphQLClient } from "graphql-request";
import type * as Dom from "graphql-request/dist/types.dom";
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
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Address: string;
  DateTime: any;
  Hash: any;
  JSON: any;
};

export type AddContractDto = {
  /** Abi of the contract */
  abi: Array<Scalars["JSON"]>;
  /** Address of the contract */
  address: Scalars["Address"];
  /** Chain Id of the blockchain where contract is deployed */
  chainId: Scalars["Int"];
  /** Block number at which contract is deployed */
  deploymentBlockNumber: Scalars["String"];
  /** Name of the contract */
  name: Scalars["String"];
  /** Name of the project to which contract belongs */
  project: Scalars["String"];
};

export type AddNetworkDto = {
  /** Chain Id of the blockchain network */
  chainId: Scalars["Int"];
  /** Name of the network */
  name: Scalars["String"];
};

export type AddProjectDto = {
  /** Name of the project */
  name: Scalars["String"];
};

export type AddUserSettingsDto = {
  /** Ethereum address of the user. If present, must be equal to logged wallet address */
  address?: InputMaybe<Scalars["Address"]>;
  /** Email of the user */
  email: Scalars["String"];
  /** If the user email has been confirmed */
  isEmailVerified?: InputMaybe<Scalars["String"]>;
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: Scalars["Boolean"];
  product?: InputMaybe<SignupProduct>;
  /** Role/s assigned to the user. Only admins can modify this role. */
  roles?: InputMaybe<Array<Role>>;
};

export type ConfirmEmailInput = {
  /** Ethereum address of the user */
  address: Scalars["Address"];
  /** Token to confirm email */
  token: Scalars["String"];
};

export type ContractInput = {
  /** Address of the contract */
  address: Scalars["Address"];
  /** Chain Id of the blockchain network */
  chainId: Scalars["Int"];
};

export enum CourtV2Deployment {
  Beta = "Beta",
  Devnet = "Devnet",
  Testnet = "Testnet",
  University = "University",
}

export type CourtV2EvidenceSpamDto = {
  deployment: CourtV2Deployment;
  dispute: Scalars["String"];
  evidenceGroupId: Scalars["String"];
  evidenceIndex: Scalars["String"];
};

export type PaginationArgs = {
  /** Number of items to skip */
  skip?: InputMaybe<Scalars["Int"]>;
  /** Return items in order of ascending or descending block timestamp */
  sortByTimeStamp?: InputMaybe<SortByTimeStamp>;
  /** Number of items to return */
  take?: Scalars["Int"];
};

/** Lifecycle state for a PoH referral payout transaction. */
export enum PohReferralPayoutTransactionStatus {
  /** Payout transaction was confirmed successfully. */
  Confirmed = "CONFIRMED",
  /** Payout transaction hash was precomputed and saved, but the bot has not marked it broadcast yet. */
  NotSent = "NOT_SENT",
  /** Payout transaction was broadcasted and is waiting for confirmation. */
  Pending = "PENDING",
}

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

/** User roles. This give the user different permissions. */
export enum Role {
  /** Admin role. This gives the user access to the datastream mutations. */
  Admin = "Admin",
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

export enum SortByTimeStamp {
  Asc = "ASC",
  Desc = "DESC",
}

export type UpdateContractDto = {
  /** Abi of the contract */
  abi?: InputMaybe<Array<Scalars["JSON"]>>;
  /** Address of the contract */
  address?: InputMaybe<Scalars["Address"]>;
  /** Chain Id of the blockchain where contract is deployed */
  chainId?: InputMaybe<Scalars["Int"]>;
  /** Block number at which contract is deployed */
  deploymentBlockNumber?: InputMaybe<Scalars["String"]>;
  /** Name of the contract */
  name?: InputMaybe<Scalars["String"]>;
  /** Name of the project to which contract belongs */
  project?: InputMaybe<Scalars["String"]>;
};

export type UpdateNetworkDto = {
  /** Name of the network */
  name?: InputMaybe<Scalars["String"]>;
};

export type UpdateNotificationSettingsDto = {
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: InputMaybe<Scalars["Boolean"]>;
};

export type UpdateProjectDto = {
  /** Name of the project */
  name?: InputMaybe<Scalars["String"]>;
};

export type UpdateUserSettingsDto = {
  /** Email of the user */
  email?: InputMaybe<Scalars["String"]>;
  /** If the user email has been confirmed */
  isEmailVerified?: InputMaybe<Scalars["String"]>;
  /** enable notifications on courtV2 project. True by default */
  notifications_courtV2?: InputMaybe<Scalars["Boolean"]>;
  /** Role/s assigned to the user. Only admins can modify this role. */
  roles?: InputMaybe<Array<Role>>;
};

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

export type PohReferralDashboardQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArgs>;
}>;

export type PohReferralDashboardQuery = {
  __typename?: "Query";
  humanityFlag: boolean;
  pohReferrals: {
    __typename?: "PohReferralPage";
    count: number;
    hasNextPage: boolean;
    items?: Array<{
      __typename?: "PohReferralAttributionItem";
      item: {
        __typename?: "PohReferralAttribution";
        refereeHumanityId: string;
        reviewStatus: PohReferralReviewStatus;
        rewardAmount: string;
        payoutTransaction?: {
          __typename?: "PohReferralPayoutTransaction";
          status: PohReferralPayoutTransactionStatus;
        } | null;
        refereeFlag?: {
          __typename?: "PohFlaggedHumanity";
          isFlagged: boolean;
        } | null;
      };
    }> | null;
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
export const PohReferralDashboardDocument = gql`
  query PohReferralDashboard($pagination: PaginationArgs) {
    humanityFlag
    pohReferrals(pagination: $pagination) {
      count
      hasNextPage
      items {
        item {
          refereeHumanityId
          reviewStatus
          rewardAmount
          payoutTransaction {
            status
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
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    LinkReferralAttribution(
      variables: LinkReferralAttributionMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"],
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
      );
    },
    PohReferralDashboard(
      variables?: PohReferralDashboardQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"],
    ): Promise<PohReferralDashboardQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<PohReferralDashboardQuery>(
            PohReferralDashboardDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "PohReferralDashboard",
        "query",
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
