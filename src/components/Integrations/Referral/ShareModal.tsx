"use client";

import Modal from "components/Modal";
import ReferralIcon from "icons/Referral.svg";
import CopyButton from "./CopyButton";
import ReferralLinkRow from "./ReferralLinkRow";
import ShareButtons from "./ShareButtons";

const SHARE_MESSAGE =
  "I verified myself on Proof of Humanity. Join the registry of real humans and claim your rewards:";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  link: string;
  avatarAddress?: `0x${string}`;
}

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  link,
  avatarAddress,
}) => (
  <Modal open={open} onClose={onClose} formal className="p-6 sm:p-8">
    <h2 className="text-primaryText mb-6 text-center text-2xl font-semibold">
      Share
    </h2>

    <div className="border-stroke rounded-card border p-5 sm:p-6">
      <div className="text-orange mb-4 flex items-center gap-2">
        <ReferralIcon className="h-7 w-auto" />
        <span className="text-xl font-semibold">Referral</span>
      </div>

      <p className="text-primaryText font-semibold">
        I verified myself on Proof of Humanity.
      </p>
      <p className="text-secondaryText mt-1 text-sm">
        Join the registry of real humans and claim your rewards here:
      </p>

      <div className="border-stroke my-5 border-b" />

      <ReferralLinkRow link={link} avatarAddress={avatarAddress} />

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CopyButton value={link} />
        <ShareButtons link={link} message={SHARE_MESSAGE} />
      </div>
    </div>

    <div className="mt-6 flex justify-center">
      <button type="button" onClick={onClose} className="btn-secondary px-10">
        Close
      </button>
    </div>
  </Modal>
);

export default ShareModal;
