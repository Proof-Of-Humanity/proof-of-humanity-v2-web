export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IArbitrator',
        name: 'arbitrator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'AppealCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IArbitrator',
        name: 'arbitrator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'arbitratorExtraData',
        type: 'bytes',
      },
    ],
    name: 'ArbitratorChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'challengeId',
        type: 'uint256',
      },
    ],
    name: 'ChallengePeriodRestart',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'ClaimRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'challengeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'contributor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'contribution',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum ProofOfHumanityExtended.Party',
        name: 'side',
        type: 'uint8',
      },
    ],
    name: 'Contribution',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'crossChainProofOfHumanity',
        type: 'address',
      },
    ],
    name: 'CrossChainProxyChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_disputeID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_metaEvidenceID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_evidenceGroupID',
        type: 'uint256',
      },
    ],
    name: 'Dispute',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint40',
        name: 'humanityLifespan',
        type: 'uint40',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'renewalPeriodDuration',
        type: 'uint40',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'challengePeriodDuration',
        type: 'uint40',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'failedRevocationCooldown',
        type: 'uint40',
      },
    ],
    name: 'DurationsChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_evidenceGroupID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_party',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'Evidence',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'challengeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
    ],
    name: 'FeesAndRewardsWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
    ],
    name: 'GovernorChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'HumanityClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
    ],
    name: 'HumanityDischargedDirectly',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'expirationTime',
        type: 'uint40',
      },
    ],
    name: 'HumanityGrantedDirectly',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'HumanityRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_metaEvidenceID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'MetaEvidence',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'RenewalRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestBaseDeposit',
        type: 'uint256',
      },
    ],
    name: 'RequestBaseDepositChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'challengeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum ProofOfHumanityExtended.Reason',
        name: 'reason',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'RequestChallenged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'RequestWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'requiredNumberOfVouches',
        type: 'uint32',
      },
    ],
    name: 'RequiredNumberOfVouchesChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'RevocationRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_disputeID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_ruling',
        type: 'uint256',
      },
    ],
    name: 'Ruling',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sharedMultiplier',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'winnerMultiplier',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'loserMultiplier',
        type: 'uint256',
      },
    ],
    name: 'StakeMultipliersChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
    ],
    name: 'StateAdvanced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'voucherAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
    ],
    name: 'VouchAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'voucherHumanityId',
        type: 'bytes20',
      },
      {
        indexed: true,
        internalType: 'bytes20',
        name: 'vouchedHumanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
    ],
    name: 'VouchRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'voucherAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
    ],
    name: 'VouchRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endIndex',
        type: 'uint256',
      },
    ],
    name: 'VouchesProcessed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
    ],
    name: 'addVouch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_claimer',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: '_vouches',
        type: 'address[]',
      },
      {
        components: [
          {
            internalType: 'uint40',
            name: 'expirationTime',
            type: 'uint40',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ProofOfHumanityExtended.SignatureVouch[]',
        name: '_signatureVouches',
        type: 'tuple[]',
      },
    ],
    name: 'advanceState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'arbitratorDataHistory',
    outputs: [
      {
        internalType: 'uint96',
        name: 'metaEvidenceUpdates',
        type: 'uint96',
      },
      {
        internalType: 'contract IArbitrator',
        name: 'arbitrator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'arbitratorExtraData',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
    ],
    name: 'boundTo',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'ccDischargeHumanity',
    outputs: [
      {
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint40',
        name: 'expirationTime',
        type: 'uint40',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
      {
        internalType: 'uint40',
        name: '_expirationTime',
        type: 'uint40',
      },
    ],
    name: 'ccGrantHumanity',
    outputs: [
      {
        internalType: 'bool',
        name: 'success',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'challengePeriodDuration',
    outputs: [
      {
        internalType: 'uint40',
        name: '',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Reason',
        name: '_reason',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'challengeRequest',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_arbitratorExtraData',
        type: 'bytes',
      },
    ],
    name: 'changeArbitrator',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_crossChainProofOfHumanity',
        type: 'address',
      },
    ],
    name: 'changeCrossChainProofOfHumanity',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint40',
        name: '_humanityLifespan',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_renewalPeriodDuration',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_challengePeriodDuration',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_failedRevocationCooldown',
        type: 'uint40',
      },
    ],
    name: 'changeDurations',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_forkModule',
        type: 'address',
      },
    ],
    name: 'changeForkModule',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_governor',
        type: 'address',
      },
    ],
    name: 'changeGovernor',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_registrationMetaEvidence',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_clearingMetaEvidence',
        type: 'string',
      },
    ],
    name: 'changeMetaEvidence',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_requestBaseDeposit',
        type: 'uint256',
      },
    ],
    name: 'changeRequestBaseDeposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '_requiredNumberOfVouches',
        type: 'uint32',
      },
    ],
    name: 'changeRequiredNumberOfVouches',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_sharedStakeMultiplier',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_winnerStakeMultiplier',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_loserStakeMultiplier',
        type: 'uint256',
      },
    ],
    name: 'changeStakeMultipliers',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
    ],
    name: 'claimHumanity',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'crossChainProofOfHumanity',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'disputeIdToData',
    outputs: [
      {
        internalType: 'uint96',
        name: 'requestId',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'challengeId',
        type: 'uint96',
      },
      {
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
    ],
    name: 'executeRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'failedRevocationCooldown',
    outputs: [
      {
        internalType: 'uint40',
        name: '',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_arbitrator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_disputeId',
        type: 'uint256',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Party',
        name: '_side',
        type: 'uint8',
      },
    ],
    name: 'fundAppeal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
    ],
    name: 'fundRequest',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getArbitratorDataHistoryCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_challengeId',
        type: 'uint256',
      },
    ],
    name: 'getChallengeInfo',
    outputs: [
      {
        internalType: 'uint16',
        name: 'lastRoundId',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: 'challenger',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Party',
        name: 'ruling',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_claimer',
        type: 'address',
      },
    ],
    name: 'getClaimerRequestId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_challengeId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_round',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_contributor',
        type: 'address',
      },
    ],
    name: 'getContributions',
    outputs: [
      {
        internalType: 'uint256',
        name: 'forRequester',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'forChallenger',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
    ],
    name: 'getHumanityInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'vouching',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'pendingRevocation',
        type: 'bool',
      },
      {
        internalType: 'uint48',
        name: 'nbPendingRequests',
        type: 'uint48',
      },
      {
        internalType: 'uint40',
        name: 'expirationTime',
        type: 'uint40',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nbRequests',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
    ],
    name: 'getNumberOfVouches',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
    ],
    name: 'getRequestInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'punishedVouch',
        type: 'bool',
      },
      {
        internalType: 'uint8',
        name: 'usedReasons',
        type: 'uint8',
      },
      {
        internalType: 'uint16',
        name: 'arbitratorDataId',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'lastChallengeId',
        type: 'uint16',
      },
      {
        internalType: 'uint40',
        name: 'challengePeriodStart',
        type: 'uint40',
      },
      {
        internalType: 'address payable',
        name: 'requester',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: 'ultimateChallenger',
        type: 'address',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Status',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Reason',
        name: 'currentReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_challengeId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_round',
        type: 'uint256',
      },
    ],
    name: 'getRoundInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'appealed',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'paidFeesRequester',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'paidFeesChallenger',
        type: 'uint256',
      },
      {
        internalType: 'enum ProofOfHumanityExtended.Party',
        name: 'sideFunded',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'feeRewards',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governor',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'humanityLifespan',
    outputs: [
      {
        internalType: 'uint40',
        name: '',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'humanityOf',
    outputs: [
      {
        internalType: 'bytes20',
        name: 'humanityId',
        type: 'bytes20',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_wNative',
        type: 'address',
      },
      {
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_arbitratorExtraData',
        type: 'bytes',
      },
      {
        internalType: 'string',
        name: '_registrationMetaEvidence',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_clearingMetaEvidence',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_requestBaseDeposit',
        type: 'uint256',
      },
      {
        internalType: 'uint40',
        name: '_humanityLifespan',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_renewalPeriodDuration',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_challengePeriodDuration',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: '_failedRevocationCooldown',
        type: 'uint40',
      },
      {
        internalType: 'uint256[3]',
        name: '_multipliers',
        type: 'uint256[3]',
      },
      {
        internalType: 'uint32',
        name: '_requiredNumberOfVouches',
        type: 'uint32',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialized',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
    ],
    name: 'isClaimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'isHuman',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'loserStakeMultiplier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_iterations',
        type: 'uint256',
      },
    ],
    name: 'processVouches',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
    ],
    name: 'removeVouch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'renewHumanity',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renewalPeriodDuration',
    outputs: [
      {
        internalType: 'uint40',
        name: '',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'requestBaseDeposit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'requiredNumberOfVouches',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'revokeHumanity',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_disputeId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_ruling',
        type: 'uint256',
      },
    ],
    name: 'rule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sharedStakeMultiplier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'submitEvidence',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes20',
        name: '',
        type: 'bytes20',
      },
    ],
    name: 'vouches',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wNative',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'winnerStakeMultiplier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_beneficiary',
        type: 'address',
      },
      {
        internalType: 'bytes20',
        name: '_humanityId',
        type: 'bytes20',
      },
      {
        internalType: 'uint256',
        name: '_requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_challengeId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_round',
        type: 'uint256',
      },
    ],
    name: 'withdrawFeesAndRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
