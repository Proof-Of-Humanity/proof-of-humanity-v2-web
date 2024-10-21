import { SupportedChainId, getChainRpc, supportedChains } from 'config/chains';
import { Contract } from 'contracts';
import abis from 'contracts/abis';
import { Address, createPublicClient, http } from 'viem';
import Error from 'next/error';

export interface ArbitratorFromRequest {
  arbitrator: Address | undefined;
  extraData: bigint | undefined;
}

export interface CurrentRoundSideFunds {
  claimerFunds: bigint | undefined;
  challengerFunds: bigint | undefined;
}

export interface StakeMultipliers {
  winnerStakeMultiplier: bigint | undefined;
  loserStakeMultiplier: bigint | undefined;
  sharedStakeMultiplier: bigint | undefined;
}

export class APIPoH {
  private static apiReader: APIPoH; // Singleton

  private publicClient: any;
  private chainId: SupportedChainId;
  private address: Address;

  constructor(_chainId: SupportedChainId) {
    this.chainId = _chainId;
    this.address = Contract.ProofOfHumanity[_chainId] as Address;
    this.publicClient = createPublicClient({
      chain: supportedChains[_chainId],
      transport: http(getChainRpc(_chainId)),
    });
  }
  private static getApiReader(_chainId: SupportedChainId) {
    if (!APIPoH.apiReader || APIPoH.apiReader.chainId !== _chainId)
      APIPoH.apiReader = new APIPoH(_chainId);
    return APIPoH.apiReader;
  }

  private async get(func: string, args: Array<any> = []) {
    return await this.publicClient
      .readContract({
        address: this.address,
        abi: abis.ProofOfHumanity as any,
        functionName: func,
        args: args,
      })
      .catch(() => {
        throw new Error({ statusCode: 520, title: 'Error while reading ProofOfHumanity' });
      });
  }

  public static async getArbitratorFromRequest(
    _chainId: SupportedChainId,
    pohId: Address,
    requestIndex: number,
  ): Promise<ArbitratorFromRequest> {
    const apiReader = APIPoH.getApiReader(_chainId);
    const out: ArbitratorFromRequest = {
      arbitrator: undefined,
      extraData: undefined,
    };
    try {
      const data = await apiReader.get('getRequestInfo', [pohId, requestIndex]);
      const arbitratorDataHistory = await apiReader.get('arbitratorDataHistory', [data[2]]);
      out.arbitrator = arbitratorDataHistory[1];
      out.extraData = arbitratorDataHistory[2];
      return out;
    } catch (error) {
      throw new Error({ statusCode: 520, title: 'Error while reading ProofOfHumanity' });
    }
  }

  public static async getCurrentRoundSideFunds(
    _chainId: SupportedChainId,
    pohId: Address,
    requestIndex: number,
    arbitrator: Address,
    disputeId: bigint,
  ): Promise<CurrentRoundSideFunds> {
    const apiReader = APIPoH.getApiReader(_chainId);
    const out: CurrentRoundSideFunds = {
      claimerFunds: undefined,
      challengerFunds: undefined,
    };
    try {
      const data = await apiReader.get('disputeIdToData', [arbitrator, disputeId]);
      const challengeId = data[1];
      const challengeInfo = await apiReader.get('getChallengeInfo', [
        pohId,
        requestIndex,
        challengeId,
      ]);
      const lastRoundId = challengeInfo[0];
      const funds = await apiReader.get('getRoundInfo', [
        pohId,
        requestIndex,
        challengeId,
        lastRoundId,
      ]);
      out.claimerFunds = funds[1];
      out.challengerFunds = funds[2];
      return out;
    } catch (error) {
      throw new Error({ statusCode: 520, title: 'Error while reading ProofOfHumanity' });
    }
  }

  public static async getStakeMultipliers(_chainId: SupportedChainId): Promise<StakeMultipliers> {
    const apiReader = APIPoH.getApiReader(_chainId);
    const out: StakeMultipliers = {
      winnerStakeMultiplier: undefined,
      loserStakeMultiplier: undefined,
      sharedStakeMultiplier: undefined,
    };
    try {
      out.winnerStakeMultiplier = await apiReader.get('winnerStakeMultiplier');
      out.loserStakeMultiplier = await apiReader.get('loserStakeMultiplier');
      out.sharedStakeMultiplier = await apiReader.get('sharedStakeMultiplier');
      return out;
    } catch (error) {
      throw new Error({ statusCode: 520, title: 'Error while reading ProofOfHumanity' });
    }
  }
}
