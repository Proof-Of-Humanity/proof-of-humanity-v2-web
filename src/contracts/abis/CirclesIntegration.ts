export default [
  {
    inputs: [
      {
        internalType: "address",
        "name": "_proofOfHumanity",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_coreMembersGroup",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_crossChainProofOfHumanity",
        "type": "address"
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
      }
    ],
    "name": "AccountRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes20[]",
        "name": "humanityIDs",
        "type": "bytes20[]"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "accounts",
        "type": "address[]"
      }
    ],
    "name": "AccountsRemoved",
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
      }
    ],
    "name": "TrustRenewed",
    "type": "event"
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
        "internalType": "bytes20[]",
        "name": "humanityIDs",
        "type": "bytes20[]"
      }
    ],
    "name": "revokeTrust",
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