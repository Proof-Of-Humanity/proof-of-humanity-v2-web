import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { getClaimerData } from "data/claimer";
import { OffChainVouch } from "data/request";
import type { ClaimerQuery, Vouch as VouchQuery } from "generated/graphql";
import { cache } from "react";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";
import { Address, Hash } from "viem";
import type {
  RequestChain,
  RequestPageRequest,
} from "app/[pohid]/[chain]/[request]/RequestIdentityCard.types";

export interface ValidVouch {
  isValid: boolean;
  reason: string | undefined;
}

enum ValidVouchTypes {
  OK,
  NoPersonhood,
  ExpiredPersonhood,
  Vouching,
  ExpiredVouch,
}

const validVouches: Record<ValidVouchTypes, ValidVouch> = {
  [ValidVouchTypes.OK]: { isValid: true, reason: undefined },
  [ValidVouchTypes.NoPersonhood]: { isValid: false, reason: "No personhood" },
  [ValidVouchTypes.ExpiredPersonhood]: {
    isValid: false,
    reason: "Expired personhood",
  },
  [ValidVouchTypes.Vouching]: { isValid: false, reason: "Vouching" },
  [ValidVouchTypes.ExpiredVouch]: { isValid: false, reason: "Expired vouch" },
};

export const isValidVouch = cache(
  async (
    chainId: SupportedChainId,
    pohId: Hash,
    offChainExpiration: any,
  ): Promise<ValidVouch> => {
    const out = await sdk[chainId].HumanityVouch({ id: pohId });
    if (!out.humanity || !out.humanity.registration)
      return validVouches[ValidVouchTypes.NoPersonhood];
    if (Boolean(out.humanity.vouching))
      return validVouches[ValidVouchTypes.Vouching];
    if (Number(out.humanity.registration.expirationTime) < Date.now() / 1000)
      return validVouches[ValidVouchTypes.ExpiredPersonhood];
    if (offChainExpiration && Number(offChainExpiration) < Date.now() / 1000)
      return validVouches[ValidVouchTypes.ExpiredVouch];
    return validVouches[ValidVouchTypes.OK];
  },
);

export const isValidOnChainVouch = (vouch: VouchQuery) => {
  const registration = vouch.from.registration;

  if (!registration?.humanity)
    return validVouches[ValidVouchTypes.NoPersonhood];
  if (Boolean(registration.humanity.vouching))
    return validVouches[ValidVouchTypes.Vouching];
  if (Number(registration.expirationTime) < Date.now() / 1000)
    return validVouches[ValidVouchTypes.ExpiredPersonhood];
  return validVouches[ValidVouchTypes.OK];
};

export interface RequestVouchStatusItem {
  voucher: Address;
  isOnChain: boolean;
  vouchStatus: ValidVouch | undefined;
}

export interface RequestVouchDisplayItem extends RequestVouchStatusItem {
  name: string | null | undefined;
  pohId: Address | undefined;
  photo: string | undefined;
}

export interface RequestVouchData {
  onChainVouches: Address[];
  statusItems: RequestVouchStatusItem[];
  validVouches: number;
}

const normalizeAddress = (value: string) => value.toLowerCase();

/**
 * @notice Builds all voucher state needed by the request page.
 * @dev During vouching, onchain candidates come from received vouches minus
 * offchain duplicates. After vouching, the request's stored vouches are enough.
 */
export const getRequestVouchData = cache(
  async (
    chainId: SupportedChainId,
    request: RequestPageRequest,
    offChainVouches: OffChainVouch[],
  ): Promise<RequestVouchData> => {
    const isVouching = request.status.id === "vouching";
    const offChainVoucherSet = new Set(
      offChainVouches.map((vouch) => normalizeAddress(vouch.voucher)),
    );
    const receivedVouches = request.claimer.vouchesReceived;
    const onChainVouches = isVouching
      ? receivedVouches
          .map((vouch) => vouch.from.id as Address)
          .filter(
            (voucher) => !offChainVoucherSet.has(normalizeAddress(voucher)),
          )
      : request.vouches.map((vouch) => vouch.voucher.id as Address);
    const receivedVouchByVoucher = new Map(
      receivedVouches.map((vouch) => [
        normalizeAddress(vouch.from.id),
        vouch as VouchQuery,
      ]),
    );
    const offChainStatusItems = await Promise.all(
      offChainVouches.map(async (vouch) => ({
        voucher: vouch.voucher,
        isOnChain: false,
        vouchStatus: await isValidVouch(
          chainId,
          vouch.voucher,
          vouch.expiration,
        ),
      })),
    );
    const onChainStatusItems = onChainVouches.map((voucher) => {
      const vouch = receivedVouchByVoucher.get(normalizeAddress(voucher));

      return {
        voucher,
        isOnChain: true,
        vouchStatus: vouch ? isValidOnChainVouch(vouch) : undefined,
      };
    });
    const statusItems = [...offChainStatusItems, ...onChainStatusItems];

    return {
      onChainVouches,
      statusItems,
      validVouches: statusItems.filter((item) => item.vouchStatus?.isValid)
        .length,
    };
  },
);

/**
 * @notice Extracts the profile fields used by compact voucher avatars.
 * @dev Chooses the chain containing a registration winner claim, preserving
 * the previous request-page identity source without doing extra request walks.
 */
const getVouchProfile = (
  rawClaimer: Record<SupportedChainId, ClaimerQuery>,
  fallbackChain: RequestChain,
) => {
  const relevantChain =
    supportedChains.find(
      (chain) =>
        rawClaimer[chain.id].claimer?.registration?.humanity.winnerClaim,
    ) ?? fallbackChain;
  const claimer = rawClaimer[relevantChain.id].claimer;
  const pohId = claimer?.registration?.humanity.id ?? claimer?.id;
  const evidenceUri = claimer?.registration?.humanity.winnerClaim
    .at(0)
    ?.evidenceGroup.evidence.at(0)?.uri;

  return {
    name: claimer?.name,
    pohId: pohId as Address | undefined,
    voucher: claimer?.id as Address | undefined,
    evidenceUri,
  };
};

/**
 * @notice Fetches the registration photo associated with a claimer evidence URI.
 * @dev Returns undefined when the profile evidence or registration file cannot
 * be loaded, preserving the identicon fallback.
 */
const getVouchPhoto = async (evidenceUri: string | undefined) => {
  if (!evidenceUri) return undefined;

  try {
    const evidence = await ipfsFetch<EvidenceFile>(evidenceUri);
    if (!evidence?.fileURI) return undefined;

    return (await ipfsFetch<RegistrationFile>(evidence.fileURI)).photo;
  } catch {
    return undefined;
  }
};

/**
 * @notice Builds one display-ready voucher avatar item.
 * @dev Profile data is fetched per voucher at the leaf component level.
 */
const getRequestVouchDisplayItem = async (
  chain: RequestChain,
  statusItem: RequestVouchStatusItem,
): Promise<RequestVouchDisplayItem> => {
  const rawClaimer = await getClaimerData(statusItem.voucher);
  const profile = getVouchProfile(rawClaimer, chain);

  return {
    ...statusItem,
    voucher: profile.voucher ?? statusItem.voucher,
    name: profile.name,
    pohId: profile.pohId,
    photo: await getVouchPhoto(profile.evidenceUri),
  };
};

/**
 * @notice Fetches display data for vouchers shown as request supporters.
 * @dev Accepts precomputed status items so status validation is not duplicated
 * between optimistic state initialization and UI rendering.
 */
export const getRequestVoucherDisplayItems = cache(
  async (chain: RequestChain, vouchDataPromise: Promise<RequestVouchData>) => {
    const { statusItems } = await vouchDataPromise;

    return Promise.all(
      statusItems.map((item) => getRequestVouchDisplayItem(chain, item)),
    );
  },
);

/**
 * @notice Fetches display data for profiles the request claimer vouched for.
 * @dev These are informational profile links, so they do not need validation
 * status checks.
 */
export const getVouchedForDisplayItems = cache(
  async (chain: RequestChain, request: RequestPageRequest) => {
    const statusItems = request.claimer.vouches.map((vouch) => ({
      voucher: vouch.for.id as Address,
      isOnChain: true,
      vouchStatus: undefined,
    }));

    return Promise.all(
      statusItems.map((item) => getRequestVouchDisplayItem(chain, item)),
    );
  },
);
