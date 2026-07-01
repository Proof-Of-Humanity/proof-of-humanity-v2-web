import { type SupportedChain } from "config/chains";
import { type ContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { type Hash } from "viem";

import RevokeClient from "./RevokeClient";

interface RevokeProps {
  pohId: Hash;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
  baseDeposit: ContractData["baseDeposit"];
}

export default async function Revoke({
  arbitrationInfo,
  baseDeposit,
  homeChain,
  pohId,
}: RevokeProps) {
  const { effective, pendingAction, applyAction } = useProfileOptimistic();
  const isReconciling = pendingAction !== null;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const loading = useLoading(false, "Revoke");
  const [pending, loadingMessage] = loading.use();
  const modal = useAppKit();
  const { isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const web3Loaded = useWeb3Loaded();
  const { switchChain } = useSwitchChain();
  const {
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();

  const { uploadFile } = useAtlasProvider();
  const resetModalState = useCallback(() => {
    setTitle("");
    setDescription("");
    setFile(null);
    setIdle();
    loading.stop();
  }, [loading, setIdle]);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetModalState();
  }, [resetModalState]);

  const [prepare] = usePoHWrite(
    "revokeHumanity",
    useMemo(
      () => ({
        onReady(fire) {
          loading.stop();
          setFeedbackState(ACTION_STATES.confirmWallet);
          fire();
        },
        onLoading() {
          setFeedbackState(ACTION_STATES.txPending);
        },
        onFail() {
          const message = "Revoke is not available right now.";
          setUnavailable(message);
          toast.error(message);
        },
        onError(error) {
          toast.error(setWriteError(error));
        },
        onSuccess() {
          applyAction("revoke", buildRevokeSuccessPatch());
          setIdle();
          closeModal();
          toast.success("Request created");
        },
      }),
      [
        applyAction,
        closeModal,
        loading,
        setFeedbackState,
        setIdle,
        setUnavailable,
        setWriteError,
      ],
    ),
  );

  useEffect(() => {
    if (effective.pendingRevocation) {
      closeModal();
    }
  }, [closeModal, effective.pendingRevocation]);

  const submit = async () => {
    try {
      loading.start("Uploading evidence...");

      let fileURI;
      if (file) {
        fileURI = await uploadFile(file, Roles.Evidence);
        if (!fileURI) {
          toast.error("Failed to upload file.");
          loading.stop();
          return;
        }
      }

      const evidenceJson = {
        name: title,
        description,
        fileURI,
      };

      const evidenceTextFile = new File(
        [JSON.stringify(evidenceJson)],
        "evidence",
        {
          type: "text/plain",
        },
      );

      const evidenceUri = await uploadFile(evidenceTextFile, Roles.Evidence);

      if (!evidenceUri) {
        toast.error("Failed to upload evidence.");
        loading.stop();
        return;
      }

      prepare({ args: [pohId, evidenceUri], value: cost });
    } catch (error) {
      toast.error(
        `Failed to upload evidence : ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      loading.stop();
    }
  };

  if (web3Loaded && !isConnected)
    return (
      <div className="flex w-full justify-center">
        <button
          onClick={() => modal.open({ view: "Connect" })}
          className="btn-secondary mb-4"
        >
          Connect wallet
        </button>
      </div>
    );

    return (
      <div className="flex w-full justify-center">
        <button
          onClick={() => switchChain?.({ chainId: homeChain.id })}
          className="btn-secondary mb-4"
        >
          Connect to {homeChain.name} to revoke
        </button>
      </div>
    );
  } catch {
    return (
      <RevokeClient
        pohId={pohId}
        arbitrationInfo={arbitrationInfo}
        homeChain={homeChain}
        unavailableReason="Unable to load the arbitration cost. Try again in a moment."
      />
    );
  }
}
