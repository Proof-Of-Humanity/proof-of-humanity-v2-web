export class RelayDataUnavailableError extends Error {
  constructor(message = "Relay details are not available right now.") {
    super(message);
    this.name = "RelayDataUnavailableError";
  }
}

export class CrossChainStatusUnavailableError extends Error {
  constructor(message = "Cross-chain status is not available right now.") {
    super(message);
    this.name = "CrossChainStatusUnavailableError";
  }
}
