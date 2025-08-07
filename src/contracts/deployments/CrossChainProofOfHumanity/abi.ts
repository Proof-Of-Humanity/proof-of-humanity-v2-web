export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "bridgeGateway",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "foreignProxy",
        type: "address",
      },
    ],
    name: "GatewayAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "bridgeGateway",
        type: "address",
      },
    ],
    name: "GatewayRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "expirationTime",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gateway",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transferHash",
        type: "bytes32",
      },
    ],
    name: "TransferInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "expirationTime",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transferHash",
        type: "bytes32",
      },
    ],
    name: "TransferReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "expirationTime",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gateway",
        type: "address",
      },
    ],
    name: "UpdateInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "expirationTime",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
    ],
    name: "UpdateReceived",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bridgeGateway",
        type: "address",
      },
      {
        internalType: "address",
        name: "_foreignProxy",
        type: "address",
      },
    ],
    name: "addBridgeGateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "_humanityId",
        type: "bytes20",
      },
    ],
    name: "boundTo",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "bridgeGateways",
    outputs: [
      {
        internalType: "address",
        name: "foreignProxy",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_governor",
        type: "address",
      },
    ],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IProofOfHumanity",
        name: "_proofOfHumanity",
        type: "address",
      },
    ],
    name: "changeProofOfHumanity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "governor",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "",
        type: "bytes20",
      },
    ],
    name: "humanityData",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint40",
        name: "expirationTime",
        type: "uint40",
      },
      {
        internalType: "uint40",
        name: "lastTransferTime",
        type: "uint40",
      },
      {
        internalType: "bool",
        name: "isHomeChain",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    name: "humanityOf",
    outputs: [
      {
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IProofOfHumanity",
        name: "_proofOfHumanity",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_transferCooldown",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "_humanityId",
        type: "bytes20",
      },
    ],
    name: "isClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    name: "isHuman",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proofOfHumanity",
    outputs: [
      {
        internalType: "contract IProofOfHumanity",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "bytes20",
        name: "_humanityId",
        type: "bytes20",
      },
      {
        internalType: "uint40",
        name: "_expirationTime",
        type: "uint40",
      },
      {
        internalType: "bytes32",
        name: "_transferHash",
        type: "bytes32",
      },
    ],
    name: "receiveTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "bytes20",
        name: "_humanityId",
        type: "bytes20",
      },
      {
        internalType: "uint40",
        name: "_expirationTime",
        type: "uint40",
      },
      {
        internalType: "bool",
        name: "_isActive",
        type: "bool",
      },
    ],
    name: "receiveUpdate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "receivedTransferHashes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bridgeGateway",
        type: "address",
      },
    ],
    name: "removeBridgeGateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_transferCooldown",
        type: "uint256",
      },
    ],
    name: "setTransferCooldown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "transferCooldown",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bridgeGateway",
        type: "address",
      },
    ],
    name: "transferHumanity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "",
        type: "bytes20",
      },
    ],
    name: "transfers",
    outputs: [
      {
        internalType: "bytes20",
        name: "humanityId",
        type: "bytes20",
      },
      {
        internalType: "uint40",
        name: "humanityExpirationTime",
        type: "uint40",
      },
      {
        internalType: "bytes32",
        name: "transferHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "foreignProxy",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bridgeGateway",
        type: "address",
      },
      {
        internalType: "bytes20",
        name: "_humanityId",
        type: "bytes20",
      },
    ],
    name: "updateHumanity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
