import React from "react";
import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import WarningCircle16Icon from "icons/WarningCircle16.svg";

interface UnsubscribeModalProps {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({
  open,
  isDeleting,
  onClose,
  onConfirm,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    canClose={!isDeleting}
    formal
    header="Unsubscribe"
    className="w-[calc(100vw-2rem)] max-w-[30rem] md:w-[30rem]"
  >
    <div className="p-6">
      <h3 className="text-primaryText mb-3 text-lg font-semibold">
        Unsubscribe from all Kleros apps?
      </h3>
      <div className="text-secondaryText mb-6 mt-0.5 flex items-center gap-2 text-base leading-relaxed">
        <WarningCircle16Icon
          width={16}
          height={16}
          className="flex-shrink-0 [&_path]:fill-red-600"
        />
        <p>
          This action will unsubcribe you from <strong>ALL</strong> kleros
          products.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ActionButton
          onClick={onConfirm}
          label="Unsubscribe"
          isLoading={isDeleting}
          className="min-h-[44px] w-full"
          ariaLabel="Confirm unsubscribe from all Kleros applications"
        />
        <ActionButton
          onClick={onClose}
          label="Cancel"
          disabled={isDeleting}
          variant="secondary"
          className="min-h-[44px] w-full"
        />
      </div>
    </div>
  </Modal>
);

export default UnsubscribeModal;
