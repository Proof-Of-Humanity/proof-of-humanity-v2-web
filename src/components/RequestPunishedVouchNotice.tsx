import Link from "next/link";

import ExternalLinkIcon from "components/ExternalLinkIcon";
import TimeAgo from "components/TimeAgo";

type RequestPunishedVouchNoticeProps = {
  reason: string;
  sourceRequestHref: string;
  timestamp?: string | number | null;
};

export default function RequestPunishedVouchNotice({
  reason,
  sourceRequestHref,
  timestamp,
}: RequestPunishedVouchNoticeProps) {
  const punishedAt = timestamp ? Number(timestamp) : null;

  return (
    <div className="border-stroke bg-whiteBackground mb-1 rounded border shadow">
      <div className="flex flex-col gap-4 px-[24px] py-[18px] sm:flex-row sm:items-start lg:px-[32px]">
        <div className="border-status-removed/30 bg-status-removed/10 text-status-removed flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-bold">
          !
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="text-status-removed text-base font-semibold leading-6">
              Punished vouch removal
            </div>
            {punishedAt ? (
              <div className="text-secondaryText shrink-0 text-sm font-normal leading-6 md:text-right">
                Punished <TimeAgo time={punishedAt} />
              </div>
            ) : null}
          </div>
          <p className="text-secondaryText mt-1 text-sm font-normal leading-6">
            This profile was removed for aiding {reason}.{" "}
            <Link
              className="group/external-link text-orange inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
              href={sourceRequestHref}
            >
              View source request
              <ExternalLinkIcon />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
