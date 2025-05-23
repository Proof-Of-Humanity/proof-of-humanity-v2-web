export default [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_proofOfHumanity",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_crossChainProofOfHumanity",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_coreMembersGroup",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_hub",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_maximumBatchSize",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes20",
        "name": "humanityID",
        "type": "bytes20"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint40",
        "name": "humanityExpirationTime",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "trustExpiryTime",
        "type": "uint96"
      }
    ],
    "name": "AccountRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "TrustReEvaluationBatchProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "expirationTime",
        "type": "uint96"
      }
    ],
    "name": "TrustReEvaluationCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes20",
        "name": "humanityID",
        "type": "bytes20"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "newTrustExpiryTime",
        "type": "uint96"
      }
    ],
    "name": "TrustRenewed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "batchStates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "nextIndexToProcess",
        "type": "uint256"
      },
      {
        "internalType": "uint40",
        "name": "currentMaxExpiryTime",
        "type": "uint40"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_coreMembersGroup",
        "type": "address"
      }
    ],
    "name": "changeCoreMembersGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_crossChainProofOfHumanity",
        "type": "address"
      }
    ],
    "name": "changeCrossChainProofOfHumanity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_hub",
        "type": "address"
      }
    ],
    "name": "changeHub",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maximumBatchSize",
        "type": "uint256"
      }
    ],
    "name": "changeMaximumBatchSize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_proofOfHumanity",
        "type": "address"
      }
    ],
    "name": "changeProofOfHumanity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "circlesAccountToHumanityIDs",
    "outputs": [
      {
        "internalType": "bytes20",
        "name": "",
        "type": "bytes20"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "coreMembersGroup",
    "outputs": [
      {
        "internalType": "contract ICoreMembersGroup",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "crossChainProofOfHumanity",
    "outputs": [
      {
        "internalType": "contract ICrossChainProofOfHumanity",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hub",
    "outputs": [
      {
        "internalType": "contract IHub",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes20",
        "name": "",
        "type": "bytes20"
      }
    ],
    "name": "humanityIDToCirclesAccount",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maximumBatchSize",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proofOfHumanity",
    "outputs": [
      {
        "internalType": "contract IProofOfHumanity",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "reEvaluateTrust",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes20",
        "name": "humanityID",
        "type": "bytes20"
      },
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes20",
        "name": "humanityID",
        "type": "bytes20"
      }
    ],
    "name": "renewTrust",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newGovernor",
        "type": "address"
      }
    ],
    "name": "transferGovernorship",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]