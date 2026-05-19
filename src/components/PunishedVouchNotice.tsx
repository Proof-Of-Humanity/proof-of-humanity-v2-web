import Link from "next/link";
import TimeAgo from "components/TimeAgo";
import type { PunishedVouchInfo } from "data/punishedVouch";
import { shortenAddress } from "utils/address";

type PunishedVouchNoticeProps = {
  info: PunishedVouchInfo;
  surface: "profile" | "request";
};

export default function PunishedVouchNotice({
  info,
  surface,
}: PunishedVouchNoticeProps) {
  const isProfile = surface === "profile";
  const timestamp = info.timestamp ? Number(info.timestamp) : null;

  return (
    <div className="border-status-removed bg-whiteBackground w-full rounded border p-4 text-left shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="bg-status-removed/10 text-status-removed flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          !
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-status-removed text-base font-semibold">
            {isProfile
              ? "Removed due to punished vouch"
              : "This winning request was later punished"}
          </div>
          <p className="text-secondaryText mt-1 text-sm font-normal leading-6">
            {isProfile ? "This profile" : "The owner of this request"} was
            removed because it vouched for a profile removed for {info.reason}.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-normal sm:flex-row sm:items-center">
            <Link
              className="text-status-removed underline underline-offset-2"
              href={info.sourceRequestHref}
            >
              View source request
            </Link>
            <span className="text-secondaryText">
              {shortenAddress(info.sourceHumanityId)} / request{" "}
              {String(info.sourceRequestIndex)}
            </span>
            {timestamp ? (
              <span className="text-secondaryText">
                <TimeAgo time={timestamp} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
