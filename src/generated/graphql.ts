import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

/** Indicates whether the current, partially filled bucket should be included in the response. Defaults to `exclude` */
export enum Aggregation_Current {
  /** Exclude the current, partially filled bucket from the response */
  Exclude = 'exclude',
  /** Include the current, partially filled bucket in the response */
  Include = 'include'
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type ArbitratorHistory = {
  __typename?: 'ArbitratorHistory';
  arbitrator: Scalars['Bytes']['output'];
  clearingMeta: Scalars['String']['output'];
  extraData: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  registrationMeta: Scalars['String']['output'];
  requests: Array<Request>;
  updateTime: Scalars['BigInt']['output'];
};


export type ArbitratorHistoryRequestsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Request_Filter>;
};

export type ArbitratorHistory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ArbitratorHistory_Filter>>>;
  arbitrator?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  arbitrator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_not?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  arbitrator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  clearingMeta?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_contains?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_ends_with?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_gt?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_gte?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_in?: InputMaybe<Array<Scalars['String']['input']>>;
  clearingMeta_lt?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_lte?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_contains?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  clearingMeta_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_starts_with?: InputMaybe<Scalars['String']['input']>;
  clearingMeta_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  extraData?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_contains?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_gt?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_gte?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  extraData_lt?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_lte?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_not?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  extraData_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ArbitratorHistory_Filter>>>;
  registrationMeta?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_contains?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_ends_with?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_gt?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_gte?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registrationMeta_lt?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_lte?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_contains?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registrationMeta_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_starts_with?: InputMaybe<Scalars['String']['input']>;
  registrationMeta_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  requests_?: InputMaybe<Request_Filter>;
  updateTime?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  updateTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  updateTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum ArbitratorHistory_OrderBy {
  Arbitrator = 'arbitrator',
  ClearingMeta = 'clearingMeta',
  ExtraData = 'extraData',
  Id = 'id',
  RegistrationMeta = 'registrationMeta',
  Requests = 'requests',
  UpdateTime = 'updateTime'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Challenge = {
  __typename?: 'Challenge';
  challenger?: Maybe<Challenger>;
  creationTime: Scalars['BigInt']['output'];
  disputeId: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  index: Scalars['BigInt']['output'];
  nbRounds: Scalars['BigInt']['output'];
  reason: Reason;
  request: Request;
  rounds: Array<Round>;
  ruling: Party;
};


export type ChallengeRoundsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Round_Filter>;
};

export type Challenge_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Challenge_Filter>>>;
  challenger?: InputMaybe<Scalars['String']['input']>;
  challenger_?: InputMaybe<Challenger_Filter>;
  challenger_contains?: InputMaybe<Scalars['String']['input']>;
  challenger_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenger_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenger_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenger_gt?: InputMaybe<Scalars['String']['input']>;
  challenger_gte?: InputMaybe<Scalars['String']['input']>;
  challenger_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenger_lt?: InputMaybe<Scalars['String']['input']>;
  challenger_lte?: InputMaybe<Scalars['String']['input']>;
  challenger_not?: InputMaybe<Scalars['String']['input']>;
  challenger_not_contains?: InputMaybe<Scalars['String']['input']>;
  challenger_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenger_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenger_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenger_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenger_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenger_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenger_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenger_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  creationTime?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  disputeId?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  disputeId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_not?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  index?: InputMaybe<Scalars['BigInt']['input']>;
  index_gt?: InputMaybe<Scalars['BigInt']['input']>;
  index_gte?: InputMaybe<Scalars['BigInt']['input']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  index_lt?: InputMaybe<Scalars['BigInt']['input']>;
  index_lte?: InputMaybe<Scalars['BigInt']['input']>;
  index_not?: InputMaybe<Scalars['BigInt']['input']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbRounds?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbRounds_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbRounds_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Challenge_Filter>>>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reason_?: InputMaybe<Reason_Filter>;
  reason_contains?: InputMaybe<Scalars['String']['input']>;
  reason_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_ends_with?: InputMaybe<Scalars['String']['input']>;
  reason_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_gt?: InputMaybe<Scalars['String']['input']>;
  reason_gte?: InputMaybe<Scalars['String']['input']>;
  reason_in?: InputMaybe<Array<Scalars['String']['input']>>;
  reason_lt?: InputMaybe<Scalars['String']['input']>;
  reason_lte?: InputMaybe<Scalars['String']['input']>;
  reason_not?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  reason_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  reason_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  reason_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_starts_with?: InputMaybe<Scalars['String']['input']>;
  reason_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request?: InputMaybe<Scalars['String']['input']>;
  request_?: InputMaybe<Request_Filter>;
  request_contains?: InputMaybe<Scalars['String']['input']>;
  request_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_gt?: InputMaybe<Scalars['String']['input']>;
  request_gte?: InputMaybe<Scalars['String']['input']>;
  request_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_lt?: InputMaybe<Scalars['String']['input']>;
  request_lte?: InputMaybe<Scalars['String']['input']>;
  request_not?: InputMaybe<Scalars['String']['input']>;
  request_not_contains?: InputMaybe<Scalars['String']['input']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rounds_?: InputMaybe<Round_Filter>;
  ruling?: InputMaybe<Scalars['String']['input']>;
  ruling_?: InputMaybe<Party_Filter>;
  ruling_contains?: InputMaybe<Scalars['String']['input']>;
  ruling_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  ruling_ends_with?: InputMaybe<Scalars['String']['input']>;
  ruling_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ruling_gt?: InputMaybe<Scalars['String']['input']>;
  ruling_gte?: InputMaybe<Scalars['String']['input']>;
  ruling_in?: InputMaybe<Array<Scalars['String']['input']>>;
  ruling_lt?: InputMaybe<Scalars['String']['input']>;
  ruling_lte?: InputMaybe<Scalars['String']['input']>;
  ruling_not?: InputMaybe<Scalars['String']['input']>;
  ruling_not_contains?: InputMaybe<Scalars['String']['input']>;
  ruling_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  ruling_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  ruling_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ruling_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  ruling_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  ruling_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ruling_starts_with?: InputMaybe<Scalars['String']['input']>;
  ruling_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
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
  RequestAdvanceRequesterFunded = 'request__advanceRequesterFunded',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestExpirationTime = 'request__expirationTime',
  RequestId = 'request__id',
  RequestInTransferHash = 'request__inTransferHash',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestPunishedVouchTimestamp = 'request__punishedVouchTimestamp',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation',
  Rounds = 'rounds',
  Ruling = 'ruling',
  RulingCount = 'ruling__count',
  RulingId = 'ruling__id'
}

export type Challenger = {
  __typename?: 'Challenger';
  challenges: Array<Challenge>;
  id: Scalars['Bytes']['output'];
  wins: Array<Request>;
};


export type ChallengerChallengesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Challenge_Filter>;
};


export type ChallengerWinsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Request_Filter>;
};

export type ChallengerFund = Fund & {
  __typename?: 'ChallengerFund';
  amount: Scalars['BigInt']['output'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  round: Round;
  withdrawn: Scalars['Boolean']['output'];
};


export type ChallengerFundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type ChallengerFund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<ChallengerFund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ChallengerFund_Filter>>>;
  round_?: InputMaybe<Round_Filter>;
  withdrawn?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  withdrawn_not?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
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
  Withdrawn = 'withdrawn'
}

export type Challenger_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Challenger_Filter>>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Challenger_Filter>>>;
  wins_?: InputMaybe<Request_Filter>;
};

export enum Challenger_OrderBy {
  Challenges = 'challenges',
  Id = 'id',
  Wins = 'wins'
}

export type CirclesAccount = {
  __typename?: 'CirclesAccount';
  humanities: Array<Humanity>;
  id: Scalars['Bytes']['output'];
  trustExpiryTime: Scalars['BigInt']['output'];
};


export type CirclesAccountHumanitiesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Humanity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Humanity_Filter>;
};

export type CirclesAccount_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CirclesAccount_Filter>>>;
  humanities_?: InputMaybe<Humanity_Filter>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<CirclesAccount_Filter>>>;
  trustExpiryTime?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  trustExpiryTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  trustExpiryTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum CirclesAccount_OrderBy {
  Humanities = 'humanities',
  Id = 'id',
  TrustExpiryTime = 'trustExpiryTime'
}

export type Claimer = {
  __typename?: 'Claimer';
  currentRequest?: Maybe<Request>;
  id: Scalars['Bytes']['output'];
  name?: Maybe<Scalars['String']['output']>;
  nbVouchesReceived: Scalars['BigInt']['output'];
  registration?: Maybe<Registration>;
  vouches: Array<Vouch>;
  vouchesReceived: Array<Vouch>;
};


export type ClaimerVouchesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Vouch_Filter>;
};


export type ClaimerVouchesReceivedArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Vouch_Filter>;
};

export type Claimer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Claimer_Filter>>>;
  currentRequest?: InputMaybe<Scalars['String']['input']>;
  currentRequest_?: InputMaybe<Request_Filter>;
  currentRequest_contains?: InputMaybe<Scalars['String']['input']>;
  currentRequest_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  currentRequest_ends_with?: InputMaybe<Scalars['String']['input']>;
  currentRequest_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  currentRequest_gt?: InputMaybe<Scalars['String']['input']>;
  currentRequest_gte?: InputMaybe<Scalars['String']['input']>;
  currentRequest_in?: InputMaybe<Array<Scalars['String']['input']>>;
  currentRequest_lt?: InputMaybe<Scalars['String']['input']>;
  currentRequest_lte?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_contains?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  currentRequest_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  currentRequest_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  currentRequest_starts_with?: InputMaybe<Scalars['String']['input']>;
  currentRequest_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nbVouchesReceived?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbVouchesReceived_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbVouchesReceived_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Claimer_Filter>>>;
  registration?: InputMaybe<Scalars['String']['input']>;
  registration_?: InputMaybe<Registration_Filter>;
  registration_contains?: InputMaybe<Scalars['String']['input']>;
  registration_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registration_ends_with?: InputMaybe<Scalars['String']['input']>;
  registration_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registration_gt?: InputMaybe<Scalars['String']['input']>;
  registration_gte?: InputMaybe<Scalars['String']['input']>;
  registration_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registration_lt?: InputMaybe<Scalars['String']['input']>;
  registration_lte?: InputMaybe<Scalars['String']['input']>;
  registration_not?: InputMaybe<Scalars['String']['input']>;
  registration_not_contains?: InputMaybe<Scalars['String']['input']>;
  registration_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registration_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  registration_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registration_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registration_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  registration_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registration_starts_with?: InputMaybe<Scalars['String']['input']>;
  registration_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouchesReceived_?: InputMaybe<Vouch_Filter>;
  vouches_?: InputMaybe<Vouch_Filter>;
};

export enum Claimer_OrderBy {
  CurrentRequest = 'currentRequest',
  CurrentRequestAdvanceRequesterFunded = 'currentRequest__advanceRequesterFunded',
  CurrentRequestChallengePeriodEnd = 'currentRequest__challengePeriodEnd',
  CurrentRequestCreationTime = 'currentRequest__creationTime',
  CurrentRequestExpirationTime = 'currentRequest__expirationTime',
  CurrentRequestId = 'currentRequest__id',
  CurrentRequestInTransferHash = 'currentRequest__inTransferHash',
  CurrentRequestIndex = 'currentRequest__index',
  CurrentRequestLastStatusChange = 'currentRequest__lastStatusChange',
  CurrentRequestNbChallenges = 'currentRequest__nbChallenges',
  CurrentRequestPunishedVouchTimestamp = 'currentRequest__punishedVouchTimestamp',
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
  VouchesReceived = 'vouchesReceived'
}

export type Contract = {
  __typename?: 'Contract';
  baseDeposit: Scalars['BigInt']['output'];
  challengePeriodDuration: Scalars['BigInt']['output'];
  humanityLifespan: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  latestArbitratorHistory?: Maybe<ArbitratorHistory>;
  renewalPeriodDuration: Scalars['BigInt']['output'];
  requiredNumberOfVouches: Scalars['BigInt']['output'];
};

export type Contract_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Contract_Filter>>>;
  baseDeposit?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_gt?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_gte?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  baseDeposit_lt?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_lte?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_not?: InputMaybe<Scalars['BigInt']['input']>;
  baseDeposit_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  challengePeriodDuration?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  challengePeriodDuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  humanityLifespan?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_gt?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_gte?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  humanityLifespan_lt?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_lte?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_not?: InputMaybe<Scalars['BigInt']['input']>;
  humanityLifespan_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  latestArbitratorHistory?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_?: InputMaybe<ArbitratorHistory_Filter>;
  latestArbitratorHistory_contains?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_ends_with?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_gt?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_gte?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_in?: InputMaybe<Array<Scalars['String']['input']>>;
  latestArbitratorHistory_lt?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_lte?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_contains?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  latestArbitratorHistory_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_starts_with?: InputMaybe<Scalars['String']['input']>;
  latestArbitratorHistory_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Contract_Filter>>>;
  renewalPeriodDuration?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  renewalPeriodDuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  renewalPeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  requiredNumberOfVouches?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_gt?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_gte?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  requiredNumberOfVouches_lt?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_lte?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_not?: InputMaybe<Scalars['BigInt']['input']>;
  requiredNumberOfVouches_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
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
  RequiredNumberOfVouches = 'requiredNumberOfVouches'
}

export type Contribution = {
  __typename?: 'Contribution';
  amount: Scalars['BigInt']['output'];
  challenge: Challenge;
  contributor: Scalars['Bytes']['output'];
  fund: Fund;
  humanity: Humanity;
  id: Scalars['Bytes']['output'];
  request: Request;
  round: Round;
  side: Party;
};

export type Contribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  challenge?: InputMaybe<Scalars['String']['input']>;
  challenge_?: InputMaybe<Challenge_Filter>;
  challenge_contains?: InputMaybe<Scalars['String']['input']>;
  challenge_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenge_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_gt?: InputMaybe<Scalars['String']['input']>;
  challenge_gte?: InputMaybe<Scalars['String']['input']>;
  challenge_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenge_lt?: InputMaybe<Scalars['String']['input']>;
  challenge_lte?: InputMaybe<Scalars['String']['input']>;
  challenge_not?: InputMaybe<Scalars['String']['input']>;
  challenge_not_contains?: InputMaybe<Scalars['String']['input']>;
  challenge_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenge_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenge_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenge_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenge_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  contributor?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_contains?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_gt?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_gte?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  contributor_lt?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_lte?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_not?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  contributor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fund?: InputMaybe<Scalars['String']['input']>;
  fund_?: InputMaybe<Fund_Filter>;
  fund_contains?: InputMaybe<Scalars['String']['input']>;
  fund_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fund_ends_with?: InputMaybe<Scalars['String']['input']>;
  fund_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fund_gt?: InputMaybe<Scalars['String']['input']>;
  fund_gte?: InputMaybe<Scalars['String']['input']>;
  fund_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fund_lt?: InputMaybe<Scalars['String']['input']>;
  fund_lte?: InputMaybe<Scalars['String']['input']>;
  fund_not?: InputMaybe<Scalars['String']['input']>;
  fund_not_contains?: InputMaybe<Scalars['String']['input']>;
  fund_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fund_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  fund_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fund_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fund_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  fund_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fund_starts_with?: InputMaybe<Scalars['String']['input']>;
  fund_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity?: InputMaybe<Scalars['String']['input']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_gt?: InputMaybe<Scalars['String']['input']>;
  humanity_gte?: InputMaybe<Scalars['String']['input']>;
  humanity_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_lt?: InputMaybe<Scalars['String']['input']>;
  humanity_lte?: InputMaybe<Scalars['String']['input']>;
  humanity_not?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  request?: InputMaybe<Scalars['String']['input']>;
  request_?: InputMaybe<Request_Filter>;
  request_contains?: InputMaybe<Scalars['String']['input']>;
  request_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_gt?: InputMaybe<Scalars['String']['input']>;
  request_gte?: InputMaybe<Scalars['String']['input']>;
  request_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_lt?: InputMaybe<Scalars['String']['input']>;
  request_lte?: InputMaybe<Scalars['String']['input']>;
  request_not?: InputMaybe<Scalars['String']['input']>;
  request_not_contains?: InputMaybe<Scalars['String']['input']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round?: InputMaybe<Scalars['String']['input']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']['input']>;
  round_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  round_ends_with?: InputMaybe<Scalars['String']['input']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_gt?: InputMaybe<Scalars['String']['input']>;
  round_gte?: InputMaybe<Scalars['String']['input']>;
  round_in?: InputMaybe<Array<Scalars['String']['input']>>;
  round_lt?: InputMaybe<Scalars['String']['input']>;
  round_lte?: InputMaybe<Scalars['String']['input']>;
  round_not?: InputMaybe<Scalars['String']['input']>;
  round_not_contains?: InputMaybe<Scalars['String']['input']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  round_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_starts_with?: InputMaybe<Scalars['String']['input']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  side?: InputMaybe<Scalars['String']['input']>;
  side_?: InputMaybe<Party_Filter>;
  side_contains?: InputMaybe<Scalars['String']['input']>;
  side_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  side_ends_with?: InputMaybe<Scalars['String']['input']>;
  side_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  side_gt?: InputMaybe<Scalars['String']['input']>;
  side_gte?: InputMaybe<Scalars['String']['input']>;
  side_in?: InputMaybe<Array<Scalars['String']['input']>>;
  side_lt?: InputMaybe<Scalars['String']['input']>;
  side_lte?: InputMaybe<Scalars['String']['input']>;
  side_not?: InputMaybe<Scalars['String']['input']>;
  side_not_contains?: InputMaybe<Scalars['String']['input']>;
  side_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  side_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  side_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  side_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  side_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  side_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  side_starts_with?: InputMaybe<Scalars['String']['input']>;
  side_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Contribution_OrderBy {
  Amount = 'amount',
  Challenge = 'challenge',
  ChallengeCreationTime = 'challenge__creationTime',
  ChallengeDisputeId = 'challenge__disputeId',
  ChallengeId = 'challenge__id',
  ChallengeIndex = 'challenge__index',
  ChallengeNbRounds = 'challenge__nbRounds',
  Contributor = 'contributor',
  Fund = 'fund',
  FundAmount = 'fund__amount',
  FundFeeRewards = 'fund__feeRewards',
  FundId = 'fund__id',
  FundWithdrawn = 'fund__withdrawn',
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
  Request = 'request',
  RequestAdvanceRequesterFunded = 'request__advanceRequesterFunded',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestExpirationTime = 'request__expirationTime',
  RequestId = 'request__id',
  RequestInTransferHash = 'request__inTransferHash',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestPunishedVouchTimestamp = 'request__punishedVouchTimestamp',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation',
  Round = 'round',
  RoundCreationTime = 'round__creationTime',
  RoundId = 'round__id',
  RoundIndex = 'round__index',
  Side = 'side',
  SideCount = 'side__count',
  SideId = 'side__id'
}

export type CrossChainGateway = {
  __typename?: 'CrossChainGateway';
  foreignProxy: Scalars['Bytes']['output'];
  id: Scalars['Bytes']['output'];
};

export type CrossChainGateway_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CrossChainGateway_Filter>>>;
  foreignProxy?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_contains?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_gt?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_gte?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  foreignProxy_lt?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_lte?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<CrossChainGateway_Filter>>>;
};

export enum CrossChainGateway_OrderBy {
  ForeignProxy = 'foreignProxy',
  Id = 'id'
}

export type CrossChainRegistration = {
  __typename?: 'CrossChainRegistration';
  claimer: Claimer;
  expirationTime: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  lastReceivedTransferTimestamp: Scalars['BigInt']['output'];
};

export type CrossChainRegistration_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CrossChainRegistration_Filter>>>;
  claimer?: InputMaybe<Scalars['String']['input']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  expirationTime?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  expirationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastReceivedTransferTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastReceivedTransferTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastReceivedTransferTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<CrossChainRegistration_Filter>>>;
};

export enum CrossChainRegistration_OrderBy {
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  ClaimerName = 'claimer__name',
  ClaimerNbVouchesReceived = 'claimer__nbVouchesReceived',
  ExpirationTime = 'expirationTime',
  Id = 'id',
  LastReceivedTransferTimestamp = 'lastReceivedTransferTimestamp'
}

export type Evidence = {
  __typename?: 'Evidence';
  creationTime: Scalars['BigInt']['output'];
  group: EvidenceGroup;
  id: Scalars['Bytes']['output'];
  submitter: Scalars['Bytes']['output'];
  uri: Scalars['String']['output'];
};

export type EvidenceGroup = {
  __typename?: 'EvidenceGroup';
  evidence: Array<Evidence>;
  id: Scalars['Bytes']['output'];
  length: Scalars['BigInt']['output'];
  request: Request;
};


export type EvidenceGroupEvidenceArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Evidence_Filter>;
};

export type EvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
  evidence_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  length?: InputMaybe<Scalars['BigInt']['input']>;
  length_gt?: InputMaybe<Scalars['BigInt']['input']>;
  length_gte?: InputMaybe<Scalars['BigInt']['input']>;
  length_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  length_lt?: InputMaybe<Scalars['BigInt']['input']>;
  length_lte?: InputMaybe<Scalars['BigInt']['input']>;
  length_not?: InputMaybe<Scalars['BigInt']['input']>;
  length_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
  request_?: InputMaybe<Request_Filter>;
};

export enum EvidenceGroup_OrderBy {
  Evidence = 'evidence',
  Id = 'id',
  Length = 'length',
  Request = 'request',
  RequestAdvanceRequesterFunded = 'request__advanceRequesterFunded',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestExpirationTime = 'request__expirationTime',
  RequestId = 'request__id',
  RequestInTransferHash = 'request__inTransferHash',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestPunishedVouchTimestamp = 'request__punishedVouchTimestamp',
  RequestRegistrationEvidenceRevokedReq = 'request__registrationEvidenceRevokedReq',
  RequestRequester = 'request__requester',
  RequestResolutionTime = 'request__resolutionTime',
  RequestRevocation = 'request__revocation'
}

export type Evidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  creationTime?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  group?: InputMaybe<Scalars['String']['input']>;
  group_?: InputMaybe<EvidenceGroup_Filter>;
  group_contains?: InputMaybe<Scalars['String']['input']>;
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  group_ends_with?: InputMaybe<Scalars['String']['input']>;
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  group_gt?: InputMaybe<Scalars['String']['input']>;
  group_gte?: InputMaybe<Scalars['String']['input']>;
  group_in?: InputMaybe<Array<Scalars['String']['input']>>;
  group_lt?: InputMaybe<Scalars['String']['input']>;
  group_lte?: InputMaybe<Scalars['String']['input']>;
  group_not?: InputMaybe<Scalars['String']['input']>;
  group_not_contains?: InputMaybe<Scalars['String']['input']>;
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  group_starts_with?: InputMaybe<Scalars['String']['input']>;
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  submitter?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_contains?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_gt?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_gte?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  submitter_lt?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_lte?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_not?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  submitter_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  uri?: InputMaybe<Scalars['String']['input']>;
  uri_contains?: InputMaybe<Scalars['String']['input']>;
  uri_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  uri_ends_with?: InputMaybe<Scalars['String']['input']>;
  uri_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  uri_gt?: InputMaybe<Scalars['String']['input']>;
  uri_gte?: InputMaybe<Scalars['String']['input']>;
  uri_in?: InputMaybe<Array<Scalars['String']['input']>>;
  uri_lt?: InputMaybe<Scalars['String']['input']>;
  uri_lte?: InputMaybe<Scalars['String']['input']>;
  uri_not?: InputMaybe<Scalars['String']['input']>;
  uri_not_contains?: InputMaybe<Scalars['String']['input']>;
  uri_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  uri_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  uri_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  uri_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  uri_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  uri_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  uri_starts_with?: InputMaybe<Scalars['String']['input']>;
  uri_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Evidence_OrderBy {
  CreationTime = 'creationTime',
  Group = 'group',
  GroupId = 'group__id',
  GroupLength = 'group__length',
  Id = 'id',
  Submitter = 'submitter',
  Uri = 'uri'
}

export type Fund = {
  amount: Scalars['BigInt']['output'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  round: Round;
  withdrawn: Scalars['Boolean']['output'];
};


export type FundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type Fund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Fund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Fund_Filter>>>;
  round?: InputMaybe<Scalars['String']['input']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']['input']>;
  round_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  round_ends_with?: InputMaybe<Scalars['String']['input']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_gt?: InputMaybe<Scalars['String']['input']>;
  round_gte?: InputMaybe<Scalars['String']['input']>;
  round_in?: InputMaybe<Array<Scalars['String']['input']>>;
  round_lt?: InputMaybe<Scalars['String']['input']>;
  round_lte?: InputMaybe<Scalars['String']['input']>;
  round_not?: InputMaybe<Scalars['String']['input']>;
  round_not_contains?: InputMaybe<Scalars['String']['input']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  round_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  round_starts_with?: InputMaybe<Scalars['String']['input']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawn?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  withdrawn_not?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
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
  Withdrawn = 'withdrawn'
}

export type Humanity = {
  __typename?: 'Humanity';
  circleAccount?: Maybe<CirclesAccount>;
  claimerName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Bytes']['output'];
  inTransfer: Scalars['Boolean']['output'];
  nbBridgedRequests: Scalars['BigInt']['output'];
  nbLegacyRequests: Scalars['BigInt']['output'];
  nbPendingRequests: Scalars['BigInt']['output'];
  nbRequests: Scalars['BigInt']['output'];
  pendingRevocation: Scalars['Boolean']['output'];
  registration?: Maybe<Registration>;
  requests: Array<Request>;
  usedVouch?: Maybe<VouchInProcess>;
  vouching: Scalars['Boolean']['output'];
};


export type HumanityRequestsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Request_Filter>;
};

export type HumanityEvent = {
  __typename?: 'HumanityEvent';
  appealRound?: Maybe<Scalars['BigInt']['output']>;
  disputeId?: Maybe<Scalars['BigInt']['output']>;
  humanityId: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  requestIndex?: Maybe<Scalars['BigInt']['output']>;
  revocation?: Maybe<Scalars['Boolean']['output']>;
  timestamp: Scalars['BigInt']['output'];
  transferHash?: Maybe<Scalars['Bytes']['output']>;
  type: HumanityEventType;
  voucher?: Maybe<Scalars['Bytes']['output']>;
};

export enum HumanityEventType {
  RequestAppealCreated = 'REQUEST_APPEAL_CREATED',
  RequestChallenged = 'REQUEST_CHALLENGED',
  RequestCreated = 'REQUEST_CREATED',
  RequestEnteredReview = 'REQUEST_ENTERED_REVIEW',
  RequestResolvedAccepted = 'REQUEST_RESOLVED_ACCEPTED',
  RequestResolvedRejected = 'REQUEST_RESOLVED_REJECTED',
  RequestVouchAdded = 'REQUEST_VOUCH_ADDED',
  RequestVouchRemoved = 'REQUEST_VOUCH_REMOVED',
  RequestWithdrawn = 'REQUEST_WITHDRAWN',
  TransferInitiated = 'TRANSFER_INITIATED',
  TransferReceived = 'TRANSFER_RECEIVED'
}

export type HumanityEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<HumanityEvent_Filter>>>;
  appealRound?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_gt?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_gte?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  appealRound_lt?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_lte?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_not?: InputMaybe<Scalars['BigInt']['input']>;
  appealRound_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  disputeId?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  disputeId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_not?: InputMaybe<Scalars['BigInt']['input']>;
  disputeId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  humanityId?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  humanityId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<HumanityEvent_Filter>>>;
  requestIndex?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  requestIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  requestIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  revocation?: InputMaybe<Scalars['Boolean']['input']>;
  revocation_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  revocation_not?: InputMaybe<Scalars['Boolean']['input']>;
  revocation_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transferHash?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transferHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  type?: InputMaybe<HumanityEventType>;
  type_in?: InputMaybe<Array<HumanityEventType>>;
  type_not?: InputMaybe<HumanityEventType>;
  type_not_in?: InputMaybe<Array<HumanityEventType>>;
  voucher?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_contains?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_gt?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_gte?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  voucher_lt?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_lte?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_not?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  voucher_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum HumanityEvent_OrderBy {
  AppealRound = 'appealRound',
  DisputeId = 'disputeId',
  HumanityId = 'humanityId',
  Id = 'id',
  RequestIndex = 'requestIndex',
  Revocation = 'revocation',
  Timestamp = 'timestamp',
  TransferHash = 'transferHash',
  Type = 'type',
  Voucher = 'voucher'
}

export type Humanity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Humanity_Filter>>>;
  circleAccount?: InputMaybe<Scalars['String']['input']>;
  circleAccount_?: InputMaybe<CirclesAccount_Filter>;
  circleAccount_contains?: InputMaybe<Scalars['String']['input']>;
  circleAccount_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  circleAccount_ends_with?: InputMaybe<Scalars['String']['input']>;
  circleAccount_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  circleAccount_gt?: InputMaybe<Scalars['String']['input']>;
  circleAccount_gte?: InputMaybe<Scalars['String']['input']>;
  circleAccount_in?: InputMaybe<Array<Scalars['String']['input']>>;
  circleAccount_lt?: InputMaybe<Scalars['String']['input']>;
  circleAccount_lte?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_contains?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  circleAccount_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  circleAccount_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  circleAccount_starts_with?: InputMaybe<Scalars['String']['input']>;
  circleAccount_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName?: InputMaybe<Scalars['String']['input']>;
  claimerName_contains?: InputMaybe<Scalars['String']['input']>;
  claimerName_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimerName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName_gt?: InputMaybe<Scalars['String']['input']>;
  claimerName_gte?: InputMaybe<Scalars['String']['input']>;
  claimerName_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimerName_lt?: InputMaybe<Scalars['String']['input']>;
  claimerName_lte?: InputMaybe<Scalars['String']['input']>;
  claimerName_not?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimerName_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimerName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimerName_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimerName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  inTransfer?: InputMaybe<Scalars['Boolean']['input']>;
  inTransfer_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  inTransfer_not?: InputMaybe<Scalars['Boolean']['input']>;
  inTransfer_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  nbBridgedRequests?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbBridgedRequests_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbBridgedRequests_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbLegacyRequests?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbLegacyRequests_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbLegacyRequests_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbPendingRequests?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbPendingRequests_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbPendingRequests_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbRequests?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbRequests_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbRequests_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Humanity_Filter>>>;
  pendingRevocation?: InputMaybe<Scalars['Boolean']['input']>;
  pendingRevocation_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  pendingRevocation_not?: InputMaybe<Scalars['Boolean']['input']>;
  pendingRevocation_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  registration_?: InputMaybe<Registration_Filter>;
  requests_?: InputMaybe<Request_Filter>;
  usedVouch_?: InputMaybe<VouchInProcess_Filter>;
  vouching?: InputMaybe<Scalars['Boolean']['input']>;
  vouching_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  vouching_not?: InputMaybe<Scalars['Boolean']['input']>;
  vouching_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export enum Humanity_OrderBy {
  CircleAccount = 'circleAccount',
  CircleAccountId = 'circleAccount__id',
  CircleAccountTrustExpiryTime = 'circleAccount__trustExpiryTime',
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
  Vouching = 'vouching'
}

export type InTransfer = {
  __typename?: 'InTransfer';
  humanityId: Scalars['Bytes']['output'];
  id: Scalars['Bytes']['output'];
};

export type InTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<InTransfer_Filter>>>;
  humanityId?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  humanityId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<InTransfer_Filter>>>;
};

export enum InTransfer_OrderBy {
  HumanityId = 'humanityId',
  Id = 'id'
}

export type InUpdate = {
  __typename?: 'InUpdate';
  humanityId: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  logIndex: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type InUpdate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<InUpdate_Filter>>>;
  humanityId?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  humanityId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<InUpdate_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum InUpdate_OrderBy {
  HumanityId = 'humanityId',
  Id = 'id',
  LogIndex = 'logIndex',
  Timestamp = 'timestamp',
  TxHash = 'txHash'
}

/**
 * The severity level of a log entry.
 * Log levels are ordered from most to least severe: CRITICAL > ERROR > WARNING > INFO > DEBUG
 */
export enum LogLevel {
  /** Critical errors that require immediate attention */
  Critical = 'CRITICAL',
  /** Detailed diagnostic information for debugging */
  Debug = 'DEBUG',
  /** Error conditions that indicate a failure */
  Error = 'ERROR',
  /** Informational messages about normal operations */
  Info = 'INFO',
  /** Warning conditions that may require attention */
  Warning = 'WARNING'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type OutTransfer = {
  __typename?: 'OutTransfer';
  foreignProxy: Scalars['Bytes']['output'];
  id: Scalars['Bytes']['output'];
  logIndex: Scalars['BigInt']['output'];
  transferHash: Scalars['Bytes']['output'];
  transferTimestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type OutTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<OutTransfer_Filter>>>;
  foreignProxy?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_contains?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_gt?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_gte?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  foreignProxy_lt?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_lte?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  foreignProxy_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<OutTransfer_Filter>>>;
  transferHash?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transferHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transferHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transferTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transferTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  transferTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum OutTransfer_OrderBy {
  ForeignProxy = 'foreignProxy',
  Id = 'id',
  LogIndex = 'logIndex',
  TransferHash = 'transferHash',
  TransferTimestamp = 'transferTimestamp',
  TxHash = 'txHash'
}

export type OutUpdate = {
  __typename?: 'OutUpdate';
  humanityId: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  logIndex: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type OutUpdate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<OutUpdate_Filter>>>;
  humanityId?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  humanityId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  humanityId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<OutUpdate_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum OutUpdate_OrderBy {
  HumanityId = 'humanityId',
  Id = 'id',
  LogIndex = 'logIndex',
  Timestamp = 'timestamp',
  TxHash = 'txHash'
}

export type Party = {
  __typename?: 'Party';
  challengesWon: Array<Challenge>;
  count: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
};


export type PartyChallengesWonArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type Party_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Party_Filter>>>;
  challengesWon_?: InputMaybe<Challenge_Filter>;
  count?: InputMaybe<Scalars['BigInt']['input']>;
  count_gt?: InputMaybe<Scalars['BigInt']['input']>;
  count_gte?: InputMaybe<Scalars['BigInt']['input']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  count_lt?: InputMaybe<Scalars['BigInt']['input']>;
  count_lte?: InputMaybe<Scalars['BigInt']['input']>;
  count_not?: InputMaybe<Scalars['BigInt']['input']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Party_Filter>>>;
};

export enum Party_OrderBy {
  ChallengesWon = 'challengesWon',
  Count = 'count',
  Id = 'id'
}

export type Query = {
  __typename?: 'Query';
  /** Query execution logs emitted by the subgraph during indexing. Results are sorted by timestamp in descending order (newest first). */
  _logs: Array<_Log_>;
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
  circlesAccount?: Maybe<CirclesAccount>;
  circlesAccounts: Array<CirclesAccount>;
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
  humanityEvent?: Maybe<HumanityEvent>;
  humanityEvents: Array<HumanityEvent>;
  inTransfer?: Maybe<InTransfer>;
  inTransfers: Array<InTransfer>;
  inUpdate?: Maybe<InUpdate>;
  inUpdates: Array<InUpdate>;
  outTransfer?: Maybe<OutTransfer>;
  outTransfers: Array<OutTransfer>;
  outUpdate?: Maybe<OutUpdate>;
  outUpdates: Array<OutUpdate>;
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
  rewardClaim?: Maybe<RewardClaim>;
  rewardClaims: Array<RewardClaim>;
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


export type Query_LogsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<LogLevel>;
  orderDirection?: InputMaybe<OrderDirection>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryArbitratorHistoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ArbitratorHistory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ArbitratorHistory_Filter>;
};


export type QueryArbitratorHistoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryChallengeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryChallengerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryChallengerFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryChallengerFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ChallengerFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ChallengerFund_Filter>;
};


export type QueryChallengersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenger_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenger_Filter>;
};


export type QueryChallengesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Challenge_Filter>;
};


export type QueryCirclesAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCirclesAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CirclesAccount_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CirclesAccount_Filter>;
};


export type QueryClaimerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryClaimersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Claimer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Claimer_Filter>;
};


export type QueryContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contract_Filter>;
};


export type QueryContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};


export type QueryCrossChainGatewayArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCrossChainGatewaysArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CrossChainGateway_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainGateway_Filter>;
};


export type QueryCrossChainRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCrossChainRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CrossChainRegistration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CrossChainRegistration_Filter>;
};


export type QueryEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};


export type QueryEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};


export type QueryFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Fund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Fund_Filter>;
};


export type QueryHumanitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Humanity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Humanity_Filter>;
};


export type QueryHumanityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHumanityEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHumanityEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HumanityEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HumanityEvent_Filter>;
};


export type QueryInTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InTransfer_Filter>;
};


export type QueryInUpdateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInUpdatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InUpdate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InUpdate_Filter>;
};


export type QueryOutTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryOutTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OutTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutTransfer_Filter>;
};


export type QueryOutUpdateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryOutUpdatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OutUpdate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutUpdate_Filter>;
};


export type QueryPartiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Party_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Party_Filter>;
};


export type QueryPartyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryReasonArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryReasonsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Reason_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reason_Filter>;
};


export type QueryRegistrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRegistrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Registration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Registration_Filter>;
};


export type QueryRequestArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRequesterFundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRequesterFundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RequesterFund_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RequesterFund_Filter>;
};


export type QueryRequestsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Request_Filter>;
};


export type QueryRewardClaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRewardClaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RewardClaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RewardClaim_Filter>;
};


export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};


export type QueryStatusArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStatusesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Status_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Status_Filter>;
};


export type QuerySubmissionSearchArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  text: Scalars['String']['input'];
  where?: InputMaybe<Claimer_Filter>;
};


export type QueryVouchArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVouchInProcessArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVouchInProcessesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VouchInProcess_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VouchInProcess_Filter>;
};


export type QueryVouchesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Vouch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vouch_Filter>;
};

export type Reason = {
  __typename?: 'Reason';
  challenges: Array<Challenge>;
  count: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
};


export type ReasonChallengesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Challenge_Filter>;
};

export type Reason_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Reason_Filter>>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  count?: InputMaybe<Scalars['BigInt']['input']>;
  count_gt?: InputMaybe<Scalars['BigInt']['input']>;
  count_gte?: InputMaybe<Scalars['BigInt']['input']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  count_lt?: InputMaybe<Scalars['BigInt']['input']>;
  count_lte?: InputMaybe<Scalars['BigInt']['input']>;
  count_not?: InputMaybe<Scalars['BigInt']['input']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Reason_Filter>>>;
};

export enum Reason_OrderBy {
  Challenges = 'challenges',
  Count = 'count',
  Id = 'id'
}

export type Registration = {
  __typename?: 'Registration';
  claimer: Claimer;
  expirationTime: Scalars['BigInt']['output'];
  humanity: Humanity;
  id: Scalars['Bytes']['output'];
};

export type Registration_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Registration_Filter>>>;
  claimer?: InputMaybe<Scalars['String']['input']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  expirationTime?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  expirationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  humanity?: InputMaybe<Scalars['String']['input']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_gt?: InputMaybe<Scalars['String']['input']>;
  humanity_gte?: InputMaybe<Scalars['String']['input']>;
  humanity_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_lt?: InputMaybe<Scalars['String']['input']>;
  humanity_lte?: InputMaybe<Scalars['String']['input']>;
  humanity_not?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  Id = 'id'
}

export type Request = {
  __typename?: 'Request';
  advanceRequesterFunded: Scalars['Boolean']['output'];
  arbitratorHistory: ArbitratorHistory;
  challengePeriodEnd: Scalars['BigInt']['output'];
  challenges: Array<Challenge>;
  claimer: Claimer;
  contributors: Array<Scalars['Bytes']['output']>;
  creationTime: Scalars['BigInt']['output'];
  evidenceGroup: EvidenceGroup;
  expirationTime?: Maybe<Scalars['BigInt']['output']>;
  humanity: Humanity;
  id: Scalars['Bytes']['output'];
  inTransferHash?: Maybe<Scalars['Bytes']['output']>;
  index: Scalars['BigInt']['output'];
  lastStatusChange: Scalars['BigInt']['output'];
  nbChallenges: Scalars['BigInt']['output'];
  punishedVouchReason?: Maybe<Reason>;
  punishedVouchSourceRequest?: Maybe<Request>;
  punishedVouchTimestamp?: Maybe<Scalars['BigInt']['output']>;
  registrationEvidenceRevokedReq: Scalars['String']['output'];
  requester: Scalars['Bytes']['output'];
  resolutionTime: Scalars['BigInt']['output'];
  revocation: Scalars['Boolean']['output'];
  status: Status;
  ultimateChallenger?: Maybe<Challenger>;
  vouches: Array<VouchInProcess>;
  winnerParty?: Maybe<Party>;
};


export type RequestChallengesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Challenge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Challenge_Filter>;
};


export type RequestVouchesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VouchInProcess_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VouchInProcess_Filter>;
};

export type Request_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  advanceRequesterFunded?: InputMaybe<Scalars['Boolean']['input']>;
  advanceRequesterFunded_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  advanceRequesterFunded_not?: InputMaybe<Scalars['Boolean']['input']>;
  advanceRequesterFunded_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Request_Filter>>>;
  arbitratorHistory?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_?: InputMaybe<ArbitratorHistory_Filter>;
  arbitratorHistory_contains?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_ends_with?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_gt?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_gte?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_in?: InputMaybe<Array<Scalars['String']['input']>>;
  arbitratorHistory_lt?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_lte?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_contains?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  arbitratorHistory_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_starts_with?: InputMaybe<Scalars['String']['input']>;
  arbitratorHistory_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challengePeriodEnd?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  challengePeriodEnd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_not?: InputMaybe<Scalars['BigInt']['input']>;
  challengePeriodEnd_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  challenges_?: InputMaybe<Challenge_Filter>;
  claimer?: InputMaybe<Scalars['String']['input']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  contributors?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  contributors_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  contributors_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  contributors_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  creationTime?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  evidenceGroup?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_ends_with?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_gt?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_gte?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_in?: InputMaybe<Array<Scalars['String']['input']>>;
  evidenceGroup_lt?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_lte?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_contains?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_starts_with?: InputMaybe<Scalars['String']['input']>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  expirationTime?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  expirationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  expirationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  humanity?: InputMaybe<Scalars['String']['input']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_gt?: InputMaybe<Scalars['String']['input']>;
  humanity_gte?: InputMaybe<Scalars['String']['input']>;
  humanity_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_lt?: InputMaybe<Scalars['String']['input']>;
  humanity_lte?: InputMaybe<Scalars['String']['input']>;
  humanity_not?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  inTransferHash?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  inTransferHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  inTransferHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  index?: InputMaybe<Scalars['BigInt']['input']>;
  index_gt?: InputMaybe<Scalars['BigInt']['input']>;
  index_gte?: InputMaybe<Scalars['BigInt']['input']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  index_lt?: InputMaybe<Scalars['BigInt']['input']>;
  index_lte?: InputMaybe<Scalars['BigInt']['input']>;
  index_not?: InputMaybe<Scalars['BigInt']['input']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastStatusChange?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastStatusChange_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastStatusChange_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbChallenges?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nbChallenges_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_not?: InputMaybe<Scalars['BigInt']['input']>;
  nbChallenges_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Request_Filter>>>;
  punishedVouchReason?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_?: InputMaybe<Reason_Filter>;
  punishedVouchReason_contains?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_ends_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_gt?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_gte?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_in?: InputMaybe<Array<Scalars['String']['input']>>;
  punishedVouchReason_lt?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_lte?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_contains?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  punishedVouchReason_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_starts_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchReason_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_?: InputMaybe<Request_Filter>;
  punishedVouchSourceRequest_contains?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_ends_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_gt?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_gte?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_in?: InputMaybe<Array<Scalars['String']['input']>>;
  punishedVouchSourceRequest_lt?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_lte?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_contains?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  punishedVouchSourceRequest_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_starts_with?: InputMaybe<Scalars['String']['input']>;
  punishedVouchSourceRequest_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  punishedVouchTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  punishedVouchTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  punishedVouchTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  registrationEvidenceRevokedReq?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_contains?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_ends_with?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_gt?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_gte?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registrationEvidenceRevokedReq_lt?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_lte?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_contains?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  registrationEvidenceRevokedReq_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_starts_with?: InputMaybe<Scalars['String']['input']>;
  registrationEvidenceRevokedReq_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  requester?: InputMaybe<Scalars['Bytes']['input']>;
  requester_contains?: InputMaybe<Scalars['Bytes']['input']>;
  requester_gt?: InputMaybe<Scalars['Bytes']['input']>;
  requester_gte?: InputMaybe<Scalars['Bytes']['input']>;
  requester_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  requester_lt?: InputMaybe<Scalars['Bytes']['input']>;
  requester_lte?: InputMaybe<Scalars['Bytes']['input']>;
  requester_not?: InputMaybe<Scalars['Bytes']['input']>;
  requester_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  requester_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  resolutionTime?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  resolutionTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  resolutionTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  revocation?: InputMaybe<Scalars['Boolean']['input']>;
  revocation_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  revocation_not?: InputMaybe<Scalars['Boolean']['input']>;
  revocation_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  status?: InputMaybe<Scalars['String']['input']>;
  status_?: InputMaybe<Status_Filter>;
  status_contains?: InputMaybe<Scalars['String']['input']>;
  status_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  status_ends_with?: InputMaybe<Scalars['String']['input']>;
  status_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  status_gt?: InputMaybe<Scalars['String']['input']>;
  status_gte?: InputMaybe<Scalars['String']['input']>;
  status_in?: InputMaybe<Array<Scalars['String']['input']>>;
  status_lt?: InputMaybe<Scalars['String']['input']>;
  status_lte?: InputMaybe<Scalars['String']['input']>;
  status_not?: InputMaybe<Scalars['String']['input']>;
  status_not_contains?: InputMaybe<Scalars['String']['input']>;
  status_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  status_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  status_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  status_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  status_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  status_starts_with?: InputMaybe<Scalars['String']['input']>;
  status_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_?: InputMaybe<Challenger_Filter>;
  ultimateChallenger_contains?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_ends_with?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_gt?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_gte?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_in?: InputMaybe<Array<Scalars['String']['input']>>;
  ultimateChallenger_lt?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_lte?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_contains?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  ultimateChallenger_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_starts_with?: InputMaybe<Scalars['String']['input']>;
  ultimateChallenger_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouches_?: InputMaybe<VouchInProcess_Filter>;
  winnerParty?: InputMaybe<Scalars['String']['input']>;
  winnerParty_?: InputMaybe<Party_Filter>;
  winnerParty_contains?: InputMaybe<Scalars['String']['input']>;
  winnerParty_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  winnerParty_ends_with?: InputMaybe<Scalars['String']['input']>;
  winnerParty_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  winnerParty_gt?: InputMaybe<Scalars['String']['input']>;
  winnerParty_gte?: InputMaybe<Scalars['String']['input']>;
  winnerParty_in?: InputMaybe<Array<Scalars['String']['input']>>;
  winnerParty_lt?: InputMaybe<Scalars['String']['input']>;
  winnerParty_lte?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_contains?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  winnerParty_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  winnerParty_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  winnerParty_starts_with?: InputMaybe<Scalars['String']['input']>;
  winnerParty_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Request_OrderBy {
  AdvanceRequesterFunded = 'advanceRequesterFunded',
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
  InTransferHash = 'inTransferHash',
  Index = 'index',
  LastStatusChange = 'lastStatusChange',
  NbChallenges = 'nbChallenges',
  PunishedVouchReason = 'punishedVouchReason',
  PunishedVouchReasonCount = 'punishedVouchReason__count',
  PunishedVouchReasonId = 'punishedVouchReason__id',
  PunishedVouchSourceRequest = 'punishedVouchSourceRequest',
  PunishedVouchSourceRequestAdvanceRequesterFunded = 'punishedVouchSourceRequest__advanceRequesterFunded',
  PunishedVouchSourceRequestChallengePeriodEnd = 'punishedVouchSourceRequest__challengePeriodEnd',
  PunishedVouchSourceRequestCreationTime = 'punishedVouchSourceRequest__creationTime',
  PunishedVouchSourceRequestExpirationTime = 'punishedVouchSourceRequest__expirationTime',
  PunishedVouchSourceRequestId = 'punishedVouchSourceRequest__id',
  PunishedVouchSourceRequestInTransferHash = 'punishedVouchSourceRequest__inTransferHash',
  PunishedVouchSourceRequestIndex = 'punishedVouchSourceRequest__index',
  PunishedVouchSourceRequestLastStatusChange = 'punishedVouchSourceRequest__lastStatusChange',
  PunishedVouchSourceRequestNbChallenges = 'punishedVouchSourceRequest__nbChallenges',
  PunishedVouchSourceRequestPunishedVouchTimestamp = 'punishedVouchSourceRequest__punishedVouchTimestamp',
  PunishedVouchSourceRequestRegistrationEvidenceRevokedReq = 'punishedVouchSourceRequest__registrationEvidenceRevokedReq',
  PunishedVouchSourceRequestRequester = 'punishedVouchSourceRequest__requester',
  PunishedVouchSourceRequestResolutionTime = 'punishedVouchSourceRequest__resolutionTime',
  PunishedVouchSourceRequestRevocation = 'punishedVouchSourceRequest__revocation',
  PunishedVouchTimestamp = 'punishedVouchTimestamp',
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
  WinnerPartyId = 'winnerParty__id'
}

export type RequesterFund = Fund & {
  __typename?: 'RequesterFund';
  amount: Scalars['BigInt']['output'];
  contributions: Array<Contribution>;
  feeRewards: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  round: Round;
  withdrawn: Scalars['Boolean']['output'];
};


export type RequesterFundContributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Contribution_Filter>;
};

export type RequesterFund_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<RequesterFund_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  feeRewards?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeRewards_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeRewards_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<RequesterFund_Filter>>>;
  round_?: InputMaybe<Round_Filter>;
  withdrawn?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  withdrawn_not?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawn_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
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
  Withdrawn = 'withdrawn'
}

export type RewardClaim = {
  __typename?: 'RewardClaim';
  amount: Scalars['BigInt']['output'];
  claimer: Claimer;
  id: Scalars['Bytes']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type RewardClaim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<RewardClaim_Filter>>>;
  claimer?: InputMaybe<Scalars['String']['input']>;
  claimer_?: InputMaybe<Claimer_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<RewardClaim_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum RewardClaim_OrderBy {
  Amount = 'amount',
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  ClaimerName = 'claimer__name',
  ClaimerNbVouchesReceived = 'claimer__nbVouchesReceived',
  Id = 'id',
  Timestamp = 'timestamp'
}

export type Round = {
  __typename?: 'Round';
  challenge: Challenge;
  challengerFund?: Maybe<ChallengerFund>;
  creationTime: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  index: Scalars['BigInt']['output'];
  requesterFund: RequesterFund;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  challenge?: InputMaybe<Scalars['String']['input']>;
  challenge_?: InputMaybe<Challenge_Filter>;
  challenge_contains?: InputMaybe<Scalars['String']['input']>;
  challenge_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenge_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_gt?: InputMaybe<Scalars['String']['input']>;
  challenge_gte?: InputMaybe<Scalars['String']['input']>;
  challenge_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenge_lt?: InputMaybe<Scalars['String']['input']>;
  challenge_lte?: InputMaybe<Scalars['String']['input']>;
  challenge_not?: InputMaybe<Scalars['String']['input']>;
  challenge_not_contains?: InputMaybe<Scalars['String']['input']>;
  challenge_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  challenge_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challenge_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenge_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challenge_starts_with?: InputMaybe<Scalars['String']['input']>;
  challenge_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund?: InputMaybe<Scalars['String']['input']>;
  challengerFund_?: InputMaybe<ChallengerFund_Filter>;
  challengerFund_contains?: InputMaybe<Scalars['String']['input']>;
  challengerFund_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund_ends_with?: InputMaybe<Scalars['String']['input']>;
  challengerFund_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund_gt?: InputMaybe<Scalars['String']['input']>;
  challengerFund_gte?: InputMaybe<Scalars['String']['input']>;
  challengerFund_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challengerFund_lt?: InputMaybe<Scalars['String']['input']>;
  challengerFund_lte?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_contains?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  challengerFund_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  challengerFund_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  challengerFund_starts_with?: InputMaybe<Scalars['String']['input']>;
  challengerFund_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  creationTime?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  creationTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  creationTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  index?: InputMaybe<Scalars['BigInt']['input']>;
  index_gt?: InputMaybe<Scalars['BigInt']['input']>;
  index_gte?: InputMaybe<Scalars['BigInt']['input']>;
  index_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  index_lt?: InputMaybe<Scalars['BigInt']['input']>;
  index_lte?: InputMaybe<Scalars['BigInt']['input']>;
  index_not?: InputMaybe<Scalars['BigInt']['input']>;
  index_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  requesterFund?: InputMaybe<Scalars['String']['input']>;
  requesterFund_?: InputMaybe<RequesterFund_Filter>;
  requesterFund_contains?: InputMaybe<Scalars['String']['input']>;
  requesterFund_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  requesterFund_ends_with?: InputMaybe<Scalars['String']['input']>;
  requesterFund_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  requesterFund_gt?: InputMaybe<Scalars['String']['input']>;
  requesterFund_gte?: InputMaybe<Scalars['String']['input']>;
  requesterFund_in?: InputMaybe<Array<Scalars['String']['input']>>;
  requesterFund_lt?: InputMaybe<Scalars['String']['input']>;
  requesterFund_lte?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_contains?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  requesterFund_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  requesterFund_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  requesterFund_starts_with?: InputMaybe<Scalars['String']['input']>;
  requesterFund_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
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
  ChallengerFundWithdrawn = 'challengerFund__withdrawn',
  CreationTime = 'creationTime',
  Id = 'id',
  Index = 'index',
  RequesterFund = 'requesterFund',
  RequesterFundAmount = 'requesterFund__amount',
  RequesterFundFeeRewards = 'requesterFund__feeRewards',
  RequesterFundId = 'requesterFund__id',
  RequesterFundWithdrawn = 'requesterFund__withdrawn'
}

export type Status = {
  __typename?: 'Status';
  count: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  requests: Array<Request>;
};


export type StatusRequestsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Request_Filter>;
};

export type Status_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Status_Filter>>>;
  count?: InputMaybe<Scalars['BigInt']['input']>;
  count_gt?: InputMaybe<Scalars['BigInt']['input']>;
  count_gte?: InputMaybe<Scalars['BigInt']['input']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  count_lt?: InputMaybe<Scalars['BigInt']['input']>;
  count_lte?: InputMaybe<Scalars['BigInt']['input']>;
  count_not?: InputMaybe<Scalars['BigInt']['input']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Status_Filter>>>;
  requests_?: InputMaybe<Request_Filter>;
};

export enum Status_OrderBy {
  Count = 'count',
  Id = 'id',
  Requests = 'requests'
}

export type Vouch = {
  __typename?: 'Vouch';
  for: Claimer;
  from: Claimer;
  humanity: Humanity;
  id: Scalars['Bytes']['output'];
};

export type VouchInProcess = {
  __typename?: 'VouchInProcess';
  id: Scalars['Bytes']['output'];
  processed: Scalars['Boolean']['output'];
  request: Request;
  vouch: Vouch;
  voucher: Humanity;
};

export type VouchInProcess_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VouchInProcess_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VouchInProcess_Filter>>>;
  processed?: InputMaybe<Scalars['Boolean']['input']>;
  processed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  processed_not?: InputMaybe<Scalars['Boolean']['input']>;
  processed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  request?: InputMaybe<Scalars['String']['input']>;
  request_?: InputMaybe<Request_Filter>;
  request_contains?: InputMaybe<Scalars['String']['input']>;
  request_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_gt?: InputMaybe<Scalars['String']['input']>;
  request_gte?: InputMaybe<Scalars['String']['input']>;
  request_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_lt?: InputMaybe<Scalars['String']['input']>;
  request_lte?: InputMaybe<Scalars['String']['input']>;
  request_not?: InputMaybe<Scalars['String']['input']>;
  request_not_contains?: InputMaybe<Scalars['String']['input']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch?: InputMaybe<Scalars['String']['input']>;
  vouch_?: InputMaybe<Vouch_Filter>;
  vouch_contains?: InputMaybe<Scalars['String']['input']>;
  vouch_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch_ends_with?: InputMaybe<Scalars['String']['input']>;
  vouch_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch_gt?: InputMaybe<Scalars['String']['input']>;
  vouch_gte?: InputMaybe<Scalars['String']['input']>;
  vouch_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vouch_lt?: InputMaybe<Scalars['String']['input']>;
  vouch_lte?: InputMaybe<Scalars['String']['input']>;
  vouch_not?: InputMaybe<Scalars['String']['input']>;
  vouch_not_contains?: InputMaybe<Scalars['String']['input']>;
  vouch_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vouch_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vouch_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vouch_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vouch_starts_with?: InputMaybe<Scalars['String']['input']>;
  vouch_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher?: InputMaybe<Scalars['String']['input']>;
  voucher_?: InputMaybe<Humanity_Filter>;
  voucher_contains?: InputMaybe<Scalars['String']['input']>;
  voucher_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher_ends_with?: InputMaybe<Scalars['String']['input']>;
  voucher_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher_gt?: InputMaybe<Scalars['String']['input']>;
  voucher_gte?: InputMaybe<Scalars['String']['input']>;
  voucher_in?: InputMaybe<Array<Scalars['String']['input']>>;
  voucher_lt?: InputMaybe<Scalars['String']['input']>;
  voucher_lte?: InputMaybe<Scalars['String']['input']>;
  voucher_not?: InputMaybe<Scalars['String']['input']>;
  voucher_not_contains?: InputMaybe<Scalars['String']['input']>;
  voucher_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  voucher_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  voucher_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  voucher_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  voucher_starts_with?: InputMaybe<Scalars['String']['input']>;
  voucher_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VouchInProcess_OrderBy {
  Id = 'id',
  Processed = 'processed',
  Request = 'request',
  RequestAdvanceRequesterFunded = 'request__advanceRequesterFunded',
  RequestChallengePeriodEnd = 'request__challengePeriodEnd',
  RequestCreationTime = 'request__creationTime',
  RequestExpirationTime = 'request__expirationTime',
  RequestId = 'request__id',
  RequestInTransferHash = 'request__inTransferHash',
  RequestIndex = 'request__index',
  RequestLastStatusChange = 'request__lastStatusChange',
  RequestNbChallenges = 'request__nbChallenges',
  RequestPunishedVouchTimestamp = 'request__punishedVouchTimestamp',
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
  VoucherVouching = 'voucher__vouching'
}

export type Vouch_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Vouch_Filter>>>;
  for?: InputMaybe<Scalars['String']['input']>;
  for_?: InputMaybe<Claimer_Filter>;
  for_contains?: InputMaybe<Scalars['String']['input']>;
  for_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  for_ends_with?: InputMaybe<Scalars['String']['input']>;
  for_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  for_gt?: InputMaybe<Scalars['String']['input']>;
  for_gte?: InputMaybe<Scalars['String']['input']>;
  for_in?: InputMaybe<Array<Scalars['String']['input']>>;
  for_lt?: InputMaybe<Scalars['String']['input']>;
  for_lte?: InputMaybe<Scalars['String']['input']>;
  for_not?: InputMaybe<Scalars['String']['input']>;
  for_not_contains?: InputMaybe<Scalars['String']['input']>;
  for_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  for_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  for_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  for_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  for_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  for_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  for_starts_with?: InputMaybe<Scalars['String']['input']>;
  for_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  from_?: InputMaybe<Claimer_Filter>;
  from_contains?: InputMaybe<Scalars['String']['input']>;
  from_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  from_ends_with?: InputMaybe<Scalars['String']['input']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from_gt?: InputMaybe<Scalars['String']['input']>;
  from_gte?: InputMaybe<Scalars['String']['input']>;
  from_in?: InputMaybe<Array<Scalars['String']['input']>>;
  from_lt?: InputMaybe<Scalars['String']['input']>;
  from_lte?: InputMaybe<Scalars['String']['input']>;
  from_not?: InputMaybe<Scalars['String']['input']>;
  from_not_contains?: InputMaybe<Scalars['String']['input']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  from_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from_starts_with?: InputMaybe<Scalars['String']['input']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity?: InputMaybe<Scalars['String']['input']>;
  humanity_?: InputMaybe<Humanity_Filter>;
  humanity_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_gt?: InputMaybe<Scalars['String']['input']>;
  humanity_gte?: InputMaybe<Scalars['String']['input']>;
  humanity_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_lt?: InputMaybe<Scalars['String']['input']>;
  humanity_lte?: InputMaybe<Scalars['String']['input']>;
  humanity_not?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains?: InputMaybe<Scalars['String']['input']>;
  humanity_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  humanity_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with?: InputMaybe<Scalars['String']['input']>;
  humanity_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  Id = 'id'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/**
 * A key-value pair of additional data associated with a log entry.
 * These correspond to arguments passed to the log function in the subgraph code.
 */
export type _LogArgument_ = {
  __typename?: '_LogArgument_';
  /** The parameter name */
  key: Scalars['String']['output'];
  /** The parameter value, serialized as a string */
  value: Scalars['String']['output'];
};

/**
 * Source code location metadata for a log entry.
 * Indicates where in the subgraph's AssemblyScript code the log statement was executed.
 */
export type _LogMeta_ = {
  __typename?: '_LogMeta_';
  /** The column number in the source file */
  column: Scalars['Int']['output'];
  /** The line number in the source file */
  line: Scalars['Int']['output'];
  /** The module or file path where the log was emitted */
  module: Scalars['String']['output'];
};

/**
 * A log entry emitted by a subgraph during indexing.
 * Logs can be generated by the subgraph's AssemblyScript code using the `log.*` functions.
 */
export type _Log_ = {
  __typename?: '_Log_';
  /** Additional structured data passed to the log function as key-value pairs */
  arguments: Array<_LogArgument_>;
  /** Unique identifier for this log entry */
  id: Scalars['String']['output'];
  /** The severity level of the log entry */
  level: LogLevel;
  /** Metadata about the source location in the subgraph code where the log was emitted */
  meta: _LogMeta_;
  /** The deployment hash of the subgraph that emitted this log */
  subgraphId: Scalars['String']['output'];
  /** The log message text */
  text: Scalars['String']['output'];
  /** The timestamp when the log was emitted, in RFC3339 format (e.g., '2024-01-15T10:30:00Z') */
  timestamp: Scalars['String']['output'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type ActiveRegistrationByClaimerQueryVariables = Exact<{
  address: Scalars['String']['input'];
  now: Scalars['BigInt']['input'];
}>;


export type ActiveRegistrationByClaimerQuery = { __typename?: 'Query', registrations: Array<{ __typename?: 'Registration', humanity: { __typename?: 'Humanity', id: any, pendingRevocation: boolean, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> } }> };

export type GetCirclesAccountsByaddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  expirationTime: Scalars['BigInt']['input'];
}>;


export type GetCirclesAccountsByaddressQuery = { __typename?: 'Query', registrations: Array<{ __typename?: 'Registration', id: any, humanity: { __typename?: 'Humanity', id: any, circleAccount?: { __typename?: 'CirclesAccount', id: any, trustExpiryTime: any } | null } }>, crossChainRegistrations: Array<{ __typename?: 'CrossChainRegistration', id: any }> };

export type GetHumanityWithCircleAccountByIdQueryVariables = Exact<{
  humanityId: Scalars['ID']['input'];
}>;


export type GetHumanityWithCircleAccountByIdQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', id: any, circleAccount?: { __typename?: 'CirclesAccount', id: any, trustExpiryTime: any } | null } | null };

export type HumanityIdByClaimerQueryVariables = Exact<{
  address: Scalars['String']['input'];
  now: Scalars['BigInt']['input'];
}>;


export type HumanityIdByClaimerQuery = { __typename?: 'Query', registrations: Array<{ __typename?: 'Registration', humanity: { __typename?: 'Humanity', id: any } }>, crossChainRegistrations: Array<{ __typename?: 'CrossChainRegistration', id: any }> };

export type RequestsToAdvanceQueryVariables = Exact<{ [key: string]: never; }>;


export type RequestsToAdvanceQuery = { __typename?: 'Query', status?: { __typename?: 'Status', requests: Array<{ __typename?: 'Request', claimer: { __typename?: 'Claimer', id: any, vouchesReceived: Array<{ __typename?: 'Vouch', humanity: { __typename?: 'Humanity', id: any, usedVouch?: { __typename?: 'VouchInProcess', id: any } | null }, from: { __typename?: 'Claimer', id: any } }> }, humanity: { __typename?: 'Humanity', id: any }, challenges: Array<{ __typename?: 'Challenge', rounds: Array<{ __typename?: 'Round', requesterFund: { __typename?: 'RequesterFund', amount: any } }> }> }> } | null };

export type ClaimerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ClaimerQuery = { __typename?: 'Query', claimer?: { __typename?: 'Claimer', id: any, name?: string | null, registration?: { __typename?: 'Registration', humanity: { __typename?: 'Humanity', id: any, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> } } | null } | null };

export type ContractQueryVariables = Exact<{ [key: string]: never; }>;


export type ContractQuery = { __typename?: 'Query', contract?: { __typename?: 'Contract', baseDeposit: any, humanityLifespan: any, renewalPeriodDuration: any, challengePeriodDuration: any, requiredNumberOfVouches: any, latestArbitratorHistory?: { __typename?: 'ArbitratorHistory', arbitrator: any, extraData: any, updateTime: any, registrationMeta: string, clearingMeta: string } | null } | null, crossChainGateways: Array<{ __typename?: 'CrossChainGateway', id: any, foreignProxy: any }> };

export type CrossChainUpdatesQueryVariables = Exact<{
  humanityId: Scalars['Bytes']['input'];
}>;


export type CrossChainUpdatesQuery = { __typename?: 'Query', outUpdates: Array<{ __typename?: 'OutUpdate', id: string, humanityId: any, txHash: any, logIndex: any, timestamp: any }>, inUpdates: Array<{ __typename?: 'InUpdate', id: string, humanityId: any, txHash: any, logIndex: any, timestamp: any }> };

export type HistoricalWinnerClaimQueryVariables = Exact<{
  humanityId: Scalars['Bytes']['input'];
  lastStatusChange: Scalars['BigInt']['input'];
}>;


export type HistoricalWinnerClaimQuery = { __typename?: 'Query', requests: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string, creationTime: any, submitter: any }> } }> };

export type HumanityQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type HumanityQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', nbRequests: any, nbLegacyRequests: any, registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null } } | null, requests: Array<{ __typename?: 'Request', id: any, creationTime: any, lastStatusChange: any, index: any, revocation: boolean, expirationTime?: any | null, registrationEvidenceRevokedReq: string, requester: any, status: { __typename?: 'Status', id: string }, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, winnerParty?: { __typename?: 'Party', id: string } | null, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', id: any, uri: string, creationTime: any, submitter: any }> } }>, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> } | null, crossChainRegistration?: { __typename?: 'CrossChainRegistration', expirationTime: any, lastReceivedTransferTimestamp: any, claimer: { __typename?: 'Claimer', id: any } } | null, outTransfer?: { __typename?: 'OutTransfer', foreignProxy: any, transferHash: any, transferTimestamp: any } | null };

export type HumanityEventsQueryVariables = Exact<{
  humanityId: Scalars['Bytes']['input'];
}>;


export type HumanityEventsQuery = { __typename?: 'Query', humanityEvents: Array<{ __typename?: 'HumanityEvent', id: string, timestamp: any, type: HumanityEventType, requestIndex?: any | null, transferHash?: any | null, voucher?: any | null, disputeId?: any | null, appealRound?: any | null, revocation?: boolean | null }> };

export type MeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MeQuery = { __typename?: 'Query', claimer?: { __typename?: 'Claimer', registration?: { __typename?: 'Registration', id: any, expirationTime: any } | null, currentRequest?: { __typename?: 'Request', index: any, status: { __typename?: 'Status', id: string }, humanity: { __typename?: 'Humanity', id: any } } | null } | null };

export type ProfileHumanityQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  humanityId: Scalars['Bytes']['input'];
}>;


export type ProfileHumanityQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null } } | null, requests: Array<{ __typename?: 'Request', id: any, creationTime: any, lastStatusChange: any, index: any, revocation: boolean, expirationTime?: any | null, registrationEvidenceRevokedReq: string, requester: any, punishedVouchTimestamp?: any | null, status: { __typename?: 'Status', id: string }, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, winnerParty?: { __typename?: 'Party', id: string } | null, punishedVouchSourceRequest?: { __typename?: 'Request', index: any, humanity: { __typename?: 'Humanity', id: any } } | null, punishedVouchReason?: { __typename?: 'Reason', id: string } | null, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> } | null, crossChainRegistration?: { __typename?: 'CrossChainRegistration', expirationTime: any, lastReceivedTransferTimestamp: any, claimer: { __typename?: 'Claimer', id: any } } | null, outTransfer?: { __typename?: 'OutTransfer', foreignProxy: any, transferHash: any, txHash: any, logIndex: any, transferTimestamp: any } | null, inTransfers: Array<{ __typename?: 'InTransfer', id: any }> };

export type ProfileRequestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProfileRequestQuery = { __typename?: 'Query', request?: { __typename?: 'Request', index: any, inTransferHash?: any | null, revocation: boolean, registrationEvidenceRevokedReq: string, requester: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } } | null };

export type ReferralReferrerProfileQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReferralReferrerProfileQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', name?: string | null } } | null, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> } | null };

export type ReferralRefereePriorClaimQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReferralRefereePriorClaimQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', requests: Array<{ __typename?: 'Request', id: any }> } | null };

export type ReferralRefereeProfilesQueryVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['Bytes']['input']> | Scalars['Bytes']['input']>;
}>;


export type ReferralRefereeProfilesQuery = { __typename?: 'Query', humanities: Array<{ __typename?: 'Humanity', id: any, pendingRevocation: boolean, registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', name?: string | null } } | null, latestRemovalRequest: Array<{ __typename?: 'Request', creationTime: any }>, latestClaimRequest: Array<{ __typename?: 'Request', creationTime: any, status: { __typename?: 'Status', id: string }, winnerParty?: { __typename?: 'Party', id: string } | null, claimer: { __typename?: 'Claimer', name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> }> };

export type RegistrationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RegistrationQuery = { __typename?: 'Query', registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', id: any } } | null };

export type RequestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  humanityId: Scalars['Bytes']['input'];
}>;


export type RequestQuery = { __typename?: 'Query', request?: { __typename?: 'Request', id: any, index: any, expirationTime?: any | null, revocation: boolean, registrationEvidenceRevokedReq: string, requester: any, creationTime: any, lastStatusChange: any, inTransferHash?: any | null, punishedVouchTimestamp?: any | null, status: { __typename?: 'Status', id: string }, winnerParty?: { __typename?: 'Party', id: string } | null, punishedVouchSourceRequest?: { __typename?: 'Request', index: any, humanity: { __typename?: 'Humanity', id: any } } | null, punishedVouchReason?: { __typename?: 'Reason', id: string } | null, vouches: Array<{ __typename?: 'VouchInProcess', voucher: { __typename?: 'Humanity', id: any } }>, humanity: { __typename?: 'Humanity', id: any, nbRequests: any, nbPendingRequests: any, nbLegacyRequests: any, registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', id: any } } | null, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> }, claimer: { __typename?: 'Claimer', id: any, name?: string | null, vouchesReceived: Array<{ __typename?: 'Vouch', from: { __typename?: 'Claimer', id: any, registration?: { __typename?: 'Registration', expirationTime: any, humanity: { __typename?: 'Humanity', vouching: boolean } } | null }, humanity: { __typename?: 'Humanity', id: any } }>, vouches: Array<{ __typename?: 'Vouch', for: { __typename?: 'Claimer', id: any, name?: string | null } }> }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', id: any, uri: string, creationTime: any, submitter: any }> }, challenges: Array<{ __typename?: 'Challenge', id: any, creationTime: any, disputeId: any, nbRounds: any, reason: { __typename?: 'Reason', id: string }, challenger?: { __typename?: 'Challenger', id: any } | null, rounds: Array<{ __typename?: 'Round', creationTime: any, index: any, requesterFund: { __typename?: 'RequesterFund', amount: any }, challengerFund?: { __typename?: 'ChallengerFund', amount: any } | null }> }>, arbitratorHistory: { __typename?: 'ArbitratorHistory', updateTime: any, registrationMeta: string, id: string, arbitrator: any, extraData: any } } | null };

export type RequestTimelineNodeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RequestTimelineNodeQuery = { __typename?: 'Query', request?: { __typename?: 'Request', index: any, inTransferHash?: any | null } | null };

export type RequestsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Request_Filter>;
}>;


export type RequestsQuery = { __typename?: 'Query', requests: Array<{ __typename?: 'Request', id: any, index: any, revocation: boolean, registrationEvidenceRevokedReq: string, creationTime: any, expirationTime?: any | null, lastStatusChange: any, requester: any, winnerParty?: { __typename?: 'Party', id: string } | null, status: { __typename?: 'Status', id: string }, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, humanity: { __typename?: 'Humanity', id: any, nbRequests: any, nbLegacyRequests: any, registration?: { __typename?: 'Registration', expirationTime: any, claimer: { __typename?: 'Claimer', id: any } } | null, winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> };

export type RewardClaimQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RewardClaimQuery = { __typename?: 'Query', rewardClaim?: { __typename?: 'RewardClaim', id: any, amount: any, timestamp: any, claimer: { __typename?: 'Claimer', id: any } } | null };

export type IsSyncedQueryVariables = Exact<{
  block: Scalars['Int']['input'];
}>;


export type IsSyncedQuery = { __typename?: 'Query', _meta?: { __typename?: '_Meta_', hasIndexingErrors: boolean } | null };

export type TransferQueryVariables = Exact<{
  hash: Scalars['ID']['input'];
}>;


export type TransferQuery = { __typename?: 'Query', inTransfer?: { __typename?: 'InTransfer', id: any, humanityId: any } | null };

export type HumanityVouchQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type HumanityVouchQuery = { __typename?: 'Query', humanity?: { __typename?: 'Humanity', vouching: boolean, registration?: { __typename?: 'Registration', expirationTime: any } | null } | null };

export type WinnerClaimFragment = { __typename?: 'Humanity', winnerClaim: Array<{ __typename?: 'Request', creationTime: any, index: any, lastStatusChange: any, requester: any, resolutionTime: any, claimer: { __typename?: 'Claimer', id: any, name?: string | null }, evidenceGroup: { __typename?: 'EvidenceGroup', evidence: Array<{ __typename?: 'Evidence', uri: string }> } }> };

export const WinnerClaimFragmentDoc = gql`
    fragment winnerClaim on Humanity {
  winnerClaim: requests(
    where: {revocation: false, winnerParty: "requester", status_in: ["resolved", "transferred"], evidenceGroup_: {length_gt: 0}}
    first: 1
    orderBy: lastStatusChange
    orderDirection: desc
  ) {
    claimer {
      id
      name
    }
    creationTime
    index
    lastStatusChange
    requester
    resolutionTime
    evidenceGroup {
      evidence(orderBy: creationTime, orderDirection: asc, first: 1) {
        uri
      }
    }
  }
}
    `;
export const ActiveRegistrationByClaimerDocument = gql`
    query ActiveRegistrationByClaimer($address: String!, $now: BigInt!) {
  registrations(where: {claimer: $address, expirationTime_gt: $now}, first: 1) {
    humanity {
      id
      pendingRevocation
      ...winnerClaim
    }
  }
}
    ${WinnerClaimFragmentDoc}`;
export const GetCirclesAccountsByaddressDocument = gql`
    query GetCirclesAccountsByaddress($address: String!, $expirationTime: BigInt!) {
  registrations(
    where: {claimer: $address, expirationTime_gt: $expirationTime}
    first: 1
  ) {
    id
    humanity {
      id
      circleAccount {
        id
        trustExpiryTime
      }
    }
  }
  crossChainRegistrations(
    where: {claimer: $address, expirationTime_gt: $expirationTime}
    first: 1
  ) {
    id
  }
}
    `;
export const GetHumanityWithCircleAccountByIdDocument = gql`
    query GetHumanityWithCircleAccountById($humanityId: ID!) {
  humanity(id: $humanityId) {
    id
    circleAccount {
      id
      trustExpiryTime
    }
  }
}
    `;
export const HumanityIdByClaimerDocument = gql`
    query HumanityIdByClaimer($address: String!, $now: BigInt!) {
  registrations(where: {claimer: $address, expirationTime_gt: $now}, first: 1) {
    humanity {
      id
    }
  }
  crossChainRegistrations(
    where: {claimer: $address, expirationTime_gt: $now}
    first: 1
  ) {
    id
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
    ${WinnerClaimFragmentDoc}`;
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
export const CrossChainUpdatesDocument = gql`
    query CrossChainUpdates($humanityId: Bytes!) {
  outUpdates(
    where: {humanityId: $humanityId}
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    humanityId
    txHash
    logIndex
    timestamp
  }
  inUpdates(
    where: {humanityId: $humanityId}
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    humanityId
    txHash
    logIndex
    timestamp
  }
}
    `;
export const HistoricalWinnerClaimDocument = gql`
    query HistoricalWinnerClaim($humanityId: Bytes!, $lastStatusChange: BigInt!) {
  requests(
    where: {humanity_: {id: $humanityId}, revocation: false, winnerParty: "requester", status_in: ["resolved", "transferred"], evidenceGroup_: {length_gt: 0}, lastStatusChange_lte: $lastStatusChange}
    first: 1
    orderBy: lastStatusChange
    orderDirection: desc
  ) {
    claimer {
      id
      name
    }
    creationTime
    index
    lastStatusChange
    requester
    resolutionTime
    evidenceGroup {
      evidence(orderBy: creationTime, orderDirection: asc, first: 1) {
        uri
        creationTime
        submitter
      }
    }
  }
}
    `;
export const HumanityDocument = gql`
    query Humanity($id: ID!) {
  humanity(id: $id) {
    nbRequests
    nbLegacyRequests
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
      winnerParty {
        id
      }
      creationTime
      lastStatusChange
      index
      revocation
      expirationTime
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
    ${WinnerClaimFragmentDoc}`;
export const HumanityEventsDocument = gql`
    query HumanityEvents($humanityId: Bytes!) {
  humanityEvents(
    where: {humanityId: $humanityId}
    orderBy: timestamp
    orderDirection: asc
  ) {
    id
    timestamp
    type
    requestIndex
    transferHash
    voucher
    disputeId
    appealRound
    revocation
  }
}
    `;
export const MeDocument = gql`
    query Me($id: ID!) {
  claimer(id: $id) {
    registration {
      id
      expirationTime
    }
    currentRequest {
      index
      status {
        id
      }
      humanity {
        id
      }
    }
  }
}
    `;
export const ProfileHumanityDocument = gql`
    query ProfileHumanity($id: ID!, $humanityId: Bytes!) {
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
      winnerParty {
        id
      }
      creationTime
      lastStatusChange
      index
      revocation
      expirationTime
      registrationEvidenceRevokedReq
      requester
      punishedVouchSourceRequest {
        humanity {
          id
        }
        index
      }
      punishedVouchReason {
        id
      }
      punishedVouchTimestamp
      evidenceGroup {
        evidence(orderBy: creationTime, orderDirection: asc, first: 1) {
          uri
        }
      }
    }
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
    txHash
    logIndex
    transferTimestamp
  }
  inTransfers(where: {humanityId: $humanityId}) {
    id
  }
}
    `;
export const ProfileRequestDocument = gql`
    query ProfileRequest($id: ID!) {
  request(id: $id) {
    index
    inTransferHash
    revocation
    registrationEvidenceRevokedReq
    requester
    claimer {
      id
      name
    }
    evidenceGroup {
      evidence(orderBy: creationTime, orderDirection: asc, first: 1) {
        uri
      }
    }
  }
}
    `;
export const ReferralReferrerProfileDocument = gql`
    query ReferralReferrerProfile($id: ID!) {
  humanity(id: $id) {
    registration {
      expirationTime
      claimer {
        name
      }
    }
    ...winnerClaim
  }
}
    ${WinnerClaimFragmentDoc}`;
export const ReferralRefereePriorClaimDocument = gql`
    query ReferralRefereePriorClaim($id: ID!) {
  humanity(id: $id) {
    requests(first: 1, where: {index: "0", revocation: false}) {
      id
    }
  }
}
    `;
export const ReferralRefereeProfilesDocument = gql`
    query ReferralRefereeProfiles($ids: [Bytes!]) {
  humanities(where: {id_in: $ids}, first: 100) {
    id
    pendingRevocation
    registration {
      expirationTime
      claimer {
        name
      }
    }
    latestRemovalRequest: requests(
      first: 1
      orderBy: creationTime
      orderDirection: desc
      where: {revocation: true, status: "resolved", winnerParty_: {id: "requester"}}
    ) {
      creationTime
    }
    latestClaimRequest: requests(
      first: 1
      orderBy: creationTime
      orderDirection: desc
      where: {revocation: false}
    ) {
      creationTime
      status {
        id
      }
      winnerParty {
        id
      }
      claimer {
        name
      }
      evidenceGroup {
        evidence(first: 1, orderBy: creationTime, orderDirection: desc) {
          uri
        }
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
    query Request($id: ID!, $humanityId: Bytes!) {
  request(id: $id) {
    id
    status {
      id
    }
    winnerParty {
      id
    }
    index
    expirationTime
    revocation
    registrationEvidenceRevokedReq
    requester
    creationTime
    lastStatusChange
    inTransferHash
    punishedVouchSourceRequest {
      humanity {
        id
      }
      index
    }
    punishedVouchReason {
      id
    }
    punishedVouchTimestamp
    vouches {
      voucher {
        id
      }
    }
    humanity {
      id
      nbRequests
      nbPendingRequests
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
      vouchesReceived(where: {humanity_: {id: $humanityId}}) {
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
      creationTime
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
    ${WinnerClaimFragmentDoc}`;
export const RequestTimelineNodeDocument = gql`
    query RequestTimelineNode($id: ID!) {
  request(id: $id) {
    index
    inTransferHash
  }
}
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
    winnerParty {
      id
    }
    status {
      id
    }
    revocation
    registrationEvidenceRevokedReq
    creationTime
    expirationTime
    lastStatusChange
    requester
    claimer {
      id
      name
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
    evidenceGroup {
      evidence(orderBy: creationTime, first: 1) {
        uri
      }
    }
  }
}
    ${WinnerClaimFragmentDoc}`;
export const RewardClaimDocument = gql`
    query RewardClaim($id: ID!) {
  rewardClaim(id: $id) {
    id
    claimer {
      id
    }
    amount
    timestamp
  }
}
    `;
export const IsSyncedDocument = gql`
    query IsSynced($block: Int!) {
  _meta(block: {number: $block}) {
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    ActiveRegistrationByClaimer(variables: ActiveRegistrationByClaimerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ActiveRegistrationByClaimerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ActiveRegistrationByClaimerQuery>({ document: ActiveRegistrationByClaimerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ActiveRegistrationByClaimer', 'query', variables);
    },
    GetCirclesAccountsByaddress(variables: GetCirclesAccountsByaddressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetCirclesAccountsByaddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCirclesAccountsByaddressQuery>({ document: GetCirclesAccountsByaddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCirclesAccountsByaddress', 'query', variables);
    },
    GetHumanityWithCircleAccountById(variables: GetHumanityWithCircleAccountByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetHumanityWithCircleAccountByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHumanityWithCircleAccountByIdQuery>({ document: GetHumanityWithCircleAccountByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetHumanityWithCircleAccountById', 'query', variables);
    },
    HumanityIdByClaimer(variables: HumanityIdByClaimerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<HumanityIdByClaimerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HumanityIdByClaimerQuery>({ document: HumanityIdByClaimerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'HumanityIdByClaimer', 'query', variables);
    },
    RequestsToAdvance(variables?: RequestsToAdvanceQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RequestsToAdvanceQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestsToAdvanceQuery>({ document: RequestsToAdvanceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RequestsToAdvance', 'query', variables);
    },
    Claimer(variables: ClaimerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ClaimerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ClaimerQuery>({ document: ClaimerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Claimer', 'query', variables);
    },
    Contract(variables?: ContractQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ContractQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ContractQuery>({ document: ContractDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Contract', 'query', variables);
    },
    CrossChainUpdates(variables: CrossChainUpdatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CrossChainUpdatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CrossChainUpdatesQuery>({ document: CrossChainUpdatesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CrossChainUpdates', 'query', variables);
    },
    HistoricalWinnerClaim(variables: HistoricalWinnerClaimQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<HistoricalWinnerClaimQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HistoricalWinnerClaimQuery>({ document: HistoricalWinnerClaimDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'HistoricalWinnerClaim', 'query', variables);
    },
    Humanity(variables: HumanityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<HumanityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HumanityQuery>({ document: HumanityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Humanity', 'query', variables);
    },
    HumanityEvents(variables: HumanityEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<HumanityEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HumanityEventsQuery>({ document: HumanityEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'HumanityEvents', 'query', variables);
    },
    Me(variables: MeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeQuery>({ document: MeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Me', 'query', variables);
    },
    ProfileHumanity(variables: ProfileHumanityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ProfileHumanityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ProfileHumanityQuery>({ document: ProfileHumanityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ProfileHumanity', 'query', variables);
    },
    ProfileRequest(variables: ProfileRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ProfileRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ProfileRequestQuery>({ document: ProfileRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ProfileRequest', 'query', variables);
    },
    ReferralReferrerProfile(variables: ReferralReferrerProfileQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReferralReferrerProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReferralReferrerProfileQuery>({ document: ReferralReferrerProfileDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReferralReferrerProfile', 'query', variables);
    },
    ReferralRefereePriorClaim(variables: ReferralRefereePriorClaimQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReferralRefereePriorClaimQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReferralRefereePriorClaimQuery>({ document: ReferralRefereePriorClaimDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReferralRefereePriorClaim', 'query', variables);
    },
    ReferralRefereeProfiles(variables?: ReferralRefereeProfilesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReferralRefereeProfilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReferralRefereeProfilesQuery>({ document: ReferralRefereeProfilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReferralRefereeProfiles', 'query', variables);
    },
    Registration(variables: RegistrationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegistrationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegistrationQuery>({ document: RegistrationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Registration', 'query', variables);
    },
    Request(variables: RequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestQuery>({ document: RequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Request', 'query', variables);
    },
    RequestTimelineNode(variables: RequestTimelineNodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RequestTimelineNodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestTimelineNodeQuery>({ document: RequestTimelineNodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RequestTimelineNode', 'query', variables);
    },
    Requests(variables?: RequestsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RequestsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestsQuery>({ document: RequestsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Requests', 'query', variables);
    },
    RewardClaim(variables: RewardClaimQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RewardClaimQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RewardClaimQuery>({ document: RewardClaimDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RewardClaim', 'query', variables);
    },
    IsSynced(variables: IsSyncedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<IsSyncedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<IsSyncedQuery>({ document: IsSyncedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'IsSynced', 'query', variables);
    },
    Transfer(variables: TransferQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TransferQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TransferQuery>({ document: TransferDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Transfer', 'query', variables);
    },
    HumanityVouch(variables: HumanityVouchQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<HumanityVouchQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HumanityVouchQuery>({ document: HumanityVouchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'HumanityVouch', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;