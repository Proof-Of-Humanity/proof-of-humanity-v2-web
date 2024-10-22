import crossChainProofOfHumanity from "./cross-chain-proof-of-humanity";
import proofOfHumanity from "./proof-of-humanity";
import proofOfHumanityOLD from "./proof-of-humanity.OLD";

const abisMainnets = {
  ProofOfHumanity: proofOfHumanity,
  ProofOfHumanityOLD: proofOfHumanityOLD,
  CrossChainProofOfHumanity: crossChainProofOfHumanity,
} as const;

export default abisMainnets;
