import type { Config, Context } from "@netlify/functions";
import { createWalletClient, http, publicActions, formatEther, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { GraphQLClient, gql } from 'graphql-request';

const SIMULATE = process.env.ETH_STATE_UPDATE_SIMULATE == "true";
const rpcUrl = process.env.MAINNET_RPC;
const privateKey = process.env.PRIVATE_KEY;
const TX_BATCH_SIZE = 15;

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const multicall3Abi = [
    {
        inputs: [
            {
                components: [
                    { name: "target", type: "address" },
                    { name: "allowFailure", type: "bool" },
                    { name: "callData", type: "bytes" }
                ],
                name: "calls",
                type: "tuple[]"
            }
        ],
        name: "aggregate3",
        outputs: [
            {
                components: [
                    { name: "success", type: "bool" },
                    { name: "returnData", type: "bytes" }
                ],
                name: "returnData",
                type: "tuple[]"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
] as const;

const contractQuery = gql`
    query Contract {
        crossChainGateways {
            id
        }
    }
`;

const humanityQuery = gql`
    query GetHumanities($first: Int, $skip: Int, $now: String!) {
        humanities(first: $first, skip: $skip, where: { registration_: { expirationTime_gt: $now } }) {
            id
            registration {
                expirationTime
            }
        }
    }
`;

const gnosisQuery = gql`
    query GetGnosisRegistrations($first: Int, $skip: Int) {
        crossChainRegistrations(first: $first, skip: $skip) {
            id 
            expirationTime
            claimer { id }
        }
    }
`;

async function updateStateEthGnosis() {
    
    if (!rpcUrl || !privateKey) {
        throw new Error("Missing MAINNET_RPC or PRIVATE_KEY in environment variables");
    }

    const { getContractInfo } = await import('../../src/contracts/registry');

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const client = createWalletClient({
        account,
        chain: mainnet,
        transport: http(rpcUrl)
    }).extend(publicActions);

    const balance = await client.getBalance({ address: account.address });
    console.log(`Account Balance: ${formatEther(balance)} ETH`);
    if (balance === 0n) {
        console.warn("WARNING: Account has 0 ETH. Gas estimation might fail.");
    }

    const mainnetClient = new GraphQLClient(process.env.MAINNET_SUBGRAPH_URL!);
    const gnosisClient = new GraphQLClient(process.env.GNOSIS_SUBGRAPH_URL!);

    const contractData = await mainnetClient.request<{ crossChainGateways: { id: string }[] }>(contractQuery);
    const gateways = contractData.crossChainGateways;
    if (!gateways || gateways.length === 0) throw new Error("No gateways found");

    const gateway = gateways[gateways.length - 1];
    const gatewayId = gateway.id;

    const info = getContractInfo("CrossChainProofOfHumanity", mainnet.id);
    const ccpohAddress = info.address || "0xa478095886659168E8812154fB0DE39F103E74b2" as `0x${string}`;

    const now = Math.floor(Date.now() / 1000);

    let mainnetHumanities: string[] = [];
    let skip = 0;
    const batchSize = 1000;
    
    while (true) {
        const res = await mainnetClient.request<{ humanities: { id: string, registration: { expirationTime: string } }[] }>(
            humanityQuery, 
            { first: batchSize, skip, now: now.toString() }
        );
        if (!res.humanities || res.humanities.length === 0) break;
        
        mainnetHumanities.push(...res.humanities.map(h => h.id));
        if (res.humanities.length < batchSize) break;
        skip += batchSize;
    }

    let gnosisRegistrations: Record<string, { expirationTime: string }> = {};
    skip = 0;
    
    while (true) {
        const res = await gnosisClient.request<{ crossChainRegistrations: { id: string, expirationTime: string, claimer: { id: string } }[] }>(gnosisQuery, { first: batchSize, skip });
        if (!res.crossChainRegistrations || res.crossChainRegistrations.length === 0) break;
        
        for (const reg of res.crossChainRegistrations) {
            const humanityId = reg.claimer?.id?.toLowerCase() || reg.id.toLowerCase();
            gnosisRegistrations[humanityId] = { expirationTime: reg.expirationTime };
        }
        
        if (res.crossChainRegistrations.length < batchSize) break;
        skip += batchSize;
    }

    const profilesToUpdate: string[] = [];
    const profilesUpToDate: string[] = [];
    
    for (const id of mainnetHumanities) {
        const humanityId = id.toLowerCase();
        const gnosisReg = gnosisRegistrations[humanityId];
        
        if (!gnosisReg) {
            profilesToUpdate.push(humanityId);
        } else {
            if (Number(gnosisReg.expirationTime) < now) {
                profilesToUpdate.push(humanityId);
            } else {
                profilesUpToDate.push(humanityId);
            }
        }
    }

    console.log(`Found ${profilesToUpdate.length} profiles needing update.`);

    if (profilesToUpdate.length === 0) {
        console.log("No profiles need updating. Exiting.");
        return;
    }

    let totalGasCost = 0n;

    const abi = getContractInfo("CrossChainProofOfHumanity", mainnet.id).abi;

    for (let i = 0; i < profilesToUpdate.length; i += TX_BATCH_SIZE) {
        const batchProfiles = profilesToUpdate.slice(i, i + TX_BATCH_SIZE);
        const batchIndex = Math.floor(i / TX_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(profilesToUpdate.length / TX_BATCH_SIZE);
        
        console.log(`[Batch ${batchIndex}/${totalBatches}] Processing ${batchProfiles.length} profiles...`);

        const batchCalls = [];

        for (const pohId of batchProfiles) {
            const callData = encodeFunctionData({
                abi,
                functionName: "updateHumanity",
                args: [gatewayId as `0x${string}`, pohId as `0x${string}`]
            });

            batchCalls.push({
                target: ccpohAddress,
                allowFailure: true,
                callData: callData
            });
        }

        if (batchCalls.length === 0) continue;

        console.log(`Batch Target: ${MULTICALL3_ADDRESS}`);

            const gasEstimate = await client.estimateContractGas({
                address: MULTICALL3_ADDRESS,
                abi: multicall3Abi,
                functionName: "aggregate3",
                args: [batchCalls],
                account,
                stateOverride: [
                    {
                        address: account.address,
                        balance: parseEther('10')
                    }
                ]
            });

            const gasPrice = await client.getGasPrice();
            const cost = gasEstimate * gasPrice;
            totalGasCost += cost;

            console.log(`Gas Estimate: ${gasEstimate.toString()}`);
            console.log(`Estimated Cost: ${formatEther(cost)} ETH`);

            if (SIMULATE) {
                console.log(`Simulation mode: Batch Tx not sent.`);
            } else {
                const hash = await client.writeContract({
                    address: MULTICALL3_ADDRESS,
                    abi: multicall3Abi,
                    functionName: "aggregate3",
                    args: [batchCalls],
                    account
                });
                console.log(`Batch Tx sent: ${hash}`);
                await client.waitForTransactionReceipt({ hash });
                console.log(`Batch Confirmed.`);   
            }
    }
    
    console.log(`Total Estimated Gas Cost for all updates: ${formatEther(totalGasCost)} ETH`);
    console.log(`[${new Date().toISOString()}] Completed update-state-eth-gnosis scheduled function`);
}

export default async (req: Request, context: Context) => {
    try {
        console.log("Function update-state-eth-gnosis triggered at:", new Date().toISOString());
        await updateStateEthGnosis();
        
        return new Response(JSON.stringify({
            message: "Update state eth-gnosis completed successfully",
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("Error in scheduled function:", error);
        
        return new Response(JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config: Config = {
    schedule: "*/5 * * * *"
};
