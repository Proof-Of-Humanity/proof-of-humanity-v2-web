import Vouch from "components/Vouch";
import {
  getRequestVoucherDisplayItems,
  getVouchedForDisplayItems,
  type RequestVouchData,
} from "data/vouch";
import { prettifyId } from "utils/identifier";
import OptimisticVouchIndicator from "./OptimisticVouchIndicator";
import type {
  RequestChain,
  RequestPageRequest,
} from "./RequestIdentityCard.types";

type RequestVouchItemWithPohId = Awaited<
  ReturnType<typeof getVouchedForDisplayItems>
>[number] & {
  pohId: `0x${string}`;
};

/**
 * @notice Narrows voucher display items to entries with profile links.
 * @dev Keeps list rendering free of non-null assertions.
 */
const hasPohId = (
  item: Awaited<ReturnType<typeof getVouchedForDisplayItems>>[number],
): item is RequestVouchItemWithPohId => !!item.pohId;

/**
 * @notice Renders a compact loading state for request voucher avatars.
 * @dev Used as the Suspense fallback while voucher profile/photo data loads.
 */
export function RequestVouchSectionSkeleton({ title }: { title: string }) {
  return (
    <div className="text-secondaryText mt-8 flex flex-col items-center text-center md:items-start md:text-left">
      <span>{title}</span>
      <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="bg-secondaryText h-8 w-8 animate-pulse rounded-full opacity-20"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * @notice Renders profiles the request claimer has vouched for.
 * @dev Fetches profile media in this leaf so the parent request page can stream
 * without waiting for informational voucher avatars.
 */
export async function VouchedForSection({
  chain,
  request,
}: {
  chain: RequestChain;
  request: RequestPageRequest;
}) {
  const vouchedForItems = await getVouchedForDisplayItems(chain, request);
  const visibleItems = vouchedForItems.filter(hasPohId);

  if (visibleItems.length === 0) return null;

  return (
    <div className="text-secondaryText mt-8 flex flex-col items-center text-center md:items-start md:text-left">
      This PoHID vouched for
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {visibleItems.map((item, index) => (
          <Vouch
            key={`${item.pohId}-${index}`}
            isActive={true}
            reason={undefined}
            name={item.name}
            photo={item.photo}
            idx={index}
            href={`/${prettifyId(item.pohId)}`}
            pohId={item.pohId}
            address={item.pohId}
            isOnChain={item.isOnChain}
            reducedTooltip={true}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * @notice Renders vouchers attached to the current request.
 * @dev Reuses precomputed voucher statuses and only fetches profile/photo data
 * in this leaf component.
 */
export async function RequestVouchersSection({
  chain,
  request,
  vouchDataPromise,
}: {
  chain: RequestChain;
  request: RequestPageRequest;
  vouchDataPromise: Promise<RequestVouchData>;
}) {
  const voucherItems = await getRequestVoucherDisplayItems(
    chain,
    vouchDataPromise,
  );
  const visibleItems = voucherItems.filter(hasPohId);

  if (visibleItems.length === 0) return null;

  return (
    <div className="text-secondaryText mt-8 flex flex-col items-center text-center md:items-start md:text-left">
      <span className="flex items-center">
        {request.status.id === "vouching"
          ? "Available vouches for this PoHID"
          : "Vouched for this request"}
        {request.status.id === "vouching" && <OptimisticVouchIndicator />}
      </span>
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {visibleItems.map((item, index) => (
          <Vouch
            key={`${item.voucher ?? item.pohId}-${index}`}
            isActive={
              request.status.id === "vouching"
                ? item.vouchStatus?.isValid
                : true
            }
            reason={
              request.status.id === "vouching"
                ? item.vouchStatus?.reason
                : undefined
            }
            name={item.name}
            photo={item.photo}
            idx={index}
            href={`/${prettifyId(item.pohId)}`}
            pohId={item.pohId}
            address={item.voucher}
            isOnChain={item.isOnChain}
            reducedTooltip={request.status.id !== "vouching"}
          />
        ))}
      </div>
    </div>
  );
}
