import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
  Timestamp: any;
};

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour',
}

export type ArbitratorHistory = {
  __typename?: 'ArbitratorHistory';
  arbitrator: Scalars['Bytes'];
  clearingMeta: Scalars['String'];
  extraData: Scalars['Bytes'];
  id: Scalars['ID'];
  registrationMeta: Scalars['String'];
  requests: Array<Request>;
  updateTime: Scalars['BigInt'];
};

export type ArbitratorHistoryRequestsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Request_Filter>;
};

export type ArbitratorHistory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ArbitratorHistory_Filter>>>;
  arbitrator?: InputMaybe<Scalars['Bytes']>;
  arbitrator_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrator_gt?: InputMaybe<Scalars['Bytes']>;
  arbitrator_gte?: InputMaybe<Scalars['Bytes']>;
  arbitrator_in?: InputMaybe<Array<Scalars['Bytes']>>;
  arbitrator_lt?: InputMaybe<Scalars['Bytes']>;
  arbitrator_lte?: InputMaybe<Scalars['Bytes']>;
  arbitrator_not?: InputMaybe<Scalars['Bytes']>;
  arbitrator_not_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrator_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  clearingMeta?: InputMaybe<Scalars['String']>;
  clearingMeta_contains?: InputMaybe<Scalars['String']>;
  clearingMeta_contains_nocase?: InputMaybe<Scalars['String']>;
  clearingMeta_ends_with?: InputMaybe<Scalars['String']>;
  clearingMeta_ends_with_nocase?: InputMaybe<Scalars['String']>;
  clearingMeta_gt?: InputMaybe<Scalars['String']>;
  clearingMeta_gte?: InputMaybe<Scalars['String']>;
  clearingMeta_in?: InputMaybe<Array<Scalars['String']>>;
  clearingMeta_lt?: InputMaybe<Scalars['String']>;
  clearingMeta_lte?: InputMaybe<Scalars['String']>;
  clearingMeta_not?: InputMaybe<Scalars['String']>;
  clearingMeta_not_contains?: InputMaybe<Scalars['String']>;
  clearingMeta_not_contains_nocase?: InputMaybe<Scalars['String']>;
  clearingMeta_not_ends_with?: InputMaybe<Scalars['String']>;
  clearingMeta_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  clearingMeta_not_in?: InputMaybe<Array<Scalars['String']>>;
  clearingMeta_not_starts_with?: InputMaybe<Scalars['String']>;
  clearingMeta_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  clearingMeta_starts_with?: InputMaybe<Scalars['String']>;
  clearingMeta_starts_with_nocase?: InputMaybe<Scalars['String']>;
  extraData?: InputMaybe<Scalars['Bytes']>;
  extraData_contains?: InputMaybe<Scalars['Bytes']>;
  extraData_gt?: InputMaybe<Scalars['Bytes']>;
  extraData_gte?: InputMaybe<Scalars['Bytes']>;
  extraData_in?: InputMaybe<Array<Scalars['Bytes']>>;
  extraData_lt?: InputMaybe<Scalars['Bytes']>;
  extraData_lte?: InputMaybe<Scalars['Bytes']>;
  extraData_not?: InputMaybe<Scalars['Bytes']>;
  extraData_not_contains?: InputMaybe<Scalars['Bytes']>;
  extraData_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<ArbitratorHistory_Filter>>>;
  registrationMeta?: InputMaybe<Scalars['String']>;
  registrationMeta_contains?: InputMaybe<Scalars['String']>;
  registrationMeta_contains_nocase?: InputMaybe<Scalars['String']>;
  registrationMeta_ends_with?: InputMaybe<Scalars['String']>;
  registrationMeta_ends_with_nocase?: InputMaybe<Scalars['String']>;
  registrationMeta_gt?: InputMaybe<Scalars['String']>;
  registrationMeta_gte?: InputMaybe<Scalars['String']>;
  registrationMeta_in?: InputMaybe<Array<Scalars['String']>>;
  registrationMeta_lt?: InputMaybe<Scalars['String']>;
  registrationMeta_lte?: InputMaybe<Scalars['String']>;
  registrationMeta_not?: InputMaybe<Scalars['String']>;
  registrationMeta_not_contains?: InputMaybe<Scalars['String']>;
  registrationMeta_not_contains_nocase?: InputMaybe<Scalars['String']>;
  registrationMeta_not_ends_with?: InputMaybe<Scalars['String']>;
  registrationMeta_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  registrationMeta_not_in?: InputMaybe<Array<Scalars['String']>>;
  registrationMeta_not_starts_with?: InputMaybe<Scalars['String']>;
  registrationMeta_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  registrationMeta_starts_with?: InputMaybe<Scalars['String']>;
  registrationMeta_starts_with_nocase?: InputMaybe<Scalars['String']>;
  requests_?: InputMaybe<Request_Filter>;
  updateTime?: InputMaybe<Scalars['BigInt']>;
  updateTime_gt?: InputMaybe<Scalars['BigInt']>;
  updateTime_gte?: InputMaybe<Scalars['BigInt']>;
  updateTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updateTime_lt?: InputMaybe<Scalars['BigInt']>;
  updateTime_lte?: InputMaybe<Scalars['BigInt']>;
  updateTime_not?: InputMaybe<Scalars['BigInt']>;
  updateTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum ArbitratorHistory_OrderBy {
  Arbitrator = 'arbitrator',
  ClearingMeta = 'clearingMeta',
  ExtraData = 'extraData',
  Id = 'id',
  RegistrationMeta = 'registrationMeta',
  Requests = 'requests',
  UpdateTime = 'updateTime',
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Challenge = {
  __typename?: 'Challenge';
  challenger?: Maybe<Challenger>;
  creationTime: Scalars['BigInt'];
  disputeId: Scalars['BigInt'];
  id: Scalars['Bytes'];
  index: Scalars['BigInt'];
  nbRounds: Scalars['BigInt'];
  reason: Reason;
  request: Request;
  rounds: Array<Round>;
  ruling: Party;
};

export type ChallengeRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Round_Filter>;
};

export type Challenge_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Challenge_Filter>>>;
  challenger?: InputMaybe<Scalars['String']>;
  challenger_?: InputMaybe<Challenger_Filter>;
  challenger_contains?: InputMaybe<Scalars['String']>;
  challenger_contains_nocase?: InputMaybe<Scalars['String']>;
  challenger_ends_with?: InputMaybe<Scalars['String']>;
  challenger_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challenger_gt?: InputMaybe<Scalars['String']>;
  challenger_gte?: InputMaybe<Scalars['String']>;
  challenger_in?: InputMaybe<Array<Scalars['String']>>;
  challenger_lt?: InputMaybe<Scalars['String']>;
  challenger_lte?: InputMaybe<Scalars['String']>;
  challenger_not?: InputMaybe<Scalars['String']>;
  challenger_not_contains?: InputMaybe<Scalars['String']>;
  challenger_not_contains_nocase?: InputMaybe<Scalars['String']>;
  challenger_not_ends_with?: InputMaybe<Scalars['String']>;
  challenger_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challenger_not_in?: InputMaybe<Array<Scalars['String']>>;
  challenger_not_starts_with?: InputMaybe<Scalars['String']>;
  challenger_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  challenger_starts_with?: InputMaybe<Scalars['String']>;
  challenger_starts_with_nocase?: InputMaybe<Scalars['String']>;
  creationTime?: InputMaybe<Scalars['BigInt']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  disputeId?: InputMaybe<Scalars['BigInt']>;
  disputeId_gt?: InputMaybe<Scalars['BigInt']>;
  disputeId_gte?: InputMaybe<Scalars['BigInt']>;
  disputeId_in?: InputMaybe<Array<Scalars['BigInt']>>;
  disputeId_lt?: InputMaybe<Scalars['BigInt']>;
  disputeId_lte?: InputMaybe<Scalars['BigInt']>;
  disputeId_not?: InputMaybe<Scalars['BigInt']>;
  disputeId_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  index?: InputMaybe<Scalars['BigInt']>;
  index_gt?: InputMaybe<Scalars['BigInt']>;
  index_gte?: InputMaybe<Scalars['BigInt']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']>>;
  index_lt?: InputMaybe<Scalars['BigInt']>;
  index_lte?: InputMaybe<Scalars['BigInt']>;
  index_not?: InputMaybe<Scalars['BigInt']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbRounds?: InputMaybe<Scalars['BigInt']>;
  nbRounds_gt?: InputMaybe<Scalars['BigInt']>;
  nbRounds_gte?: InputMaybe<Scalars['BigInt']>;
  nbRounds_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbRounds_lt?: InputMaybe<Scalars['BigInt']>;
  nbRounds_lte?: InputMaybe<Scalars['BigInt']>;
  nbRounds_not?: InputMaybe<Scalars['BigInt']>;
  nbRounds_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Challenge_Filter>>>;
  reason?: InputMaybe<Scalars['String']>;
  reason_?: InputMaybe<Reason_Filter>;
  reason_contains?: InputMaybe<Scalars['String']>;
  reason_contains_nocase?: InputMaybe<Scalars['String']>;
  reason_ends_with?: InputMaybe<Scalars['String']>;
  reason_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reason_gt?: InputMaybe<Scalars['String']>;
  reason_gte?: InputMaybe<Scalars['String']>;
  reason_in?: InputMaybe<Array<Scalars['String']>>;
  reason_lt?: InputMaybe<Scalars['String']>;
  reason_lte?: InputMaybe<Scalars['String']>;
  reason_not?: InputMaybe<Scalars['String']>;
  reason_not_contains?: InputMaybe<Scalars['String']>;
  reason_not_contains_nocase?: InputMaybe<Scalars['String']>;
  reason_not_ends_with?: InputMaybe<Scalars['String']>;
  reason_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reason_not_in?: InputMaybe<Array<Scalars['String']>>;
  reason_not_starts_with?: InputMaybe<Scalars['String']>;
  reason_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  reason_starts_with?: InputMaybe<Scalars['String']>;
  reason_starts_with_nocase?: InputMaybe<Scalars['String']>;
  request?: InputMaybe<Scalars['String']>;
  request_?: InputMaybe<Request_Filter>;
  request_contains?: InputMaybe<Scalars['String']>;
  request_contains_nocase?: InputMaybe<Scalars['String']>;
  request_ends_with?: InputMaybe<Scalars['String']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']>;
  request_gt?: InputMaybe<Scalars['String']>;
  request_gte?: InputMaybe<Scalars['String']>;
  request_in?: InputMaybe<Array<Scalars['String']>>;
  request_lt?: InputMaybe<Scalars['String']>;
  request_lte?: InputMaybe<Scalars['String']>;
  request_not?: InputMaybe<Scalars['String']>;
  request_not_contains?: InputMaybe<Scalars['String']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']>;
  request_not_ends_with?: InputMaybe<Scalars['String']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  request_not_in?: InputMaybe<Array<Scalars['String']>>;
  request_not_starts_with?: InputMaybe<Scalars['String']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  request_starts_with?: InputMaybe<Scalars['String']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rounds_?: InputMaybe<Round_Filter>;
  ruling?: InputMaybe<Scalars['String']>;
  ruling_?: InputMaybe<Party_Filter>;
  ruling_contains?: InputMaybe<Scalars['String']>;
  ruling_contains_nocase?: InputMaybe<Scalars['String']>;
  ruling_ends_with?: InputMaybe<Scalars['String']>;
  ruling_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ruling_gt?: InputMaybe<Scalars['String']>;
  ruling_gte?: InputMaybe<Scalars['String']>;
  ruling_in?: InputMaybe<Array<Scalars['String']>>;
  ruling_lt?: InputMaybe<Scalars['String']>;
  ruling_lte?: InputMaybe<Scalars['String']>;
  ruling_not?: InputMaybe<Scalars['String']>;
  ruling_not_contains?: InputMaybe<Scalars['String']>;
  ruling_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ruling_not_ends_with?: InputMaybe<Scalars['String']>;
  ruling_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ruling_not_in?: InputMaybe<Array<Scalars['String']>>;
  ruling_not_starts_with?: InputMaybe<Scalars['String']>;
  ruling_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ruling_starts_with?: InputMaybe<Scalars['String']>;
  ruling_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Challenge_OrderBy {
  Challenger = 'challenger',
  ChallengerId = 'challenger__id',
  CreationTime = 'creationTime',
  DisputeId = 'disputeId',
  Id = 'id',
  Index = 'index',
  NbRounds = 'nbRounds',
  Reason = 'reason',
  ReasonCount = 'reason__count',
  ReasonId = 'reason__id',
  Request = 'request',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestId = 'request__id',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation',
  Rounds = 'rounds',
  Ruling = 'ruling',
  RulingCount = 'ruling__count',
  RulingId = 'ruling__id',
}

export type Challenger = {
  __typename?: 'Challenger';
  challenges: Array<Challenge>;
  id: Scalars['Bytes'];
  wins: Array<Request>;
};

export type ChallengerChallengesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type ChallengerWinsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Request_Filter>;
};

export type ChallengerFund = Fund & {
  __typename?: 'ChallengerFund';
  amount: Scalars['BigInt'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt'];
  id: Scalars['Bytes'];
  round: Round;
};

export type ChallengerFundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type ChallengerFund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<ChallengerFund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<ChallengerFund_Filter>>>;
  round_?: InputMaybe<Round_Filter>;
};

export enum ChallengerFund_OrderBy {
  Amount = 'amount',
  Contributions = 'contributions',
  FeeRewards = 'feeRewards',
  Id = 'id',
  Round = 'round',
  RoundCreationTime = 'round__creationTime',
  RoundId = 'round__id',
  RoundIndex = 'round__index',
}

export type Challenger_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Challenger_Filter>>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Challenger_Filter>>>;
  wins_?: InputMaybe<Request_Filter>;
};

export enum Challenger_OrderBy {
  Challenges = 'challenges',
  Id = 'id',
  Wins = 'wins',
}

export type Claimer = {
  __typename?: 'Claimer';
  currentRequest?: Maybe<Request>;
  id: Scalars['Bytes'];
  name?: Maybe<Scalars['String']>;
  nbVouchesReceived: Scalars['BigInt'];
  registration?: Maybe<Registration>;
  vouches: Array<Vouch>;
  vouchesReceived: Array<Vouch>;
};

export type ClaimerVouchesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Vouch_Filter>;
};

export type ClaimerVouchesReceivedArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Vouch_Filter>;
};

export type Claimer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Claimer_Filter>>>;
  currentRequest?: InputMaybe<Scalars['String']>;
  currentRequest_?: InputMaybe<Request_Filter>;
  currentRequest_contains?: InputMaybe<Scalars['String']>;
  currentRequest_contains_nocase?: InputMaybe<Scalars['String']>;
  currentRequest_ends_with?: InputMaybe<Scalars['String']>;
  currentRequest_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentRequest_gt?: InputMaybe<Scalars['String']>;
  currentRequest_gte?: InputMaybe<Scalars['String']>;
  currentRequest_in?: InputMaybe<Array<Scalars['String']>>;
  currentRequest_lt?: InputMaybe<Scalars['String']>;
  currentRequest_lte?: InputMaybe<Scalars['String']>;
  currentRequest_not?: InputMaybe<Scalars['String']>;
  currentRequest_not_contains?: InputMaybe<Scalars['String']>;
  currentRequest_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentRequest_not_ends_with?: InputMaybe<Scalars['String']>;
  currentRequest_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentRequest_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentRequest_not_starts_with?: InputMaybe<Scalars['String']>;
  currentRequest_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentRequest_starts_with?: InputMaybe<Scalars['String']>;
  currentRequest_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nbVouchesReceived?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_gt?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_gte?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbVouchesReceived_lt?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_lte?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_not?: InputMaybe<Scalars['BigInt']>;
  nbVouchesReceived_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Claimer_Filter>>>;
  registration_?: InputMaybe<Registration_Filter>;
  vouchesReceived_?: InputMaybe<Vouch_Filter>;
  vouches_?: InputMaybe<Vouch_Filter>;
};

export enum Claimer_OrderBy {
  CurrentRequest = 'currentRequest',
  CurrentRequestChallengePeriodEnd = 'currentRequest__challengePeriodEnd',
  CurrentRequestCreationTime = 'currentRequest__creationTime',
  CurrentRequestId = 'currentRequest__id',
  CurrentRequestIndex = 'currentRequest__index',
  CurrentRequestLastStatusChange = 'currentRequest__lastStatusChange',
  CurrentRequestNbChallenges = 'currentRequest__nbChallenges',
  CurrentRequestRegistrationEvidenceRevokedReq = 'currentRequest__registrationEvidenceRevokedReq',
  CurrentRequestRequester = 'currentRequest__requester',
  CurrentRequestResolutionTime = 'currentRequest__resolutionTime',
  CurrentRequestRevocation = 'currentRequest__revocation',
  Id = 'id',
  Name = 'name',
  NbVouchesReceived = 'nbVouchesReceived',
  Registration = 'registration',
  RegistrationExpirationTime = 'registration__expirationTime',
  RegistrationId = 'registration__id',
  Vouches = 'vouches',
  VouchesReceived = 'vouchesReceived',
}

export type Contract = {
  __typename?: 'Contract';
  baseDeposit: Scalars['BigInt'];
  challengePeriodDuration: Scalars['BigInt'];
  humanityLifespan: Scalars['BigInt'];
  id: Scalars['Bytes'];
  latestArbitratorHistory?: Maybe<ArbitratorHistory>;
  renewalPeriodDuration: Scalars['BigInt'];
  requiredNumberOfVouches: Scalars['BigInt'];
};

export type Contract_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Contract_Filter>>>;
  baseDeposit?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_gt?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_gte?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  baseDeposit_lt?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_lte?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_not?: InputMaybe<Scalars['BigInt']>;
  baseDeposit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  challengePeriodDuration?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_gt?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_gte?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  challengePeriodDuration_lt?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_lte?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_not?: InputMaybe<Scalars['BigInt']>;
  challengePeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  humanityLifespan?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_gt?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_gte?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_in?: InputMaybe<Array<Scalars['BigInt']>>;
  humanityLifespan_lt?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_lte?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_not?: InputMaybe<Scalars['BigInt']>;
  humanityLifespan_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  latestArbitratorHistory?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_?: InputMaybe<ArbitratorHistory_Filter>;
  latestArbitratorHistory_contains?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_contains_nocase?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_ends_with?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_ends_with_nocase?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_gt?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_gte?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_in?: InputMaybe<Array<Scalars['String']>>;
  latestArbitratorHistory_lt?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_lte?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_contains?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_contains_nocase?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_ends_with?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_in?: InputMaybe<Array<Scalars['String']>>;
  latestArbitratorHistory_not_starts_with?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_starts_with?: InputMaybe<Scalars['String']>;
  latestArbitratorHistory_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Contract_Filter>>>;
  renewalPeriodDuration?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_gt?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_gte?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  renewalPeriodDuration_lt?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_lte?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_not?: InputMaybe<Scalars['BigInt']>;
  renewalPeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  requiredNumberOfVouches?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_gt?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_gte?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_in?: InputMaybe<Array<Scalars['BigInt']>>;
  requiredNumberOfVouches_lt?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_lte?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_not?: InputMaybe<Scalars['BigInt']>;
  requiredNumberOfVouches_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Contract_OrderBy {
  BaseDeposit = 'baseDeposit',
  ChallengePeriodDuration = 'challengePeriodDuration',
  HumanityLifespan = 'humanityLifespan',
  Id = 'id',
  LatestArbitratorHistory = 'latestArbitratorHistory',
  LatestArbitratorHistoryArbitrator = 'latestArbitratorHistory__arbitrator',
  LatestArbitratorHistoryClearingMeta = 'latestArbitratorHistory__clearingMeta',
  LatestArbitratorHistoryExtraData = 'latestArbitratorHistory__extraData',
  LatestArbitratorHistoryId = 'latestArbitratorHistory__id',
  LatestArbitratorHistoryRegistrationMeta = 'latestArbitratorHistory__registrationMeta',
  LatestArbitratorHistoryUpdateTime = 'latestArbitratorHistory__updateTime',
  RenewalPeriodDuration = 'renewalPeriodDuration',
  RequiredNumberOfVouches = 'requiredNumberOfVouches',
}

export type Contribution = {
  __typename?: 'Contribution';
  amount: Scalars['BigInt'];
  contributor: Scalars['Bytes'];
  fund: Fund;
  id: Scalars['Bytes'];
};

export type Contribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  contributor?: InputMaybe<Scalars['Bytes']>;
  contributor_contains?: InputMaybe<Scalars['Bytes']>;
  contributor_gt?: InputMaybe<Scalars['Bytes']>;
  contributor_gte?: InputMaybe<Scalars['Bytes']>;
  contributor_in?: InputMaybe<Array<Scalars['Bytes']>>;
  contributor_lt?: InputMaybe<Scalars['Bytes']>;
  contributor_lte?: InputMaybe<Scalars['Bytes']>;
  contributor_not?: InputMaybe<Scalars['Bytes']>;
  contributor_not_contains?: InputMaybe<Scalars['Bytes']>;
  contributor_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  fund?: InputMaybe<Scalars['String']>;
  fund_?: InputMaybe<Fund_Filter>;
  fund_contains?: InputMaybe<Scalars['String']>;
  fund_contains_nocase?: InputMaybe<Scalars['String']>;
  fund_ends_with?: InputMaybe<Scalars['String']>;
  fund_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fund_gt?: InputMaybe<Scalars['String']>;
  fund_gte?: InputMaybe<Scalars['String']>;
  fund_in?: InputMaybe<Array<Scalars['String']>>;
  fund_lt?: InputMaybe<Scalars['String']>;
  fund_lte?: InputMaybe<Scalars['String']>;
  fund_not?: InputMaybe<Scalars['String']>;
  fund_not_contains?: InputMaybe<Scalars['String']>;
  fund_not_contains_nocase?: InputMaybe<Scalars['String']>;
  fund_not_ends_with?: InputMaybe<Scalars['String']>;
  fund_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fund_not_in?: InputMaybe<Array<Scalars['String']>>;
  fund_not_starts_with?: InputMaybe<Scalars['String']>;
  fund_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fund_starts_with?: InputMaybe<Scalars['String']>;
  fund_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
};

export enum Contribution_OrderBy {
  Amount = 'amount',
  Contributor = 'contributor',
  Fund = 'fund',
  FundAmount = 'fund__amount',
  FundFeeRewards = 'fund__feeRewards',
  FundId = 'fund__id',
  Id = 'id',
}

export type CrossChainGateway = {
  __typename?: 'CrossChainGateway';
  foreignProxy: Scalars['Bytes'];
  id: Scalars['Bytes'];
};

export type CrossChainGateway_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CrossChainGateway_Filter>>>;
  foreignProxy?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_contains?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_gt?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_gte?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  foreignProxy_lt?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_lte?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not_contains?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<CrossChainGateway_Filter>>>;
};

export enum CrossChainGateway_OrderBy {
  ForeignProxy = 'foreignProxy',
  Id = 'id',
}

export type CrossChainRegistration = {
  __typename?: 'CrossChainRegistration';
  claimer: Claimer;
  expirationTime: Scalars['BigInt'];
  id: Scalars['Bytes'];
  lastReceivedTransferTimestamp: Scalars['BigInt'];
};

export type CrossChainRegistration_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CrossChainRegistration_Filter>>>;
  claimer?: InputMaybe<Scalars['String']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_ends_with?: InputMaybe<Scalars['String']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_gt?: InputMaybe<Scalars['String']>;
  claimer_gte?: InputMaybe<Scalars['String']>;
  claimer_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_lt?: InputMaybe<Scalars['String']>;
  claimer_lte?: InputMaybe<Scalars['String']>;
  claimer_not?: InputMaybe<Scalars['String']>;
  claimer_not_contains?: InputMaybe<Scalars['String']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_starts_with?: InputMaybe<Scalars['String']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  expirationTime?: InputMaybe<Scalars['BigInt']>;
  expirationTime_gt?: InputMaybe<Scalars['BigInt']>;
  expirationTime_gte?: InputMaybe<Scalars['BigInt']>;
  expirationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expirationTime_lt?: InputMaybe<Scalars['BigInt']>;
  expirationTime_lte?: InputMaybe<Scalars['BigInt']>;
  expirationTime_not?: InputMaybe<Scalars['BigInt']>;
  expirationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastReceivedTransferTimestamp?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastReceivedTransferTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  lastReceivedTransferTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<CrossChainRegistration_Filter>>>;
};

export enum CrossChainRegistration_OrderBy {
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  ClaimerName = 'claimer__name',
  ClaimerNbVouchesReceived = 'claimer__nbVouchesReceived',
  ExpirationTime = 'expirationTime',
  Id = 'id',
  LastReceivedTransferTimestamp = 'lastReceivedTransferTimestamp',
}

export type Evidence = {
  __typename?: 'Evidence';
  creationTime: Scalars['BigInt'];
  group: EvidenceGroup;
  id: Scalars['Bytes'];
  submitter: Scalars['Bytes'];
  uri: Scalars['String'];
};

export type EvidenceGroup = {
  __typename?: 'EvidenceGroup';
  evidence: Array<Evidence>;
  id: Scalars['Bytes'];
  length: Scalars['BigInt'];
  request: Request;
};

export type EvidenceGroupEvidenceArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Evidence_Filter>;
};

export type EvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
  evidence_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  length?: InputMaybe<Scalars['BigInt']>;
  length_gt?: InputMaybe<Scalars['BigInt']>;
  length_gte?: InputMaybe<Scalars['BigInt']>;
  length_in?: InputMaybe<Array<Scalars['BigInt']>>;
  length_lt?: InputMaybe<Scalars['BigInt']>;
  length_lte?: InputMaybe<Scalars['BigInt']>;
  length_not?: InputMaybe<Scalars['BigInt']>;
  length_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
  request_?: InputMaybe<Request_Filter>;
};

export enum EvidenceGroup_OrderBy {
  Evidence = 'evidence',
  Id = 'id',
  Length = 'length',
  Request = 'request',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestId = 'request__id',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation',
}

export type Evidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  creationTime?: InputMaybe<Scalars['BigInt']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  group?: InputMaybe<Scalars['String']>;
  group_?: InputMaybe<EvidenceGroup_Filter>;
  group_contains?: InputMaybe<Scalars['String']>;
  group_contains_nocase?: InputMaybe<Scalars['String']>;
  group_ends_with?: InputMaybe<Scalars['String']>;
  group_ends_with_nocase?: InputMaybe<Scalars['String']>;
  group_gt?: InputMaybe<Scalars['String']>;
  group_gte?: InputMaybe<Scalars['String']>;
  group_in?: InputMaybe<Array<Scalars['String']>>;
  group_lt?: InputMaybe<Scalars['String']>;
  group_lte?: InputMaybe<Scalars['String']>;
  group_not?: InputMaybe<Scalars['String']>;
  group_not_contains?: InputMaybe<Scalars['String']>;
  group_not_contains_nocase?: InputMaybe<Scalars['String']>;
  group_not_ends_with?: InputMaybe<Scalars['String']>;
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  group_not_in?: InputMaybe<Array<Scalars['String']>>;
  group_not_starts_with?: InputMaybe<Scalars['String']>;
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  group_starts_with?: InputMaybe<Scalars['String']>;
  group_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  submitter?: InputMaybe<Scalars['Bytes']>;
  submitter_contains?: InputMaybe<Scalars['Bytes']>;
  submitter_gt?: InputMaybe<Scalars['Bytes']>;
  submitter_gte?: InputMaybe<Scalars['Bytes']>;
  submitter_in?: InputMaybe<Array<Scalars['Bytes']>>;
  submitter_lt?: InputMaybe<Scalars['Bytes']>;
  submitter_lte?: InputMaybe<Scalars['Bytes']>;
  submitter_not?: InputMaybe<Scalars['Bytes']>;
  submitter_not_contains?: InputMaybe<Scalars['Bytes']>;
  submitter_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  uri?: InputMaybe<Scalars['String']>;
  uri_contains?: InputMaybe<Scalars['String']>;
  uri_contains_nocase?: InputMaybe<Scalars['String']>;
  uri_ends_with?: InputMaybe<Scalars['String']>;
  uri_ends_with_nocase?: InputMaybe<Scalars['String']>;
  uri_gt?: InputMaybe<Scalars['String']>;
  uri_gte?: InputMaybe<Scalars['String']>;
  uri_in?: InputMaybe<Array<Scalars['String']>>;
  uri_lt?: InputMaybe<Scalars['String']>;
  uri_lte?: InputMaybe<Scalars['String']>;
  uri_not?: InputMaybe<Scalars['String']>;
  uri_not_contains?: InputMaybe<Scalars['String']>;
  uri_not_contains_nocase?: InputMaybe<Scalars['String']>;
  uri_not_ends_with?: InputMaybe<Scalars['String']>;
  uri_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  uri_not_in?: InputMaybe<Array<Scalars['String']>>;
  uri_not_starts_with?: InputMaybe<Scalars['String']>;
  uri_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  uri_starts_with?: InputMaybe<Scalars['String']>;
  uri_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Evidence_OrderBy {
  CreationTime = 'creationTime',
  Group = 'group',
  GroupId = 'group__id',
  GroupLength = 'group__length',
  Id = 'id',
  Submitter = 'submitter',
  Uri = 'uri',
}

export type Fund = {
  amount: Scalars['BigInt'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt'];
  id: Scalars['Bytes'];
  round: Round;
};

export type FundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type Fund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Fund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Fund_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Fund_OrderBy {
  Amount = 'amount',
  Contributions = 'contributions',
  FeeRewards = 'feeRewards',
  Id = 'id',
  Round = 'round',
  RoundCreationTime = 'round__creationTime',
  RoundId = 'round__id',
  RoundIndex = 'round__index',
}

export type Humanity = {
  __typename?: 'Humanity';
  claimerName?: Maybe<Scalars['String']>;
  id: Scalars['Bytes'];
  inTransfer: Scalars['Boolean'];
  nbBridgedRequests: Scalars['BigInt'];
  nbLegacyRequests: Scalars['BigInt'];
  nbPendingRequests: Scalars['BigInt'];
  nbRequests: Scalars['BigInt'];
  pendingRevocation: Scalars['Boolean'];
  registration?: Maybe<Registration>;
  requests: Array<Request>;
  usedVouch?: Maybe<VouchInProcess>;
  vouching: Scalars['Boolean'];
};

export type HumanityRequestsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Request_Filter>;
};

export type Humanity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Humanity_Filter>>>;
  claimerName?: InputMaybe<Scalars['String']>;
  claimerName_contains?: InputMaybe<Scalars['String']>;
  claimerName_contains_nocase?: InputMaybe<Scalars['String']>;
  claimerName_ends_with?: InputMaybe<Scalars['String']>;
  claimerName_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimerName_gt?: InputMaybe<Scalars['String']>;
  claimerName_gte?: InputMaybe<Scalars['String']>;
  claimerName_in?: InputMaybe<Array<Scalars['String']>>;
  claimerName_lt?: InputMaybe<Scalars['String']>;
  claimerName_lte?: InputMaybe<Scalars['String']>;
  claimerName_not?: InputMaybe<Scalars['String']>;
  claimerName_not_contains?: InputMaybe<Scalars['String']>;
  claimerName_not_contains_nocase?: InputMaybe<Scalars['String']>;
  claimerName_not_ends_with?: InputMaybe<Scalars['String']>;
  claimerName_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimerName_not_in?: InputMaybe<Array<Scalars['String']>>;
  claimerName_not_starts_with?: InputMaybe<Scalars['String']>;
  claimerName_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimerName_starts_with?: InputMaybe<Scalars['String']>;
  claimerName_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  inTransfer?: InputMaybe<Scalars['Boolean']>;
  inTransfer_in?: InputMaybe<Array<Scalars['Boolean']>>;
  inTransfer_not?: InputMaybe<Scalars['Boolean']>;
  inTransfer_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  nbBridgedRequests?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_gt?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_gte?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbBridgedRequests_lt?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_lte?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_not?: InputMaybe<Scalars['BigInt']>;
  nbBridgedRequests_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbLegacyRequests?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_gt?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_gte?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbLegacyRequests_lt?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_lte?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_not?: InputMaybe<Scalars['BigInt']>;
  nbLegacyRequests_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbPendingRequests?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_gt?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_gte?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbPendingRequests_lt?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_lte?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_not?: InputMaybe<Scalars['BigInt']>;
  nbPendingRequests_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbRequests?: InputMaybe<Scalars['BigInt']>;
  nbRequests_gt?: InputMaybe<Scalars['BigInt']>;
  nbRequests_gte?: InputMaybe<Scalars['BigInt']>;
  nbRequests_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbRequests_lt?: InputMaybe<Scalars['BigInt']>;
  nbRequests_lte?: InputMaybe<Scalars['BigInt']>;
  nbRequests_not?: InputMaybe<Scalars['BigInt']>;
  nbRequests_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Humanity_Filter>>>;
  pendingRevocation?: InputMaybe<Scalars['Boolean']>;
  pendingRevocation_in?: InputMaybe<Array<Scalars['Boolean']>>;
  pendingRevocation_not?: InputMaybe<Scalars['Boolean']>;
  pendingRevocation_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  registration_?: InputMaybe<Registration_Filter>;
  requests_?: InputMaybe<Request_Filter>;
  usedVouch_?: InputMaybe<VouchInProcess_Filter>;
  vouching?: InputMaybe<Scalars['Boolean']>;
  vouching_in?: InputMaybe<Array<Scalars['Boolean']>>;
  vouching_not?: InputMaybe<Scalars['Boolean']>;
  vouching_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
};

export enum Humanity_OrderBy {
  ClaimerName = 'claimerName',
  Id = 'id',
  InTransfer = 'inTransfer',
  NbBridgedRequests = 'nbBridgedRequests',
  NbLegacyRequests = 'nbLegacyRequests',
  NbPendingRequests = 'nbPendingRequests',
  NbRequests = 'nbRequests',
  PendingRevocation = 'pendingRevocation',
  Registration = 'registration',
  RegistrationExpirationTime = 'registration__expirationTime',
  RegistrationId = 'registration__id',
  Requests = 'requests',
  UsedVouch = 'usedVouch',
  UsedVouchId = 'usedVouch__id',
  UsedVouchProcessed = 'usedVouch__processed',
  Vouching = 'vouching',
}

export type InTransfer = {
  __typename?: 'InTransfer';
  humanityId: Scalars['Bytes'];
  id: Scalars['Bytes'];
};

export type InTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<InTransfer_Filter>>>;
  humanityId?: InputMaybe<Scalars['Bytes']>;
  humanityId_contains?: InputMaybe<Scalars['Bytes']>;
  humanityId_gt?: InputMaybe<Scalars['Bytes']>;
  humanityId_gte?: InputMaybe<Scalars['Bytes']>;
  humanityId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  humanityId_lt?: InputMaybe<Scalars['Bytes']>;
  humanityId_lte?: InputMaybe<Scalars['Bytes']>;
  humanityId_not?: InputMaybe<Scalars['Bytes']>;
  humanityId_not_contains?: InputMaybe<Scalars['Bytes']>;
  humanityId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<InTransfer_Filter>>>;
};

export enum InTransfer_OrderBy {
  HumanityId = 'humanityId',
  Id = 'id',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type OutTransfer = {
  __typename?: 'OutTransfer';
  foreignProxy: Scalars['Bytes'];
  id: Scalars['Bytes'];
  transferHash: Scalars['Bytes'];
  transferTimestamp: Scalars['BigInt'];
};

export type OutTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<OutTransfer_Filter>>>;
  foreignProxy?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_contains?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_gt?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_gte?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  foreignProxy_lt?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_lte?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not_contains?: InputMaybe<Scalars['Bytes']>;
  foreignProxy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<OutTransfer_Filter>>>;
  transferHash?: InputMaybe<Scalars['Bytes']>;
  transferHash_contains?: InputMaybe<Scalars['Bytes']>;
  transferHash_gt?: InputMaybe<Scalars['Bytes']>;
  transferHash_gte?: InputMaybe<Scalars['Bytes']>;
  transferHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transferHash_lt?: InputMaybe<Scalars['Bytes']>;
  transferHash_lte?: InputMaybe<Scalars['Bytes']>;
  transferHash_not?: InputMaybe<Scalars['Bytes']>;
  transferHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transferHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transferTimestamp?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transferTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  transferTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum OutTransfer_OrderBy {
  ForeignProxy = 'foreignProxy',
  Id = 'id',
  TransferHash = 'transferHash',
  TransferTimestamp = 'transferTimestamp',
}

export type Party = {
  __typename?: 'Party';
  challengesWon: Array<Challenge>;
  count: Scalars['BigInt'];
  id: Scalars['ID'];
};

export type PartyChallengesWonArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type Party_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Party_Filter>>>;
  challengesWon_?: InputMaybe<Challenge_Filter>;
  count?: InputMaybe<Scalars['BigInt']>;
  count_gt?: InputMaybe<Scalars['BigInt']>;
  count_gte?: InputMaybe<Scalars['BigInt']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']>>;
  count_lt?: InputMaybe<Scalars['BigInt']>;
  count_lte?: InputMaybe<Scalars['BigInt']>;
  count_not?: InputMaybe<Scalars['BigInt']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Party_Filter>>>;
};

export enum Party_OrderBy {
  ChallengesWon = 'challengesWon',
  Count = 'count',
  Id = 'id',
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  arbitratorHistories: Array<ArbitratorHistory>;
  arbitratorHistory?: Maybe<ArbitratorHistory>;
  challenge?: Maybe<Challenge>;
  challenger?: Maybe<Challenger>;
  challengerFund?: Maybe<ChallengerFund>;
  challengerFunds: Array<ChallengerFund>;
  challengers: Array<Challenger>;
  challenges: Array<Challenge>;
  claimer?: Maybe<Claimer>;
  claimers: Array<Claimer>;
  contract?: Maybe<Contract>;
  contracts: Array<Contract>;
  contribution?: Maybe<Contribution>;
  contributions: Array<Contribution>;
  crossChainGateway?: Maybe<CrossChainGateway>;
  crossChainGateways: Array<CrossChainGateway>;
  crossChainRegistration?: Maybe<CrossChainRegistration>;
  crossChainRegistrations: Array<CrossChainRegistration>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  fund?: Maybe<Fund>;
  funds: Array<Fund>;
  humanities: Array<Humanity>;
  humanity?: Maybe<Humanity>;
  inTransfer?: Maybe<InTransfer>;
  inTransfers: Array<InTransfer>;
  outTransfer?: Maybe<OutTransfer>;
  outTransfers: Array<OutTransfer>;
  parties: Array<Party>;
  party?: Maybe<Party>;
  reason?: Maybe<Reason>;
  reasons: Array<Reason>;
  registration?: Maybe<Registration>;
  registrations: Array<Registration>;
  request?: Maybe<Request>;
  requesterFund?: Maybe<RequesterFund>;
  requesterFunds: Array<RequesterFund>;
  requests: Array<Request>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  status?: Maybe<Status>;
  statuses: Array<Status>;
  submissionSearch: Array<Claimer>;
  vouch?: Maybe<Vouch>;
  vouchInProcess?: Maybe<VouchInProcess>;
  vouchInProcesses: Array<VouchInProcess>;
  vouches: Array<Vouch>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryArbitratorHistoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ArbitratorHistory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ArbitratorHistory_Filter>;
};

export type QueryArbitratorHistoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryChallengeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryChallengerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryChallengerFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryChallengerFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ChallengerFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ChallengerFund_Filter>;
};

export type QueryChallengersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenger_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenger_Filter>;
};

export type QueryChallengesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenge_Filter>;
};

export type QueryClaimerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClaimersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claimer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Claimer_Filter>;
};

export type QueryContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contract_Filter>;
};

export type QueryContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type QueryCrossChainGatewayArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCrossChainGatewaysArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CrossChainGateway_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainGateway_Filter>;
};

export type QueryCrossChainRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCrossChainRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CrossChainRegistration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainRegistration_Filter>;
};

export type QueryEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type QueryEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type QueryFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Fund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Fund_Filter>;
};

export type QueryHumanitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Humanity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Humanity_Filter>;
};

export type QueryHumanityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryInTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryInTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InTransfer_Filter>;
};

export type QueryOutTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryOutTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OutTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutTransfer_Filter>;
};

export type QueryPartiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Party_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Party_Filter>;
};

export type QueryPartyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryReasonArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryReasonsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reason_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reason_Filter>;
};

export type QueryRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Registration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Registration_Filter>;
};

export type QueryRequestArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRequesterFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRequesterFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RequesterFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RequesterFund_Filter>;
};

export type QueryRequestsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Request_Filter>;
};

export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type QueryStatusArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryStatusesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Status_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Status_Filter>;
};

export type QuerySubmissionSearchArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  text: Scalars['String'];
  where?: InputMaybe<Claimer_Filter>;
};

export type QueryVouchArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVouchInProcessArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVouchInProcessesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VouchInProcess_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VouchInProcess_Filter>;
};

export type QueryVouchesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vouch_Filter>;
};

export type Reason = {
  __typename?: 'Reason';
  challenges: Array<Challenge>;
  count: Scalars['BigInt'];
  id: Scalars['ID'];
};

export type ReasonChallengesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type Reason_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Reason_Filter>>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  count?: InputMaybe<Scalars['BigInt']>;
  count_gt?: InputMaybe<Scalars['BigInt']>;
  count_gte?: InputMaybe<Scalars['BigInt']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']>>;
  count_lt?: InputMaybe<Scalars['BigInt']>;
  count_lte?: InputMaybe<Scalars['BigInt']>;
  count_not?: InputMaybe<Scalars['BigInt']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Reason_Filter>>>;
};

export enum Reason_OrderBy {
  Challenges = 'challenges',
  Count = 'count',
  Id = 'id',
}

export type Registration = {
  __typename?: 'Registration';
  claimer: Claimer;
  expirationTime: Scalars['BigInt'];
  humanity: Humanity;
  id: Scalars['Bytes'];
};

export type Registration_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Registration_Filter>>>;
  claimer?: InputMaybe<Scalars['String']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_ends_with?: InputMaybe<Scalars['String']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_gt?: InputMaybe<Scalars['String']>;
  claimer_gte?: InputMaybe<Scalars['String']>;
  claimer_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_lt?: InputMaybe<Scalars['String']>;
  claimer_lte?: InputMaybe<Scalars['String']>;
  claimer_not?: InputMaybe<Scalars['String']>;
  claimer_not_contains?: InputMaybe<Scalars['String']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_starts_with?: InputMaybe<Scalars['String']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  expirationTime?: InputMaybe<Scalars['BigInt']>;
  expirationTime_gt?: InputMaybe<Scalars['BigInt']>;
  expirationTime_gte?: InputMaybe<Scalars['BigInt']>;
  expirationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expirationTime_lt?: InputMaybe<Scalars['BigInt']>;
  expirationTime_lte?: InputMaybe<Scalars['BigInt']>;
  expirationTime_not?: InputMaybe<Scalars['BigInt']>;
  expirationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  humanity?: InputMaybe<Scalars['String']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_ends_with?: InputMaybe<Scalars['String']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_gt?: InputMaybe<Scalars['String']>;
  humanity_gte?: InputMaybe<Scalars['String']>;
  humanity_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_lt?: InputMaybe<Scalars['String']>;
  humanity_lte?: InputMaybe<Scalars['String']>;
  humanity_not?: InputMaybe<Scalars['String']>;
  humanity_not_contains?: InputMaybe<Scalars['String']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_starts_with?: InputMaybe<Scalars['String']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Registration_Filter>>>;
};

export enum Registration_OrderBy {
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  ClaimerName = 'claimer__name',
  ClaimerNbVouchesReceived = 'claimer__nbVouchesReceived',
  ExpirationTime = 'expirationTime',
  Humanity = 'humanity',
  HumanityClaimerName = 'humanity__claimerName',
  HumanityId = 'humanity__id',
  HumanityInTransfer = 'humanity__inTransfer',
  HumanityNbBridgedRequests = 'humanity__nbBridgedRequests',
  HumanityNbLegacyRequests = 'humanity__nbLegacyRequests',
  HumanityNbPendingRequests = 'humanity__nbPendingRequests',
  HumanityNbRequests = 'humanity__nbRequests',
  HumanityPendingRevocation = 'humanity__pendingRevocation',
  HumanityVouching = 'humanity__vouching',
  Id = 'id',
}

export type Request = {
  __typename?: 'Request';
  arbitratorHistory: ArbitratorHistory;
  challengePeriodEnd: Scalars['BigInt'];
  challenges: Array<Challenge>;
  claimer: Claimer;
  contributors: Array<Scalars['Bytes']>;
  creationTime: Scalars['BigInt'];
  evidenceGroup: EvidenceGroup;
  humanity: Humanity;
  id: Scalars['Bytes'];
  index: Scalars['BigInt'];
  lastStatusChange: Scalars['BigInt'];
  nbChallenges: Scalars['BigInt'];
  registrationEvidenceRevokedReq: Scalars['String'];
  requester: Scalars['Bytes'];
  resolutionTime: Scalars['BigInt'];
  revocation: Scalars['Boolean'];
  status: Status;
  ultimateChallenger?: Maybe<Challenger>;
  vouches: Array<VouchInProcess>;
  winnerParty?: Maybe<Party>;
};

export type RequestChallengesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type RequestVouchesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VouchInProcess_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VouchInProcess_Filter>;
};

export type Request_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Request_Filter>>>;
  arbitratorHistory?: InputMaybe<Scalars['String']>;
  arbitratorHistory_?: InputMaybe<ArbitratorHistory_Filter>;
  arbitratorHistory_contains?: InputMaybe<Scalars['String']>;
  arbitratorHistory_contains_nocase?: InputMaybe<Scalars['String']>;
  arbitratorHistory_ends_with?: InputMaybe<Scalars['String']>;
  arbitratorHistory_ends_with_nocase?: InputMaybe<Scalars['String']>;
  arbitratorHistory_gt?: InputMaybe<Scalars['String']>;
  arbitratorHistory_gte?: InputMaybe<Scalars['String']>;
  arbitratorHistory_in?: InputMaybe<Array<Scalars['String']>>;
  arbitratorHistory_lt?: InputMaybe<Scalars['String']>;
  arbitratorHistory_lte?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_contains?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_contains_nocase?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_ends_with?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_in?: InputMaybe<Array<Scalars['String']>>;
  arbitratorHistory_not_starts_with?: InputMaybe<Scalars['String']>;
  arbitratorHistory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  arbitratorHistory_starts_with?: InputMaybe<Scalars['String']>;
  arbitratorHistory_starts_with_nocase?: InputMaybe<Scalars['String']>;
  challengePeriodEnd?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_gt?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_gte?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_in?: InputMaybe<Array<Scalars['BigInt']>>;
  challengePeriodEnd_lt?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_lte?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_not?: InputMaybe<Scalars['BigInt']>;
  challengePeriodEnd_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  claimer?: InputMaybe<Scalars['String']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_ends_with?: InputMaybe<Scalars['String']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_gt?: InputMaybe<Scalars['String']>;
  claimer_gte?: InputMaybe<Scalars['String']>;
  claimer_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_lt?: InputMaybe<Scalars['String']>;
  claimer_lte?: InputMaybe<Scalars['String']>;
  claimer_not?: InputMaybe<Scalars['String']>;
  claimer_not_contains?: InputMaybe<Scalars['String']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_starts_with?: InputMaybe<Scalars['String']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contributors?: InputMaybe<Array<Scalars['Bytes']>>;
  contributors_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  contributors_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  contributors_not?: InputMaybe<Array<Scalars['Bytes']>>;
  contributors_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  contributors_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  creationTime?: InputMaybe<Scalars['BigInt']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  evidenceGroup?: InputMaybe<Scalars['String']>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars['String']>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars['String']>;
  evidenceGroup_ends_with?: InputMaybe<Scalars['String']>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars['String']>;
  evidenceGroup_gt?: InputMaybe<Scalars['String']>;
  evidenceGroup_gte?: InputMaybe<Scalars['String']>;
  evidenceGroup_in?: InputMaybe<Array<Scalars['String']>>;
  evidenceGroup_lt?: InputMaybe<Scalars['String']>;
  evidenceGroup_lte?: InputMaybe<Scalars['String']>;
  evidenceGroup_not?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_contains?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars['String']>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars['String']>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  evidenceGroup_starts_with?: InputMaybe<Scalars['String']>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars['String']>;
  humanity?: InputMaybe<Scalars['String']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_ends_with?: InputMaybe<Scalars['String']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_gt?: InputMaybe<Scalars['String']>;
  humanity_gte?: InputMaybe<Scalars['String']>;
  humanity_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_lt?: InputMaybe<Scalars['String']>;
  humanity_lte?: InputMaybe<Scalars['String']>;
  humanity_not?: InputMaybe<Scalars['String']>;
  humanity_not_contains?: InputMaybe<Scalars['String']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_starts_with?: InputMaybe<Scalars['String']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  index?: InputMaybe<Scalars['BigInt']>;
  index_gt?: InputMaybe<Scalars['BigInt']>;
  index_gte?: InputMaybe<Scalars['BigInt']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']>>;
  index_lt?: InputMaybe<Scalars['BigInt']>;
  index_lte?: InputMaybe<Scalars['BigInt']>;
  index_not?: InputMaybe<Scalars['BigInt']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastStatusChange?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_gt?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_gte?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastStatusChange_lt?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_lte?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_not?: InputMaybe<Scalars['BigInt']>;
  lastStatusChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbChallenges?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_gt?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_gte?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbChallenges_lt?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_lte?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_not?: InputMaybe<Scalars['BigInt']>;
  nbChallenges_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Request_Filter>>>;
  registrationEvidenceRevokedReq?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_contains?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_contains_nocase?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_ends_with?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_ends_with_nocase?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_gt?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_gte?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_in?: InputMaybe<Array<Scalars['String']>>;
  registrationEvidenceRevokedReq_lt?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_lte?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_contains?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_contains_nocase?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_ends_with?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_in?: InputMaybe<Array<Scalars['String']>>;
  registrationEvidenceRevokedReq_not_starts_with?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_starts_with?: InputMaybe<Scalars['String']>;
  registrationEvidenceRevokedReq_starts_with_nocase?: InputMaybe<Scalars['String']>;
  requester?: InputMaybe<Scalars['Bytes']>;
  requester_contains?: InputMaybe<Scalars['Bytes']>;
  requester_gt?: InputMaybe<Scalars['Bytes']>;
  requester_gte?: InputMaybe<Scalars['Bytes']>;
  requester_in?: InputMaybe<Array<Scalars['Bytes']>>;
  requester_lt?: InputMaybe<Scalars['Bytes']>;
  requester_lte?: InputMaybe<Scalars['Bytes']>;
  requester_not?: InputMaybe<Scalars['Bytes']>;
  requester_not_contains?: InputMaybe<Scalars['Bytes']>;
  requester_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  resolutionTime?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_gt?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_gte?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  resolutionTime_lt?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_lte?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_not?: InputMaybe<Scalars['BigInt']>;
  resolutionTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  revocation?: InputMaybe<Scalars['Boolean']>;
  revocation_in?: InputMaybe<Array<Scalars['Boolean']>>;
  revocation_not?: InputMaybe<Scalars['Boolean']>;
  revocation_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  status?: InputMaybe<Scalars['String']>;
  status_?: InputMaybe<Status_Filter>;
  status_contains?: InputMaybe<Scalars['String']>;
  status_contains_nocase?: InputMaybe<Scalars['String']>;
  status_ends_with?: InputMaybe<Scalars['String']>;
  status_ends_with_nocase?: InputMaybe<Scalars['String']>;
  status_gt?: InputMaybe<Scalars['String']>;
  status_gte?: InputMaybe<Scalars['String']>;
  status_in?: InputMaybe<Array<Scalars['String']>>;
  status_lt?: InputMaybe<Scalars['String']>;
  status_lte?: InputMaybe<Scalars['String']>;
  status_not?: InputMaybe<Scalars['String']>;
  status_not_contains?: InputMaybe<Scalars['String']>;
  status_not_contains_nocase?: InputMaybe<Scalars['String']>;
  status_not_ends_with?: InputMaybe<Scalars['String']>;
  status_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  status_not_in?: InputMaybe<Array<Scalars['String']>>;
  status_not_starts_with?: InputMaybe<Scalars['String']>;
  status_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  status_starts_with?: InputMaybe<Scalars['String']>;
  status_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger?: InputMaybe<Scalars['String']>;
  ultimateChallenger_?: InputMaybe<Challenger_Filter>;
  ultimateChallenger_contains?: InputMaybe<Scalars['String']>;
  ultimateChallenger_contains_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger_ends_with?: InputMaybe<Scalars['String']>;
  ultimateChallenger_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger_gt?: InputMaybe<Scalars['String']>;
  ultimateChallenger_gte?: InputMaybe<Scalars['String']>;
  ultimateChallenger_in?: InputMaybe<Array<Scalars['String']>>;
  ultimateChallenger_lt?: InputMaybe<Scalars['String']>;
  ultimateChallenger_lte?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_contains?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_ends_with?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_in?: InputMaybe<Array<Scalars['String']>>;
  ultimateChallenger_not_starts_with?: InputMaybe<Scalars['String']>;
  ultimateChallenger_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ultimateChallenger_starts_with?: InputMaybe<Scalars['String']>;
  ultimateChallenger_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vouches_?: InputMaybe<VouchInProcess_Filter>;
  winnerParty?: InputMaybe<Scalars['String']>;
  winnerParty_?: InputMaybe<Party_Filter>;
  winnerParty_contains?: InputMaybe<Scalars['String']>;
  winnerParty_contains_nocase?: InputMaybe<Scalars['String']>;
  winnerParty_ends_with?: InputMaybe<Scalars['String']>;
  winnerParty_ends_with_nocase?: InputMaybe<Scalars['String']>;
  winnerParty_gt?: InputMaybe<Scalars['String']>;
  winnerParty_gte?: InputMaybe<Scalars['String']>;
  winnerParty_in?: InputMaybe<Array<Scalars['String']>>;
  winnerParty_lt?: InputMaybe<Scalars['String']>;
  winnerParty_lte?: InputMaybe<Scalars['String']>;
  winnerParty_not?: InputMaybe<Scalars['String']>;
  winnerParty_not_contains?: InputMaybe<Scalars['String']>;
  winnerParty_not_contains_nocase?: InputMaybe<Scalars['String']>;
  winnerParty_not_ends_with?: InputMaybe<Scalars['String']>;
  winnerParty_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  winnerParty_not_in?: InputMaybe<Array<Scalars['String']>>;
  winnerParty_not_starts_with?: InputMaybe<Scalars['String']>;
  winnerParty_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  winnerParty_starts_with?: InputMaybe<Scalars['String']>;
  winnerParty_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Request_OrderBy {
  ArbitratorHistory = 'arbitratorHistory',
  ArbitratorHistoryArbitrator = 'arbitratorHistory__arbitrator',
  ArbitratorHistoryClearingMeta = 'arbitratorHistory__clearingMeta',
  ArbitratorHistoryExtraData = 'arbitratorHistory__extraData',
  ArbitratorHistoryId = 'arbitratorHistory__id',
  ArbitratorHistoryRegistrationMeta = 'arbitratorHistory__registrationMeta',
  ArbitratorHistoryUpdateTime = 'arbitratorHistory__updateTime',
  ChallengePeriodEnd = 'challengePeriodEnd',
  Challenges = 'challenges',
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  ClaimerName = 'claimer__name',
  ClaimerNbVouchesReceived = 'claimer__nbVouchesReceived',
  Contributors = 'contributors',
  CreationTime = 'creationTime',
  EvidenceGroup = 'evidenceGroup',
  EvidenceGroupId = 'evidenceGroup__id',
  EvidenceGroupLength = 'evidenceGroup__length',
  Humanity = 'humanity',
  HumanityClaimerName = 'humanity__claimerName',
  HumanityId = 'humanity__id',
  HumanityInTransfer = 'humanity__inTransfer',
  HumanityNbBridgedRequests = 'humanity__nbBridgedRequests',
  HumanityNbLegacyRequests = 'humanity__nbLegacyRequests',
  HumanityNbPendingRequests = 'humanity__nbPendingRequests',
  HumanityNbRequests = 'humanity__nbRequests',
  HumanityPendingRevocation = 'humanity__pendingRevocation',
  HumanityVouching = 'humanity__vouching',
  Id = 'id',
  Index = 'index',
  LastStatusChange = 'lastStatusChange',
  NbChallenges = 'nbChallenges',
  RegistrationEvidenceRevokedReq = 'registrationEvidenceRevokedReq',
  Requester = 'requester',
  ResolutionTime = 'resolutionTime',
  Revocation = 'revocation',
  Status = 'status',
  StatusCount = 'status__count',
  StatusId = 'status__id',
  UltimateChallenger = 'ultimateChallenger',
  UltimateChallengerId = 'ultimateChallenger__id',
  Vouches = 'vouches',
  WinnerParty = 'winnerParty',
  WinnerPartyCount = 'winnerParty__count',
  WinnerPartyId = 'winnerParty__id',
}

export type RequesterFund = Fund & {
  __typename?: 'RequesterFund';
  amount: Scalars['BigInt'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt'];
  id: Scalars['Bytes'];
  round: Round;
};

export type RequesterFundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type RequesterFund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<RequesterFund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<RequesterFund_Filter>>>;
  round_?: InputMaybe<Round_Filter>;
};

export enum RequesterFund_OrderBy {
  Amount = 'amount',
  Contributions = 'contributions',
  FeeRewards = 'feeRewards',
  Id = 'id',
  Round = 'round',
  RoundCreationTime = 'round__creationTime',
  RoundId = 'round__id',
  RoundIndex = 'round__index',
}

export type Round = {
  __typename?: 'Round';
  challenge: Challenge;
  challengerFund?: Maybe<ChallengerFund>;
  creationTime: Scalars['BigInt'];
  id: Scalars['Bytes'];
  index: Scalars['BigInt'];
  requesterFund: RequesterFund;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  challenge?: InputMaybe<Scalars['String']>;
  challenge_?: InputMaybe<Challenge_Filter>;
  challenge_contains?: InputMaybe<Scalars['String']>;
  challenge_contains_nocase?: InputMaybe<Scalars['String']>;
  challenge_ends_with?: InputMaybe<Scalars['String']>;
  challenge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challenge_gt?: InputMaybe<Scalars['String']>;
  challenge_gte?: InputMaybe<Scalars['String']>;
  challenge_in?: InputMaybe<Array<Scalars['String']>>;
  challenge_lt?: InputMaybe<Scalars['String']>;
  challenge_lte?: InputMaybe<Scalars['String']>;
  challenge_not?: InputMaybe<Scalars['String']>;
  challenge_not_contains?: InputMaybe<Scalars['String']>;
  challenge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  challenge_not_ends_with?: InputMaybe<Scalars['String']>;
  challenge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challenge_not_in?: InputMaybe<Array<Scalars['String']>>;
  challenge_not_starts_with?: InputMaybe<Scalars['String']>;
  challenge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  challenge_starts_with?: InputMaybe<Scalars['String']>;
  challenge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  challengerFund?: InputMaybe<Scalars['String']>;
  challengerFund_?: InputMaybe<ChallengerFund_Filter>;
  challengerFund_contains?: InputMaybe<Scalars['String']>;
  challengerFund_contains_nocase?: InputMaybe<Scalars['String']>;
  challengerFund_ends_with?: InputMaybe<Scalars['String']>;
  challengerFund_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challengerFund_gt?: InputMaybe<Scalars['String']>;
  challengerFund_gte?: InputMaybe<Scalars['String']>;
  challengerFund_in?: InputMaybe<Array<Scalars['String']>>;
  challengerFund_lt?: InputMaybe<Scalars['String']>;
  challengerFund_lte?: InputMaybe<Scalars['String']>;
  challengerFund_not?: InputMaybe<Scalars['String']>;
  challengerFund_not_contains?: InputMaybe<Scalars['String']>;
  challengerFund_not_contains_nocase?: InputMaybe<Scalars['String']>;
  challengerFund_not_ends_with?: InputMaybe<Scalars['String']>;
  challengerFund_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  challengerFund_not_in?: InputMaybe<Array<Scalars['String']>>;
  challengerFund_not_starts_with?: InputMaybe<Scalars['String']>;
  challengerFund_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  challengerFund_starts_with?: InputMaybe<Scalars['String']>;
  challengerFund_starts_with_nocase?: InputMaybe<Scalars['String']>;
  creationTime?: InputMaybe<Scalars['BigInt']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  index?: InputMaybe<Scalars['BigInt']>;
  index_gt?: InputMaybe<Scalars['BigInt']>;
  index_gte?: InputMaybe<Scalars['BigInt']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']>>;
  index_lt?: InputMaybe<Scalars['BigInt']>;
  index_lte?: InputMaybe<Scalars['BigInt']>;
  index_not?: InputMaybe<Scalars['BigInt']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  requesterFund?: InputMaybe<Scalars['String']>;
  requesterFund_?: InputMaybe<RequesterFund_Filter>;
  requesterFund_contains?: InputMaybe<Scalars['String']>;
  requesterFund_contains_nocase?: InputMaybe<Scalars['String']>;
  requesterFund_ends_with?: InputMaybe<Scalars['String']>;
  requesterFund_ends_with_nocase?: InputMaybe<Scalars['String']>;
  requesterFund_gt?: InputMaybe<Scalars['String']>;
  requesterFund_gte?: InputMaybe<Scalars['String']>;
  requesterFund_in?: InputMaybe<Array<Scalars['String']>>;
  requesterFund_lt?: InputMaybe<Scalars['String']>;
  requesterFund_lte?: InputMaybe<Scalars['String']>;
  requesterFund_not?: InputMaybe<Scalars['String']>;
  requesterFund_not_contains?: InputMaybe<Scalars['String']>;
  requesterFund_not_contains_nocase?: InputMaybe<Scalars['String']>;
  requesterFund_not_ends_with?: InputMaybe<Scalars['String']>;
  requesterFund_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  requesterFund_not_in?: InputMaybe<Array<Scalars['String']>>;
  requesterFund_not_starts_with?: InputMaybe<Scalars['String']>;
  requesterFund_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  requesterFund_starts_with?: InputMaybe<Scalars['String']>;
  requesterFund_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Round_OrderBy {
  Challenge = 'challenge',
  ChallengeCreationTime = 'challenge__creationTime',
  ChallengeDisputeId = 'challenge__disputeId',
  ChallengeId = 'challenge__id',
  ChallengeIndex = 'challenge__index',
  ChallengeNbRounds = 'challenge__nbRounds',
  ChallengerFund = 'challengerFund',
  ChallengerFundAmount = 'challengerFund__amount',
  ChallengerFundFeeRewards = 'challengerFund__feeRewards',
  ChallengerFundId = 'challengerFund__id',
  CreationTime = 'creationTime',
  Id = 'id',
  Index = 'index',
  RequesterFund = 'requesterFund',
  RequesterFundAmount = 'requesterFund__amount',
  RequesterFundFeeRewards = 'requesterFund__feeRewards',
  RequesterFundId = 'requesterFund__id',
}

export type Status = {
  __typename?: 'Status';
  count: Scalars['BigInt'];
  id: Scalars['ID'];
  requests: Array<Request>;
};

export type StatusRequestsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Request_Filter>;
};

export type Status_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Status_Filter>>>;
  count?: InputMaybe<Scalars['BigInt']>;
  count_gt?: InputMaybe<Scalars['BigInt']>;
  count_gte?: InputMaybe<Scalars['BigInt']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']>>;
  count_lt?: InputMaybe<Scalars['BigInt']>;
  count_lte?: InputMaybe<Scalars['BigInt']>;
  count_not?: InputMaybe<Scalars['BigInt']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Status_Filter>>>;
  requests_?: InputMaybe<Request_Filter>;
};

export enum Status_OrderBy {
  Count = 'count',
  Id = 'id',
  Requests = 'requests',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  arbitratorHistories: Array<ArbitratorHistory>;
  arbitratorHistory?: Maybe<ArbitratorHistory>;
  challenge?: Maybe<Challenge>;
  challenger?: Maybe<Challenger>;
  challengerFund?: Maybe<ChallengerFund>;
  challengerFunds: Array<ChallengerFund>;
  challengers: Array<Challenger>;
  challenges: Array<Challenge>;
  claimer?: Maybe<Claimer>;
  claimers: Array<Claimer>;
  contract?: Maybe<Contract>;
  contracts: Array<Contract>;
  contribution?: Maybe<Contribution>;
  contributions: Array<Contribution>;
  crossChainGateway?: Maybe<CrossChainGateway>;
  crossChainGateways: Array<CrossChainGateway>;
  crossChainRegistration?: Maybe<CrossChainRegistration>;
  crossChainRegistrations: Array<CrossChainRegistration>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  fund?: Maybe<Fund>;
  funds: Array<Fund>;
  humanities: Array<Humanity>;
  humanity?: Maybe<Humanity>;
  inTransfer?: Maybe<InTransfer>;
  inTransfers: Array<InTransfer>;
  outTransfer?: Maybe<OutTransfer>;
  outTransfers: Array<OutTransfer>;
  parties: Array<Party>;
  party?: Maybe<Party>;
  reason?: Maybe<Reason>;
  reasons: Array<Reason>;
  registration?: Maybe<Registration>;
  registrations: Array<Registration>;
  request?: Maybe<Request>;
  requesterFund?: Maybe<RequesterFund>;
  requesterFunds: Array<RequesterFund>;
  requests: Array<Request>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  status?: Maybe<Status>;
  statuses: Array<Status>;
  vouch?: Maybe<Vouch>;
  vouchInProcess?: Maybe<VouchInProcess>;
  vouchInProcesses: Array<VouchInProcess>;
  vouches: Array<Vouch>;
};

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type SubscriptionArbitratorHistoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ArbitratorHistory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ArbitratorHistory_Filter>;
};

export type SubscriptionArbitratorHistoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionChallengeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionChallengerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionChallengerFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionChallengerFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ChallengerFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ChallengerFund_Filter>;
};

export type SubscriptionChallengersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenger_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenger_Filter>;
};

export type SubscriptionChallengesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenge_Filter>;
};

export type SubscriptionClaimerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClaimersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claimer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Claimer_Filter>;
};

export type SubscriptionContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contract_Filter>;
};

export type SubscriptionContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type SubscriptionCrossChainGatewayArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCrossChainGatewaysArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CrossChainGateway_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainGateway_Filter>;
};

export type SubscriptionCrossChainRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCrossChainRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CrossChainRegistration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainRegistration_Filter>;
};

export type SubscriptionEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type SubscriptionEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type SubscriptionFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Fund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Fund_Filter>;
};

export type SubscriptionHumanitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Humanity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Humanity_Filter>;
};

export type SubscriptionHumanityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionInTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionInTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InTransfer_Filter>;
};

export type SubscriptionOutTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionOutTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OutTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutTransfer_Filter>;
};

export type SubscriptionPartiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Party_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Party_Filter>;
};

export type SubscriptionPartyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionReasonArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionReasonsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reason_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reason_Filter>;
};

export type SubscriptionRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Registration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Registration_Filter>;
};

export type SubscriptionRequestArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRequesterFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRequesterFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RequesterFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RequesterFund_Filter>;
};

export type SubscriptionRequestsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Request_Filter>;
};

export type SubscriptionRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type SubscriptionStatusArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionStatusesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Status_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Status_Filter>;
};

export type SubscriptionVouchArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVouchInProcessArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVouchInProcessesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VouchInProcess_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VouchInProcess_Filter>;
};

export type SubscriptionVouchesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vouch_Filter>;
};

export type Vouch = {
  __typename?: 'Vouch';
  for: Claimer;
  from: Claimer;
  humanity: Humanity;
  id: Scalars['Bytes'];
};

export type VouchInProcess = {
  __typename?: 'VouchInProcess';
  id: Scalars['Bytes'];
  processed: Scalars['Boolean'];
  request: Request;
  vouch: Vouch;
  voucher: Humanity;
};

export type VouchInProcess_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VouchInProcess_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<VouchInProcess_Filter>>>;
  processed?: InputMaybe<Scalars['Boolean']>;
  processed_in?: InputMaybe<Array<Scalars['Boolean']>>;
  processed_not?: InputMaybe<Scalars['Boolean']>;
  processed_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  request?: InputMaybe<Scalars['String']>;
  request_?: InputMaybe<Request_Filter>;
  request_contains?: InputMaybe<Scalars['String']>;
  request_contains_nocase?: InputMaybe<Scalars['String']>;
  request_ends_with?: InputMaybe<Scalars['String']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']>;
  request_gt?: InputMaybe<Scalars['String']>;
  request_gte?: InputMaybe<Scalars['String']>;
  request_in?: InputMaybe<Array<Scalars['String']>>;
  request_lt?: InputMaybe<Scalars['String']>;
  request_lte?: InputMaybe<Scalars['String']>;
  request_not?: InputMaybe<Scalars['String']>;
  request_not_contains?: InputMaybe<Scalars['String']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']>;
  request_not_ends_with?: InputMaybe<Scalars['String']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  request_not_in?: InputMaybe<Array<Scalars['String']>>;
  request_not_starts_with?: InputMaybe<Scalars['String']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  request_starts_with?: InputMaybe<Scalars['String']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vouch?: InputMaybe<Scalars['String']>;
  vouch_?: InputMaybe<Vouch_Filter>;
  vouch_contains?: InputMaybe<Scalars['String']>;
  vouch_contains_nocase?: InputMaybe<Scalars['String']>;
  vouch_ends_with?: InputMaybe<Scalars['String']>;
  vouch_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vouch_gt?: InputMaybe<Scalars['String']>;
  vouch_gte?: InputMaybe<Scalars['String']>;
  vouch_in?: InputMaybe<Array<Scalars['String']>>;
  vouch_lt?: InputMaybe<Scalars['String']>;
  vouch_lte?: InputMaybe<Scalars['String']>;
  vouch_not?: InputMaybe<Scalars['String']>;
  vouch_not_contains?: InputMaybe<Scalars['String']>;
  vouch_not_contains_nocase?: InputMaybe<Scalars['String']>;
  vouch_not_ends_with?: InputMaybe<Scalars['String']>;
  vouch_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vouch_not_in?: InputMaybe<Array<Scalars['String']>>;
  vouch_not_starts_with?: InputMaybe<Scalars['String']>;
  vouch_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vouch_starts_with?: InputMaybe<Scalars['String']>;
  vouch_starts_with_nocase?: InputMaybe<Scalars['String']>;
  voucher?: InputMaybe<Scalars['String']>;
  voucher_?: InputMaybe<Humanity_Filter>;
  voucher_contains?: InputMaybe<Scalars['String']>;
  voucher_contains_nocase?: InputMaybe<Scalars['String']>;
  voucher_ends_with?: InputMaybe<Scalars['String']>;
  voucher_ends_with_nocase?: InputMaybe<Scalars['String']>;
  voucher_gt?: InputMaybe<Scalars['String']>;
  voucher_gte?: InputMaybe<Scalars['String']>;
  voucher_in?: InputMaybe<Array<Scalars['String']>>;
  voucher_lt?: InputMaybe<Scalars['String']>;
  voucher_lte?: InputMaybe<Scalars['String']>;
  voucher_not?: InputMaybe<Scalars['String']>;
  voucher_not_contains?: InputMaybe<Scalars['String']>;
  voucher_not_contains_nocase?: InputMaybe<Scalars['String']>;
  voucher_not_ends_with?: InputMaybe<Scalars['String']>;
  voucher_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  voucher_not_in?: InputMaybe<Array<Scalars['String']>>;
  voucher_not_starts_with?: InputMaybe<Scalars['String']>;
  voucher_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  voucher_starts_with?: InputMaybe<Scalars['String']>;
  voucher_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum VouchInProcess_OrderBy {
  Id = 'id',
  Processed = 'processed',
  Request = 'request',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestId = 'request__id',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation',
  Vouch = 'vouch',
  VouchId = 'vouch__id',
  Voucher = 'voucher',
  VoucherClaimerName = 'voucher__claimerName',
  VoucherId = 'voucher__id',
  VoucherInTransfer = 'voucher__inTransfer',
  VoucherNbBridgedRequests = 'voucher__nbBridgedRequests',
  VoucherNbLegacyRequests = 'voucher__nbLegacyRequests',
  VoucherNbPendingRequests = 'voucher__nbPendingRequests',
  VoucherNbRequests = 'voucher__nbRequests',
  VoucherPendingRevocation = 'voucher__pendingRevocation',
  VoucherVouching = 'voucher__vouching',
}

export type Vouch_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Vouch_Filter>>>;
  for?: InputMaybe<Scalars['String']>;
  for_?: InputMaybe<Claimer_Filter>;
  for_contains?: InputMaybe<Scalars['String']>;
  for_contains_nocase?: InputMaybe<Scalars['String']>;
  for_ends_with?: InputMaybe<Scalars['String']>;
  for_ends_with_nocase?: InputMaybe<Scalars['String']>;
  for_gt?: InputMaybe<Scalars['String']>;
  for_gte?: InputMaybe<Scalars['String']>;
  for_in?: InputMaybe<Array<Scalars['String']>>;
  for_lt?: InputMaybe<Scalars['String']>;
  for_lte?: InputMaybe<Scalars['String']>;
  for_not?: InputMaybe<Scalars['String']>;
  for_not_contains?: InputMaybe<Scalars['String']>;
  for_not_contains_nocase?: InputMaybe<Scalars['String']>;
  for_not_ends_with?: InputMaybe<Scalars['String']>;
  for_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  for_not_in?: InputMaybe<Array<Scalars['String']>>;
  for_not_starts_with?: InputMaybe<Scalars['String']>;
  for_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  for_starts_with?: InputMaybe<Scalars['String']>;
  for_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from?: InputMaybe<Scalars['String']>;
  from_?: InputMaybe<Claimer_Filter>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_contains_nocase?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']>;
  humanity?: InputMaybe<Scalars['String']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_ends_with?: InputMaybe<Scalars['String']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_gt?: InputMaybe<Scalars['String']>;
  humanity_gte?: InputMaybe<Scalars['String']>;
  humanity_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_lt?: InputMaybe<Scalars['String']>;
  humanity_lte?: InputMaybe<Scalars['String']>;
  humanity_not?: InputMaybe<Scalars['String']>;
  humanity_not_contains?: InputMaybe<Scalars['String']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  humanity_starts_with?: InputMaybe<Scalars['String']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Vouch_Filter>>>;
};

export enum Vouch_OrderBy {
  For = 'for',
  ForId = 'for__id',
  ForName = 'for__name',
  ForNbVouchesReceived = 'for__nbVouchesReceived',
  From = 'from',
  FromId = 'from__id',
  FromName = 'from__name',
  FromNbVouchesReceived = 'from__nbVouchesReceived',
  Humanity = 'humanity',
  HumanityClaimerName = 'humanity__claimerName',
  HumanityId = 'humanity__id',
  HumanityInTransfer = 'humanity__inTransfer',
  HumanityNbBridgedRequests = 'humanity__nbBridgedRequests',
  HumanityNbLegacyRequests = 'humanity__nbLegacyRequests',
  HumanityNbPendingRequests = 'humanity__nbPendingRequests',
  HumanityNbRequests = 'humanity__nbRequests',
  HumanityPendingRevocation = 'humanity__pendingRevocation',
  HumanityVouching = 'humanity__vouching',
  Id = 'id',
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type RequestsToAdvanceQueryVariables = Exact<{ [key: string]: never }>;

export type RequestsToAdvanceQuery = {
  __typename?: 'Query';
  status?: {
    __typename?: 'Status';
    requests: Array<{
      __typename?: 'Request';
      claimer: {
        __typename?: 'Claimer';
        id: any;
        vouchesReceived: Array<{
          __typename?: 'Vouch';
          humanity: {
            __typename?: 'Humanity';
            id: any;
            usedVouch?: { __typename?: 'VouchInProcess'; id: any } | null;
          };
          from: { __typename?: 'Claimer'; id: any };
        }>;
      };
      humanity: { __typename?: 'Humanity'; id: any };
      challenges: Array<{
        __typename?: 'Challenge';
        rounds: Array<{
          __typename?: 'Round';
          requesterFund: { __typename?: 'RequesterFund'; amount: any };
        }>;
      }>;
    }>;
  } | null;
};

export type ClaimerQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type ClaimerQuery = {
  __typename?: 'Query';
  claimer?: {
    __typename?: 'Claimer';
    id: any;
    name?: string | null;
    registration?: {
      __typename?: 'Registration';
      humanity: {
        __typename?: 'Humanity';
        id: any;
        winnerClaim: Array<{
          __typename?: 'Request';
          index: any;
          resolutionTime: any;
          evidenceGroup: {
            __typename?: 'EvidenceGroup';
            evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
          };
        }>;
      };
    } | null;
  } | null;
};

export type ContractQueryVariables = Exact<{ [key: string]: never }>;

export type ContractQuery = {
  __typename?: 'Query';
  contract?: {
    __typename?: 'Contract';
    baseDeposit: any;
    humanityLifespan: any;
    renewalPeriodDuration: any;
    challengePeriodDuration: any;
    requiredNumberOfVouches: any;
    latestArbitratorHistory?: {
      __typename?: 'ArbitratorHistory';
      arbitrator: any;
      extraData: any;
      updateTime: any;
      registrationMeta: string;
      clearingMeta: string;
    } | null;
  } | null;
  crossChainGateways: Array<{ __typename?: 'CrossChainGateway'; id: any; foreignProxy: any }>;
};

export type HumanityQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type HumanityQuery = {
  __typename?: 'Query';
  humanity?: {
    __typename?: 'Humanity';
    registration?: {
      __typename?: 'Registration';
      expirationTime: any;
      claimer: { __typename?: 'Claimer'; id: any; name?: string | null };
    } | null;
    requests: Array<{
      __typename?: 'Request';
      id: any;
      creationTime: any;
      lastStatusChange: any;
      index: any;
      revocation: boolean;
      registrationEvidenceRevokedReq: string;
      requester: any;
      status: { __typename?: 'Status'; id: string };
      claimer: { __typename?: 'Claimer'; id: any; name?: string | null };
      evidenceGroup: {
        __typename?: 'EvidenceGroup';
        evidence: Array<{
          __typename?: 'Evidence';
          id: any;
          uri: string;
          creationTime: any;
          submitter: any;
        }>;
      };
    }>;
    winnerClaim: Array<{
      __typename?: 'Request';
      index: any;
      resolutionTime: any;
      evidenceGroup: {
        __typename?: 'EvidenceGroup';
        evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
      };
    }>;
  } | null;
  crossChainRegistration?: {
    __typename?: 'CrossChainRegistration';
    expirationTime: any;
    lastReceivedTransferTimestamp: any;
    claimer: { __typename?: 'Claimer'; id: any };
  } | null;
  outTransfer?: {
    __typename?: 'OutTransfer';
    foreignProxy: any;
    transferHash: any;
    transferTimestamp: any;
  } | null;
};

export type MeQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type MeQuery = {
  __typename?: 'Query';
  claimer?: {
    __typename?: 'Claimer';
    registration?: { __typename?: 'Registration'; id: any } | null;
    currentRequest?: {
      __typename?: 'Request';
      index: any;
      humanity: { __typename?: 'Humanity'; id: any };
    } | null;
  } | null;
};

export type RegistrationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type RegistrationQuery = {
  __typename?: 'Query';
  registration?: {
    __typename?: 'Registration';
    expirationTime: any;
    claimer: { __typename?: 'Claimer'; id: any };
  } | null;
};

export type RequestQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type RequestQuery = {
  __typename?: 'Query';
  request?: {
    __typename?: 'Request';
    index: any;
    revocation: boolean;
    registrationEvidenceRevokedReq: string;
    requester: any;
    creationTime: any;
    lastStatusChange: any;
    status: { __typename?: 'Status'; id: string };
    vouches: Array<{
      __typename?: 'VouchInProcess';
      voucher: { __typename?: 'Humanity'; id: any };
    }>;
    humanity: {
      __typename?: 'Humanity';
      id: any;
      nbRequests: any;
      nbLegacyRequests: any;
      registration?: {
        __typename?: 'Registration';
        expirationTime: any;
        claimer: { __typename?: 'Claimer'; id: any };
      } | null;
      winnerClaim: Array<{
        __typename?: 'Request';
        index: any;
        resolutionTime: any;
        evidenceGroup: {
          __typename?: 'EvidenceGroup';
          evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
        };
      }>;
    };
    claimer: {
      __typename?: 'Claimer';
      id: any;
      name?: string | null;
      vouchesReceived: Array<{
        __typename?: 'Vouch';
        from: {
          __typename?: 'Claimer';
          id: any;
          registration?: {
            __typename?: 'Registration';
            expirationTime: any;
            humanity: { __typename?: 'Humanity'; vouching: boolean };
          } | null;
        };
        humanity: { __typename?: 'Humanity'; id: any };
      }>;
      vouches: Array<{
        __typename?: 'Vouch';
        for: { __typename?: 'Claimer'; id: any; name?: string | null };
      }>;
    };
    evidenceGroup: {
      __typename?: 'EvidenceGroup';
      evidence: Array<{
        __typename?: 'Evidence';
        id: any;
        uri: string;
        creationTime: any;
        submitter: any;
      }>;
    };
    challenges: Array<{
      __typename?: 'Challenge';
      id: any;
      disputeId: any;
      nbRounds: any;
      reason: { __typename?: 'Reason'; id: string };
      challenger?: { __typename?: 'Challenger'; id: any } | null;
      rounds: Array<{
        __typename?: 'Round';
        creationTime: any;
        index: any;
        requesterFund: { __typename?: 'RequesterFund'; amount: any };
        challengerFund?: { __typename?: 'ChallengerFund'; amount: any } | null;
      }>;
    }>;
    arbitratorHistory: {
      __typename?: 'ArbitratorHistory';
      updateTime: any;
      registrationMeta: string;
      id: string;
      arbitrator: any;
      extraData: any;
    };
  } | null;
};

export type RequestsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Request_Filter>;
}>;

export type RequestsQuery = {
  __typename?: 'Query';
  requests: Array<{
    __typename?: 'Request';
    id: any;
    index: any;
    revocation: boolean;
    registrationEvidenceRevokedReq: string;
    creationTime: any;
    lastStatusChange: any;
    requester: any;
    status: { __typename?: 'Status'; id: string };
    claimer: { __typename?: 'Claimer'; id: any; name?: string | null };
    humanity: {
      __typename?: 'Humanity';
      id: any;
      nbRequests: any;
      registration?: {
        __typename?: 'Registration';
        expirationTime: any;
        claimer: { __typename?: 'Claimer'; id: any };
      } | null;
      winnerClaim: Array<{
        __typename?: 'Request';
        index: any;
        resolutionTime: any;
        evidenceGroup: {
          __typename?: 'EvidenceGroup';
          evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
        };
      }>;
    };
    evidenceGroup: {
      __typename?: 'EvidenceGroup';
      evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
    };
  }>;
};

export type IsSyncedQueryVariables = Exact<{
  block: Scalars['Int'];
}>;

export type IsSyncedQuery = {
  __typename?: 'Query';
  _meta?: { __typename?: '_Meta_'; hasIndexingErrors: boolean } | null;
};

export type TransferQueryVariables = Exact<{
  hash: Scalars['ID'];
}>;

export type TransferQuery = {
  __typename?: 'Query';
  inTransfer?: { __typename?: 'InTransfer'; id: any; humanityId: any } | null;
};

export type HumanityVouchQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type HumanityVouchQuery = {
  __typename?: 'Query';
  humanity?: {
    __typename?: 'Humanity';
    vouching: boolean;
    registration?: { __typename?: 'Registration'; expirationTime: any } | null;
  } | null;
};

export type WinnerClaimFragment = {
  __typename?: 'Humanity';
  winnerClaim: Array<{
    __typename?: 'Request';
    index: any;
    resolutionTime: any;
    evidenceGroup: {
      __typename?: 'EvidenceGroup';
      evidence: Array<{ __typename?: 'Evidence'; uri: string }>;
    };
  }>;
};

export const WinnerClaimFragmentDoc = gql`
  fragment winnerClaim on Humanity {
    winnerClaim: requests(
      where: {
        or: [
          { revocation: false, status: "resolved", winnerParty: "requester" }
          { revocation: false, status: "transferring", winnerParty: "requester" }
        ]
      }
      orderBy: resolutionTime
      orderDirection: desc
      first: 1
    ) {
      index
      resolutionTime
      evidenceGroup {
        evidence(orderBy: creationTime, first: 1) {
          uri
        }
      }
    }
  }
`;
export const RequestsToAdvanceDocument = gql`
  query RequestsToAdvance {
    status(id: "vouching") {
      requests(orderBy: lastStatusChange) {
        claimer {
          id
          vouchesReceived {
            humanity {
              id
              usedVouch {
                id
              }
            }
            from {
              id
            }
          }
        }
        humanity {
          id
        }
        challenges {
          rounds {
            requesterFund {
              amount
            }
          }
        }
      }
    }
  }
`;
export const ClaimerDocument = gql`
  query Claimer($id: ID!) {
    claimer(id: $id) {
      id
      name
      registration {
        humanity {
          id
          ...winnerClaim
        }
      }
    }
  }
  ${WinnerClaimFragmentDoc}
`;
export const ContractDocument = gql`
  query Contract {
    contract(id: "0x00") {
      baseDeposit
      humanityLifespan
      renewalPeriodDuration
      challengePeriodDuration
      requiredNumberOfVouches
      latestArbitratorHistory {
        arbitrator
        extraData
        updateTime
        registrationMeta
        clearingMeta
      }
    }
    crossChainGateways {
      id
      foreignProxy
    }
  }
`;
export const HumanityDocument = gql`
  query Humanity($id: ID!) {
    humanity(id: $id) {
      registration {
        expirationTime
        claimer {
          id
          name
        }
      }
      requests {
        id
        status {
          id
        }
        claimer {
          id
          name
        }
        creationTime
        lastStatusChange
        index
        revocation
        registrationEvidenceRevokedReq
        requester
        evidenceGroup {
          evidence(orderBy: creationTime, first: 1) {
            id
            uri
            creationTime
            submitter
          }
        }
      }
      ...winnerClaim
    }
    crossChainRegistration(id: $id) {
      claimer {
        id
      }
      expirationTime
      lastReceivedTransferTimestamp
    }
    outTransfer(id: $id) {
      foreignProxy
      transferHash
      transferTimestamp
    }
  }
  ${WinnerClaimFragmentDoc}
`;
export const MeDocument = gql`
  query Me($id: ID!) {
    claimer(id: $id) {
      registration {
        id
      }
      currentRequest {
        index
        humanity {
          id
        }
      }
    }
  }
`;
export const RegistrationDocument = gql`
  query Registration($id: ID!) {
    registration(id: $id) {
      expirationTime
      claimer {
        id
      }
    }
  }
`;
export const RequestDocument = gql`
  query Request($id: ID!) {
    request(id: $id) {
      status {
        id
      }
      index
      revocation
      registrationEvidenceRevokedReq
      requester
      creationTime
      lastStatusChange
      vouches {
        voucher {
          id
        }
      }
      humanity {
        id
        nbRequests
        nbLegacyRequests
        registration {
          expirationTime
          claimer {
            id
          }
        }
        ...winnerClaim
      }
      claimer {
        id
        name
        vouchesReceived {
          from {
            id
            registration {
              expirationTime
              humanity {
                vouching
              }
            }
          }
          humanity {
            id
          }
        }
        vouches {
          for {
            id
            name
          }
        }
      }
      evidenceGroup {
        evidence(orderBy: creationTime, orderDirection: desc) {
          id
          uri
          creationTime
          submitter
        }
      }
      challenges(orderBy: creationTime) {
        id
        reason {
          id
        }
        disputeId
        challenger {
          id
        }
        nbRounds
        rounds(orderBy: index) {
          creationTime
          index
          requesterFund {
            amount
          }
          challengerFund {
            amount
          }
        }
      }
      arbitratorHistory {
        updateTime
        registrationMeta
        id
        arbitrator
        extraData
      }
    }
  }
  ${WinnerClaimFragmentDoc}
`;
export const RequestsDocument = gql`
  query Requests($skip: Int, $first: Int, $where: Request_filter) {
    requests(
      first: $first
      skip: $skip
      where: $where
      orderBy: creationTime
      orderDirection: desc
    ) {
      id
      index
      status {
        id
      }
      revocation
      registrationEvidenceRevokedReq
      creationTime
      lastStatusChange
      requester
      claimer {
        id
        name
      }
      humanity {
        id
        nbRequests
        registration {
          expirationTime
          claimer {
            id
          }
        }
        ...winnerClaim
      }
      evidenceGroup {
        evidence(orderBy: creationTime, first: 1) {
          uri
        }
      }
    }
  }
  ${WinnerClaimFragmentDoc}
`;
export const IsSyncedDocument = gql`
  query IsSynced($block: Int!) {
    _meta(block: { number: $block }) {
      hasIndexingErrors
    }
  }
`;
export const TransferDocument = gql`
  query Transfer($hash: ID!) {
    inTransfer(id: $hash) {
      id
      humanityId
    }
  }
`;
export const HumanityVouchDocument = gql`
  query HumanityVouch($id: ID!) {
    humanity(id: $id) {
      vouching
      registration {
        expirationTime
      }
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    RequestsToAdvance(
      variables?: RequestsToAdvanceQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<RequestsToAdvanceQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RequestsToAdvanceQuery>(RequestsToAdvanceDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'RequestsToAdvance',
        'query',
      );
    },
    Claimer(
      variables: ClaimerQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<ClaimerQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ClaimerQuery>(ClaimerDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Claimer',
        'query',
      );
    },
    Contract(
      variables?: ContractQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<ContractQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ContractQuery>(ContractDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Contract',
        'query',
      );
    },
    Humanity(
      variables: HumanityQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<HumanityQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HumanityQuery>(HumanityDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Humanity',
        'query',
      );
    },
    Me(variables: MeQueryVariables, requestHeaders?: Dom.RequestInit['headers']): Promise<MeQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MeQuery>(MeDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Me',
        'query',
      );
    },
    Registration(
      variables: RegistrationQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<RegistrationQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RegistrationQuery>(RegistrationDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Registration',
        'query',
      );
    },
    Request(
      variables: RequestQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<RequestQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RequestQuery>(RequestDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Request',
        'query',
      );
    },
    Requests(
      variables?: RequestsQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<RequestsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RequestsQuery>(RequestsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Requests',
        'query',
      );
    },
    IsSynced(
      variables: IsSyncedQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<IsSyncedQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IsSyncedQuery>(IsSyncedDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'IsSynced',
        'query',
      );
    },
    Transfer(
      variables: TransferQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<TransferQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TransferQuery>(TransferDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Transfer',
        'query',
      );
    },
    HumanityVouch(
      variables: HumanityVouchQueryVariables,
      requestHeaders?: Dom.RequestInit['headers'],
    ): Promise<HumanityVouchQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HumanityVouchQuery>(HumanityVouchDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'HumanityVouch',
        'query',
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
