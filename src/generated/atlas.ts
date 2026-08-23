import type { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Address: string;
};

export type PaginationArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  sortByTimeStamp?: InputMaybe<SortByTimeStamp>;
  take: Scalars['Int'];
};

/** Lifecycle state for a PoH referral payout transaction. */
export enum PohReferralPayoutTransactionStatus {
  /** Payout transaction was confirmed successfully. */
  Confirmed = 'CONFIRMED',
  /** Payout transaction hash was precomputed and saved, but the bot has not marked it broadcast yet. */
  NotSent = 'NOT_SENT',
  /** Payout transaction was broadcasted and is waiting for confirmation. */
  Pending = 'PENDING'
}

/** Review state for a PoH referral attribution. */
export enum PohReferralReviewStatus {
  /** Referral is active and can proceed through payout eligibility checks. */
  Active = 'ACTIVE',
  /** Referral was approved by an admin and can proceed through payout eligibility checks. */
  Approved = 'APPROVED',
  /** Referral requires admin review before payout. */
  NeedsReview = 'NEEDS_REVIEW',
  /** Referral was rejected by an admin. */
  Rejected = 'REJECTED'
}

export enum SortByTimeStamp {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type LinkReferralAttributionMutationVariables = Exact<{
  referrerHumanityId: Scalars['Address'];
}>;


export type LinkReferralAttributionMutation = { __typename?: 'Mutation', linkReferralAttribution: { __typename?: 'PohReferralAttribution', refereeHumanityId: string } };

export type PohReferralDashboardQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArgs>;
}>;


export type PohReferralDashboardQuery = { __typename?: 'Query', humanityFlag: boolean, pohReferralStats: { __typename?: 'PohReferralStats', verifiedReferrals: number, paidRewardsAmountInWei: string, pendingRewardsAmountInWei: string }, pohReferrals: { __typename?: 'PohReferralPage', count: number, items?: Array<{ __typename?: 'PohReferralAttributionItem', item: { __typename?: 'PohReferralAttribution', refereeHumanityId: string, reviewStatus: PohReferralReviewStatus, rewardAmount: string, payoutTransaction?: { __typename?: 'PohReferralPayoutTransaction', status: PohReferralPayoutTransactionStatus, txHash: string } | null, refereeFlag?: { __typename?: 'PohFlaggedHumanity', isFlagged: boolean } | null } }> | null } };


export const LinkReferralAttributionDocument = gql`
    mutation LinkReferralAttribution($referrerHumanityId: Address!) {
  linkReferralAttribution(referrerHumanityId: $referrerHumanityId) {
    refereeHumanityId
  }
}
    `;
export const PohReferralDashboardDocument = gql`
    query PohReferralDashboard($pagination: PaginationArgs) {
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
        payoutTransaction {
          status
          txHash
        }
        refereeFlag {
          isFlagged
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    LinkReferralAttribution(variables: LinkReferralAttributionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LinkReferralAttributionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LinkReferralAttributionMutation>({ document: LinkReferralAttributionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'LinkReferralAttribution', 'mutation', variables);
    },
    PohReferralDashboard(variables?: PohReferralDashboardQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PohReferralDashboardQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PohReferralDashboardQuery>({ document: PohReferralDashboardDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PohReferralDashboard', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;