"use client";

import { useQuery } from "@tanstack/react-query";
import cn from "classnames";
import InvitedByBanner from "components/Integrations/Referral/InvitedByBanner";
import {
  clearReferral,
  refereeHasClaimRequest,
} from "data/referralAttribution";
import { useStoredReferral } from "hooks/useStoredReferral";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { warmVideoPipeline } from "utils/media.video.pipeline";
import { useAccount } from "wagmi";
import type { FormProps } from "./Form";
import FormSkeleton from "./FormSkeleton";

const Form = dynamic(() => import("./Form"), {
  ssr: false,
  loading: () => <FormSkeleton />,
});

export default function FormLoader(
  props: FormProps & { pohId: `0x${string}` },
) {
  useEffect(() => {
    warmVideoPipeline();
  }, []);

  const { address } = useAccount();
  const storedReferral = useStoredReferral(props.pohId);
  const claimingOwnHumanity =
    !!address && props.pohId === address.toLowerCase();
  const { data: hasPriorClaim } = useQuery({
    queryKey: ["referralRefereePriorClaim", props.pohId],
    queryFn: () => refereeHasClaimRequest(props.pohId),
    enabled: claimingOwnHumanity && !props.renewal,
    retry: false,
  });
  const visibleReferral =
    !props.renewal &&
    !hasPriorClaim &&
    (!address || claimingOwnHumanity) &&
    storedReferral;

  return (
    <>
      {visibleReferral && (
        <InvitedByBanner
          className="mx-auto mt-8 w-[calc(100%-2rem)] max-w-[750px] sm:mt-12 md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)]"
          referral={visibleReferral}
          onDismiss={() => clearReferral(props.pohId)}
        />
      )}
      <div
        className={cn(
          "content paper-inset flex max-w-[800px] flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6",
          visibleReferral && "mt-4",
        )}
      >
        <Form {...props} />
      </div>
    </>
  );
}
