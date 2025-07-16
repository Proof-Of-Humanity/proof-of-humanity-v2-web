"use client";

import { useEffectOnce } from "@legendapp/state/react";
import Arrow from "components/Arrow";
import BulletedNumber from "components/BulletedNumber";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import Identicon from "components/Identicon";
import Modal from "components/Modal";
import Progress from "components/Progress";
import TimeAgo from "components/TimeAgo";
import { SupportedChainId, idToChain } from "config/chains";
import {
  APIArbitrator,
  ArbitratorsData,
  DisputeStatusEnum,
  SideEnum,
} from "contracts/apis/APIArbitrator";
import { APIPoH, StakeMultipliers } from "contracts/apis/APIPoH";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { RequestQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {RequestStatus, getStatusLabel } from "utils/status";
import { eth2Wei, formatEth } from "utils/misc";
import { Address } from "viem";

interface SideFundingProps {
  side: SideEnum;
  arbitrator: Address;
  disputeId: bigint;
  contributor: Address;
  requester: Address;
  requesterFunds: bigint;
  appealCost: bigint;
  chainId: SupportedChainId;
  loosingSideHasEnd: boolean;
}

const SideFunding: React.FC<SideFundingProps> = ({
  side,
  disputeId,
  arbitrator,
  contributor,
  requester,
  requesterFunds,
  appealCost,
  chainId,
  loosingSideHasEnd,
}) => {
  const title = side === SideEnum.claimer ? "Claimer" : "Challenger";
  const shrunkAddress: string =
    requester.substring(0, 6) + " ... " + requester.slice(-4);
  const [requesterInput, setRequesterInput] = useState(0n);
  const loading = useLoading();
  const errorRef = useRef(false);

  const value = (formatEth(requesterFunds) * 100) / formatEth(appealCost);
  const valueProgress = value > 100 ? 100 : value;
  const unit = idToChain(chainId)?.nativeCurrency.symbol;

  const [prepareFundAppeal] = usePoHWrite(
    "fundAppeal",
    useMemo(
      () => ({
        onLoading() {
          loading.start();
        },
        onReady(fire) {
          fire();
        },
        onFail() {
          !errorRef.current &&
            toast.info(
              "Transaction is not possible! Do you have enough funds?",
            );
          errorRef.current = true;
        },
      }),
      [loading],
    ),
  );

  return (
    <div className="w-full border p-4">
      <div className="mb-2 flex gap-2">
        <Identicon diameter={32} address={requester} />
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="text-sm">{shrunkAddress}</span>
        </div>
      </div>
      <div className="flex gap-1">
        <Field
          type="number"
          onChange={(v) => setRequesterInput(eth2Wei(+v.target.value))}
        />
        <button
          className={`gradient rounded px-4 text-white ${
            !contributor || errorRef.current || loosingSideHasEnd
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
          disabled={!contributor || errorRef.current || loosingSideHasEnd}
          onClick={async () => {
            prepareFundAppeal({
              args: [arbitrator as Address, BigInt(disputeId), side],
              value: requesterInput,
            });
          }}
        >
          Fund
        </button>
      </div>
      <Progress
        value={valueProgress}
        label={`${formatEth(requesterFunds)} ${unit} out of ${formatEth(appealCost)} ${unit}`}
      />
    </div>
  );
};

interface AppealProps {
  pohId: Address;
  requestIndex: number;
  arbitrator: Address;
  extraData: any;
  contributor: Address;
  claimer: Address;
  challenger: Address;
  disputeId: bigint;
  chainId: SupportedChainId;
  currentChallenge: ArrayElement<
    NonNullable<NonNullable<RequestQuery>["request"]>["challenges"]
  >;
  revocation: boolean;
  requestStatus: RequestStatus;
}

const Appeal: React.FC<AppealProps> = ({
  pohId,
  requestIndex,
  disputeId,
  arbitrator,
  extraData,
  contributor,
  chainId,
  claimer,
  challenger,
  currentChallenge,
  revocation,
  requestStatus,
}) => {
  const [totalClaimerCost, setTotalClaimerCost] = useState(0n);
  const [totalChallengerCost, setTotalChallengerCost] = useState(0n);
  const [formatedCurrentRuling, setFormatedCurrentRuling] = useState("");
  const defaultPeriod = [0n, 0n];
  const [period, setPeriod] = useState(defaultPeriod);
  const [loosingSideHasEnd, setLoosingSideHasEnd] = useState(false);
  const [loosingSideDeadline, setLoosingSideDeadline] = useState(0);
  const [currentRulingFormatted, setCurrentRulingFormatted] = useState(0);

  const [disputeStatus, setDisputeStatus] = useState(
    DisputeStatusEnum.Appealable,
  );
  const [error, setError] = useState(false);
  const errorRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [claimerFunds, setClaimerFunds] = useState(0n);
  const [challengerFunds, setChallengerFunds] = useState(0n);

  useEffectOnce(() => {
    const formatCurrentRuling = (currentRuling: SideEnum) => {
      var text = "Undecided";
      switch (currentRuling) {
        case SideEnum.claimer:
          text = "Claimer wins";
          break;
        case SideEnum.challenger:
          text = "Challenger wins";
          break;
        case SideEnum.shared:
          text = "Shared";
      }
      setFormatedCurrentRuling(text);
    };

    const calculateTotalCost = (
      appealCost: bigint,
      currentRuling: SideEnum,
      winnerMult: number,
      loserMult: number,
      sharedMult: number,
    ) => {
      const getSideTotalCost = (sideMultiplier: number) => {
        return (
          Number(appealCost) +
          (Number(appealCost) * sideMultiplier) / MULTIPLIER_DIVISOR
        );
      };
      const MULTIPLIER_DIVISOR = 10000;

      const claimerMultiplier =
        currentRuling === SideEnum.shared
          ? sharedMult
          : currentRuling === SideEnum.claimer
            ? winnerMult
            : loserMult;
      const totalClaimerCost = getSideTotalCost(Number(claimerMultiplier));
      setTotalClaimerCost(BigInt(totalClaimerCost));

      const challengerMultiplier =
        currentRuling === SideEnum.shared
          ? sharedMult
          : currentRuling === SideEnum.claimer
            ? loserMult
            : winnerMult;
      const totalChallengerCost = getSideTotalCost(
        Number(challengerMultiplier),
      );
      setTotalChallengerCost(BigInt(totalChallengerCost));
    };

    const getAppealData = async () => {
      try {
        const isPartiallyFunded =
          Number(currentChallenge.nbRounds) + 1 ===
          currentChallenge.rounds.length;
        const claimerFunds = isPartiallyFunded
          ? currentChallenge.rounds.at(-1)?.requesterFund.amount
          : 0n;
        const challengerFunds = isPartiallyFunded
          ? currentChallenge.rounds.at(-1)?.challengerFund
            ? currentChallenge.rounds.at(-1)?.challengerFund?.amount
            : 0n
          : 0n;
        setClaimerFunds(claimerFunds);
        setChallengerFunds(challengerFunds);

        const stakeMultipliers: StakeMultipliers =
          await APIPoH.getStakeMultipliers(chainId);
        const winnerMult = stakeMultipliers.winnerStakeMultiplier;
        const loserMult = stakeMultipliers.loserStakeMultiplier;
        const sharedMult = stakeMultipliers.sharedStakeMultiplier;

        const arbitratorsData: ArbitratorsData =
          await APIArbitrator.getArbitratorsData(
            chainId,
            arbitrator,
            disputeId,
            extraData,
          );
        const status = arbitratorsData.status;
        const cost = arbitratorsData.cost;
        const period = arbitratorsData.period;
        const currentRuling = arbitratorsData.currentRuling;

        setPeriod(period!);
        const loosingSideDeadline =
          (parseInt(String(period![0])) + parseInt(String(period![1]))) / 2;

        setLoosingSideHasEnd(loosingSideDeadline < Date.now() / 1000);
        setLoosingSideDeadline(loosingSideDeadline);
        setDisputeStatus(Number(status) as DisputeStatusEnum);
        const currentRulingFormatted = Number(currentRuling) as SideEnum;
        setCurrentRulingFormatted(currentRulingFormatted);
        formatCurrentRuling(currentRulingFormatted);
        calculateTotalCost(
          cost!,
          currentRulingFormatted,
          Number(winnerMult),
          Number(loserMult),
          Number(sharedMult),
        );

        setLoading(false);
      } catch (e) {
        !errorRef.current &&
          toast.info(
            "Unexpected error while reading appelate round info. Come back later",
          );
        setError(true);
        errorRef.current = true;
        console.log(e);
      }
    };
    getAppealData();
  });
  return disputeStatus === DisputeStatusEnum.Appealable &&
    !error &&
    !loading ? (
    <Modal
      header={`Appeal case #${disputeId}`}
      trigger={
        <button className="
          btn-sec 
          py-2
          rounded
          w-[150px]
          md:w-auto
        ">
          <span className="
            flex 
            items-center
            flex-wrap
            md:flex-nowrap
            flex-inline
            whitespace-nowrap
          ">
            Appeal (ends&nbsp;
            <TimeAgo time={parseInt(String(period[1]))} />
            )
          </span>
        </button>
      }
    >
      <div className="paper w-full px-16 py-8">
        <h1 className="mb-4 text-xl">
          Appeal the decision: {formatedCurrentRuling}
        </h1>
        <div className="gradient-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9966] to-[#FF8CA9]"></div>
          <div className="absolute inset-0 border-2 border-solid border-transparent"></div>
          <div className="mb-1"></div>
        </div>
        <div className="container mt-4">
          <div className="flex items-center">
            <BulletedNumber number={1} />
            {!revocation ? (
              <span className="mx-2 mt-2 text-sm">
                The profile was challenged for{" "}
                <strong className="text-status-challenged">
                  {getStatusLabel(requestStatus)}
                </strong>
                .
              </span>
            ) : (
              <span className="mx-2 mt-2 text-sm">
                The profile was challenged.
              </span>
            )}
          </div>
          <div className="flex items-center">
            <BulletedNumber number={2} />

            <span className="mx-2 mt-2 text-sm">
              Independent jurors evaluated the evidence, policy compliance, and
              voted in favor of:{" "}
              {currentRulingFormatted === SideEnum.challenger
                ? "Challenger"
                : currentRulingFormatted === SideEnum.claimer
                  ? "Claimer"
                  : "Shared"}
              .
              <div className="mt-[-1.4rem]">
                <ExternalLink
                  className="text-orange mx-2 flex flex-row flex-wrap justify-end gap-x-[8px] text-sm font-semibold leading-none hover:text-orange-500 md:gap-2 lg:gap-3"
                  href={`https://resolve.kleros.io/${chainId}/cases/${currentChallenge.disputeId}`}
                >
                  <span className="mt-1 text-right text-sm font-semibold leading-none">
                    Check how the jury voted
                  </span>
                  <Arrow />
                </ExternalLink>
              </div>
            </span>
          </div>
          <div className="flex items-center">
            <BulletedNumber number={3} current={!loosingSideHasEnd} />
            {loosingSideHasEnd ? (
              <span className="mx-2 mt-2 text-sm">
                The losing party's appeal time ended&nbsp;
                <TimeAgo time={loosingSideDeadline} />.
              </span>
            ) : (
              <span className="mx-2 mt-2 text-sm">
                The losing party's appeal time ends&nbsp;
                <TimeAgo time={loosingSideDeadline} />.
              </span>
            )}
          </div>
          <div className="flex items-center">
            <BulletedNumber number={4} current />
            <span className="mx-2 mt-2 text-sm">
              Appeal timeframe ends&nbsp;
              <TimeAgo time={parseInt(String(period[1]))} />.
            </span>
          </div>
          <div className="mb-4 mt-4">
            <span className="text-sm">
              In order to appeal the decision, you need to fully fund the
              crowdfunding deposit. The dispute will be sent to the jurors when
              the full deposit is reached. Note that if the previous round loser
              funds its side, the previous round winner should also fully fund
              its side, in order not to lose the case.
            </span>
            <div className="mt-4 flex items-center opacity-75">
              <Image
                alt="warning"
                src="/logo/exclamation.svg"
                height={24}
                width={24}
              />
              <span className="mx-2 text-sm opacity-75">
                External contributors can also crowdfund the appeal.
              </span>
            </div>
          </div>
        </div>
        <br />
        <div className="flex items-center">
          <SideFunding
            side={SideEnum.claimer}
            disputeId={disputeId}
            arbitrator={arbitrator!}
            contributor={contributor}
            requester={claimer}
            requesterFunds={claimerFunds}
            appealCost={totalClaimerCost}
            chainId={chainId}
            loosingSideHasEnd={
              currentRulingFormatted === SideEnum.challenger
                ? loosingSideHasEnd
                : false
            }
          />
          <SideFunding
            side={SideEnum.challenger}
            disputeId={disputeId}
            arbitrator={arbitrator!}
            contributor={contributor}
            requester={challenger}
            requesterFunds={challengerFunds}
            appealCost={totalChallengerCost}
            chainId={chainId}
            loosingSideHasEnd={
              currentRulingFormatted === SideEnum.claimer
                ? loosingSideHasEnd
                : false
            }
          />
        </div>
      </div>
    </Modal>
  ) : null;
};

export default Appeal;
