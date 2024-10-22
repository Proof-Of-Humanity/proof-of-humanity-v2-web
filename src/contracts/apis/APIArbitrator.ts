import { SupportedChainId, getChainRpc, supportedChains } from "config/chains";
import { Address, createPublicClient, http } from "viem";
import Error from "next/error";
import klerosLiquid from "contracts/abis/kleros-liquid";

export enum DisputeStatusEnum {
  Waiting,
  Appealable,
  Solved,
}

export enum SideEnum {
  shared,
  claimer,
  challenger,
}

export interface ArbitratorsData {
  status: DisputeStatusEnum | undefined;
  cost: bigint | undefined;
  period: bigint[] | undefined;
  currentRuling: SideEnum | undefined;
}

export class APIArbitrator {
  private static apiReader: APIArbitrator; // Singleton

  private publicClient: any;
  private chainId: SupportedChainId;
  private address: Address;

  constructor(_chainId: SupportedChainId, _arbitrator: Address) {
    this.chainId = _chainId;
    this.address = _arbitrator;
    this.publicClient = createPublicClient({
      chain: supportedChains[_chainId],
      transport: http(getChainRpc(_chainId)),
    });
  }
  private static getApiReader(
    _chainId: SupportedChainId,
    _arbitrator: Address,
  ) {
    if (
      !APIArbitrator.apiReader ||
      APIArbitrator.apiReader.chainId !== _chainId ||
      APIArbitrator.apiReader.address !== _arbitrator
    )
      APIArbitrator.apiReader = new APIArbitrator(_chainId, _arbitrator);
    return APIArbitrator.apiReader;
  }

  private async get(func: string, args: Array<any> = []) {
    return await this.publicClient
      .readContract({
        address: this.address,
        abi: klerosLiquid as any,
        functionName: func,
        args: args,
      })
      .catch(() => {
        throw new Error({
          statusCode: 521,
          title: "Error while reading Arbitrator",
        });
      });
  }

  public static async getArbitratorsData(
    chainId: SupportedChainId,
    _arbitrator: Address,
    disputeId: bigint,
    extraData: bigint,
  ): Promise<ArbitratorsData> {
    const apiReader = APIArbitrator.getApiReader(chainId, _arbitrator);
    const out: ArbitratorsData = {
      status: undefined,
      cost: undefined,
      currentRuling: undefined,
      period: undefined,
    };
    try {
      out.status = await apiReader.get("disputeStatus", [disputeId]);
      out.cost = await apiReader.get("appealCost", [disputeId, extraData]);
      out.period = await apiReader.get("appealPeriod", [disputeId]);
      out.currentRuling = await apiReader.get("currentRuling", [disputeId]);
      return out;
    } catch (error) {
      throw new Error({
        statusCode: 521,
        title: "Error while reading Arbitrator",
      });
    }
  }
}
