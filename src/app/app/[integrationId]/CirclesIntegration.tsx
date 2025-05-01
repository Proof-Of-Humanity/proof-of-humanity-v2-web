"use client";
import { Integration } from "types/integrations";
import Image from "next/image";
import Accordion from "components/Accordion";
import IntegrationInfoCard from "components/Integrations/IntegrationInfoCard";
import { useEffect, useState, useCallback} from "react";
import InfoIcon from "icons/info.svg";
import Label from "components/Label";
import Field from "components/Field";
import ProcessStepCard from "components/Integrations/ProcessStepCard";
import CirclesLogo from "icons/CriclesLogo.svg";
import ExternalLinkIcon from "icons/ExternalLink.svg";
import CircleCheckIcon from "icons/CheckCircle.svg";
import { injected, useAccount, useChainId, useConnect, useSwitchChain } from "wagmi";
import { SupportedChainId } from "config/chains";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado } from "viem/chains";
import React from "react";
import { getCirclesAccountsByAddress } from "data/circles";
import { toast } from "react-toastify";
import { isAddress } from "viem";

interface CirclesIntegrationProps {
  integration: Integration;
}

export default React.memo(function CirclesIntegration({ integration }: CirclesIntegrationProps) {
  console.log("CirclesIntegration rendered");
  const {address , isConnected} = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const {connect} = useConnect();
  const [currentCreateAccountStep, setCurrentCreateAccountStep] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [linkStatus, setLinkStatus] = useState<"idle"|"linked"|"expired">("idle");
  const [currentMintStep, setCurrentMintStep] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<unknown>(null);
  let timer:any = null;
  const circlesChainId = configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis.id : gnosisChiado.id;
  const isWalletAddressValid = isAddress(walletAddress.trim());

  const handleWalletAddressChange = (e:any) => {
    if(timer) clearTimeout(timer);
    timer = setTimeout(() => setWalletAddress(e.target.value), 500);

  };
  const handleLinkAccounts = async () => {
    if (!walletAddress) return;
    
  };
  const handleRenew = async () => {
    if (!walletAddress) return;

  };

  // Fetch Circles account info when connected address changes
  useEffect(() => {
    if (!isConnected || !address) {
      setLinkStatus("idle");
      setWalletAddress("");
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    getCirclesAccountsByAddress(address)
      .then(({ data, error }) => {
        console.log("data", data);
        if (error || !data) {
          setFetchError(error);
          toast.error("Error fetching Circles account");
          return;
        }
        let id , trustExpiryTime;
        let homechainAccounts = data.registrations
          .map((r) => r.circleAccount)
          .filter(Boolean) as any;
        let crossChainAccounts = data.crossChainRegistrations
        .map((r) => r.circleAccount)
        .filter(Boolean) as any;
        if(homechainAccounts.length > 0) {
          ({ id, trustExpiryTime } = homechainAccounts[0]);
        } else if(crossChainAccounts.length > 0) {
          ({ id, trustExpiryTime } = crossChainAccounts[0]);
        }
        else {
          setLinkStatus("idle");
          setWalletAddress("");
          return;
        }
        setWalletAddress(id as string);
        const expiryMs = Number(trustExpiryTime) * 1000;
        setLinkStatus(expiryMs > Date.now() ? "linked" : "expired");
      })
      .catch((err) => {
        setFetchError(err);
        toast.error("Error fetching Circles account");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [isConnected, address, circlesChainId]);

  // Helper to compute onClick and label for action buttons
    const getActionButtonProps = useCallback((action: () => Promise<void>, defaultLabel: string) => {
    if (!isConnected) {
      return { onClick: () => connect({ connector: injected() }), label: 'Connect Wallet' };
    }
    const isWrongChain = connectedChainId !== circlesChainId;
    if (isWrongChain) {
      return { onClick: () => switchChain({ chainId: circlesChainId }), label: 'Switch Chain' };
    }
    return { onClick: action, label: defaultLabel };
  }, [isConnected, connectedChainId]);

  return (
    <div className="flex flex-col paper w-10/12">
        <div className="flex flex-col paper">
        <div className="p-6">
        {integration.logo && (
          <div className="mb-4">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={164}
              height={48}
            />
          </div>
        )}
        <h3 className="text-primaryText">{integration.title}</h3>
        <p className="mb-4 text-sm text-gray-600 whitespace-nowrap text-primaryText">
          {integration.description}
        </p>
      </div>
        </div>
        <div className="flex flex-col paper justify-center items-center px-8 py-4 space-y-4">
            <Accordion title="Step 1 - Create your Circles Account" className="w-full">
                <div className="p-6">
                <IntegrationInfoCard step={integration.connectionSteps![currentCreateAccountStep]} 
                onPrevious={() => setCurrentCreateAccountStep((prev) => prev - 1)}
                onNext={() => setCurrentCreateAccountStep((prev) => prev + 1)}
                previousStep={currentCreateAccountStep > 0}
                nextStep={currentCreateAccountStep < integration.connectionSteps!.length - 1}
                />
                </div>
            </Accordion>
            <Accordion title="Step 2 - Link Account" className="w-full">
              {isFetching ? (
                <div className="p-6 flex justify-center items-center my-5">
                  <span className="text-secondaryText">Loading Circles account info...</span>
                </div>
              ) : fetchError ? (
                  <div className="p-6 flex flex-col w-full">
                    <Label className="normal-case mt-0">Error fetching Circles account</Label>
                    <span className="text-secondaryText">Please try again later</span>
                  </div>
                ) : (
                <>          
                  {linkStatus === "idle" && (
                    <div className="p-6 flex flex-col w-full ">
                      <Label className="normal-case mt-0">Paste your Circles Wallet Address</Label>
                      <Field
                        onChange={handleWalletAddressChange}
                      />
                      <div className="flex items-start text-sm mt-2">
                        <InfoIcon width={16} height={16} className="mt-1 mr-1 stroke-orange-400 stroke-2" />
                        <span className="text-secondaryText">
                          Make sure this is your correct Circles address. Please, double check it before linking the accounts as it's a permanent action.
                        </span>
                      </div>
                      {(() => {
                        const { onClick, label } = getActionButtonProps(handleLinkAccounts, 'Link');
                        return (
                          <button
                            onClick={onClick}
                            aria-label="Link Circles account"
                            tabIndex={0}
                            className="btn-main gradient mt-4 self-start px-5 py-2 normal-case disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isWalletAddressValid}
                          >
                            {label}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                  {linkStatus === "linked" && (
                    <div className="p-6 flex flex-col w-full space-y-4">
                      <div className="flex items-center">
                        <span>Circles account successfully linked to POHID</span>
                        <CircleCheckIcon className="w-4 h-4 ml-1" />
                      </div>
                      <div className="flex items-center flex-wrap text-primaryText">
                        <CirclesLogo className="w-6 h-6 mr-2 flex-shrink-0" />
                        <span className="text-secondaryText mr-2 break-all">{walletAddress}</span>
                        <a
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-orange"
                          aria-label="View address on Circles website"
                          tabIndex={0}
                        >
                          View on Circles <ExternalLinkIcon className="ml-1 w-4 h-4" />
                        </a>
                      </div>
                      <span className="text-green-400 font-medium">Ready to start collecting Circles!</span>
                    </div>
                  )}
                  {linkStatus === "expired" && (
                    <div className="p-6 flex flex-col w-full space-y-4">
                      <div className="flex items-center">
                        <span className="text-orange-400">The humanity expired. Please renew trust on POH Group.</span>
                        <InfoIcon  width={16} height={16} className="ml-1 stroke-orange-400 stroke-2" />
                      </div>
                      <div className="flex items-center flex-wrap text-primaryText">
                        <CirclesLogo className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-secondaryText mr-2 break-all">{walletAddress}</span>
                        <a 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-orange"
                          aria-label="View address on Circles website"
                          tabIndex={0}
                        >
                          View on Circles <ExternalLinkIcon className="ml-1 w-4 h-4" />
                        </a>
                      </div>
                      {(() => {
                        const { onClick, label } = getActionButtonProps(handleRenew, 'Renew');
                        return (
                          <button
                            onClick={onClick}
                            aria-label="Renew Circles trust"
                            tabIndex={0}
                            className="btn-main gradient mt-2 self-start px-5 py-2 normal-case disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {label}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </Accordion>
            <Accordion title="Step 3 - Mint your POH Circles group tokens" className="w-full">
              <div className="p-6 flex flex-col w-full">
                <ProcessStepCard step={integration.mintSteps![currentMintStep]} 
                onPrevious={() => setCurrentMintStep((prev) => prev - 1)}
                onNext={() => setCurrentMintStep((prev) => prev + 1)}
                previousStep={currentMintStep > 0}
                nextStep={currentMintStep < integration.mintSteps!.length - 1}
                />
              </div>
            </Accordion>
        </div>
    </div>
  );
});