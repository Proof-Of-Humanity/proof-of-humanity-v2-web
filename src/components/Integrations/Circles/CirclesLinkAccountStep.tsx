import React, { ChangeEvent } from 'react';
import Accordion from 'components/Accordion';
import Label from 'components/Label';
import Field from 'components/Field';
import InfoIcon from 'icons/info.svg';
import CircleCheckIcon from 'icons/CheckCircle.svg';
import ActionButton from 'components/ActionButton';
import CirclesAddressDisplay from './CirclesAddressDisplay';
import LoadingSpinner from './LoadingSpinner';

interface CirclesLinkAccountStepProps {
  linkStatus: "idle" | "linked" | "expired";
  walletAddress: string;
  onAddressChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLinkAccount: () => void;
  onRenewTrust: () => void;
  isLoading: boolean;
  isError: boolean;
  getActionButtonProps: (action: () => void, defaultLabel: string) => {
    onClick: () => void;
    label: string;
    disabled: boolean;
  };
  pending: boolean;
}

export default function CirclesLinkAccountStep({
  linkStatus,
  walletAddress,
  onAddressChange,
  onLinkAccount,
  onRenewTrust,
  isLoading,
  isError,
  getActionButtonProps,
  pending,
}: CirclesLinkAccountStepProps) {
  return (
    <Accordion title="Step 2 - Link Account" className="w-full">
      {isLoading ? (
        <div className="p-4 md:p-6 flex justify-center items-center my-5">
          <LoadingSpinner message="Loading Circles account info..." />
        </div>
      ) : isError ? (
        <div className="p-4 md:p-6 flex flex-col w-full">
          <Label className="normal-case mt-0" aria-live="assertive">Error fetching Circles account</Label>
          <span className="text-secondaryText mb-2" role="alert">
            Try again later.
          </span>
        </div>
      ) : (
        <>
          {linkStatus === "idle" && (
            <div className="p-4 md:p-6 flex flex-col w-full ">
              <Label className="normal-case mt-0">Paste your Circles Wallet Address</Label>
              <Field
                value={walletAddress}
                onChange={onAddressChange}
                placeholder="0x..."
                aria-label="Circles Wallet Address"
              />
              <div className="flex items-start text-sm mt-2">
                <InfoIcon width={16} height={16} className="mt-1 mr-1 stroke-orange-400 stroke-2" />
                <span className="text-secondaryText">
                  Make sure this is your correct Circles address. Please, double check it before linking the accounts as it's a permanent action.
                </span>
              </div>
              {(() => {
                const { onClick, label, disabled } = getActionButtonProps(onLinkAccount, 'Link');
                return (
                  <ActionButton
                    onClick={onClick}
                    label={label}
                    defaultLabel='Link'
                    ariaLabel="Link Circles account"
                    disabled={disabled}
                    isLoading={pending}
                    className="mt-4 self-start"
                  />
                );
              })()}
            </div>
          )}
          {linkStatus === "linked" && (
            <div className="p-4 md:p-6 flex flex-col w-full space-y-4">
              <div className="flex items-center">
                <span className='text-primaryText'>Circles account successfully linked to POHID</span>
                <CircleCheckIcon className="w-4 h-4 ml-1" />
              </div>
              <CirclesAddressDisplay walletAddress={walletAddress} />
              <span className="text-green-400 font-medium">Ready to start collecting Circles!</span>
            </div>
          )}
          {linkStatus === "expired" && (
            <div className="p-4 md:p-6 flex flex-col w-full space-y-4">
              <div className="flex items-center">
                <span className="text-orange-400">The humanity expired. Please renew trust on POH Group.</span>
                <InfoIcon width={16} height={16} className="ml-1 stroke-orange-400 stroke-2" />
              </div>
              <CirclesAddressDisplay walletAddress={walletAddress} />
              {(() => {
                const { onClick, label, disabled } = getActionButtonProps(onRenewTrust, 'Renew');
                return (
                  <ActionButton
                    onClick={onClick}
                    label={label}
                    defaultLabel='Renew'
                    ariaLabel="Renew Circles trust"
                    disabled={disabled}
                    isLoading={pending}
                    className="mt-2 self-start"
                  />
                );
              })()}
            </div>
          )}
        </>
      )}
    </Accordion>
  );
} 