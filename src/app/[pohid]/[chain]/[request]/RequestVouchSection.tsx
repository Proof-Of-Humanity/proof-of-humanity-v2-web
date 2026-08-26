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

function VouchTooltip({
  name,
  isVouching = false,
  isActive,
  isOnChain = true,
  reason,
}: {
  name: string | null | undefined;
  isVouching?: boolean;
  isActive?: boolean;
  isOnChain?: boolean;
  reason?: string;
}) {
  return (
    <>
      {isVouching ? (
        <>
          {!isOnChain ? "(off-chain) " : null}
          {isActive ? "Vouch confirmed" : "Vouch in queue"}
          <br />
          {reason ? (
            <>
              <span className="italic">({reason})</span>
              <br />
            </>
          ) : null}
        </>
      ) : null}
      <span className="text-base font-bold">{name}</span>
    </>
  );
}

/**
 * @notice Renders a compact loading state for request voucher avatars.
 * @dev Used as the Suspense fallback while voucher profile/photo data loads.
 */
export function RequestVouchSectionSkeleton({ title }: { title: string }) {
  return (
    <div className="text-secondaryText flex flex-col items-center text-center text-xs">
      <span>{title}</span>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
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
    <div className="text-secondaryText flex flex-col items-center gap-2 text-center text-xs">
      This PoHID vouched for
      <div className="flex flex-wrap justify-center gap-2">
        {visibleItems.map((item, index) => (
          <Vouch
            key={`${item.pohId}-${index}`}
            isActive={true}
            evidenceUri={item.evidenceUri}
            idx={index}
            href={`/${prettifyId(item.pohId)}`}
            pohId={item.pohId}
            address={item.pohId}
            tooltip={<VouchTooltip name={item.name} />}
            tooltipPlacement="below"
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
    <div className="text-secondaryText flex flex-col items-center gap-2 text-center text-xs">
      <span className="flex items-center">
        Vouched by
        {request.status.id === "vouching" && <OptimisticVouchIndicator />}
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {visibleItems.map((item, index) => {
          const isVouching = request.status.id === "vouching";
          const isActive = isVouching ? item.vouchStatus?.isValid : true;
          const reason = isVouching ? item.vouchStatus?.reason : undefined;

          return (
            <Vouch
              key={`${item.voucher ?? item.pohId}-${index}`}
              isActive={isActive}
              evidenceUri={item.evidenceUri}
              idx={index}
              href={`/${prettifyId(item.pohId)}`}
              pohId={item.pohId}
              address={item.voucher}
              tooltipPlacement="below"
              tooltip={
                <VouchTooltip
                  name={item.name}
                  isVouching={isVouching}
                  isActive={isActive}
                  isOnChain={item.isOnChain}
                  reason={reason}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
}
