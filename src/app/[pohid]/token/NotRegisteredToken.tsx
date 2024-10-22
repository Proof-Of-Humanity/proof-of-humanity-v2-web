import { AddressZero } from "@ethersproject/constants";
import { useState } from "react";
import { useMeQuery } from "api/useMeQuery";
import Field from "components/Field";
import Label from "components/Label";
import { TOKEN_CHAIN } from "config/chains";
import { useHubUserToToken } from "hooks/useHub";
import {
  usePoHConfirmHuman,
  usePoHConfirmHumanToken,
  usePoHConfirmToken,
  usePoHIdToToken,
} from "hooks/usePoHTokenManager";
import useWeb3 from "hooks/useWeb3";

interface NotRegisteredTokenProps {
  humanityId: string;
}

const NotRegisteredToken: React.FC<NotRegisteredTokenProps> = ({
  humanityId,
}) => {
  const { account } = useWeb3();
  const me = useMeQuery(account);

  const [tokenToConfirm, setTokenToConfirm] = useState("");

  const [confirmedToken] = usePoHIdToToken(humanityId);
  const [userToken] = useHubUserToToken(account);

  const confirmToken = usePoHConfirmToken();
  const confirmHuman = usePoHConfirmHuman();
  const confirmHumanToken = usePoHConfirmHumanToken();

  const isSelfPoH =
    me &&
    me[TOKEN_CHAIN]?.humanity?.id &&
    account?.toLowerCase() === me[TOKEN_CHAIN].humanity.id;
  const isSelfCirclesWallet = account && userToken && userToken !== AddressZero;

  console.log({ isSelfPoH, isSelfCirclesWallet, account, userToken });

  return (
    <div className="flex flex-col bg-emerald-50 p-4">
      <div className="bg-white p-6">
        {isSelfPoH ? (
          isSelfCirclesWallet ? (
            <>
              <Label>Add yourself to the PoH group.</Label>
              <button
                className="btn-main"
                onClick={async () => await confirmHumanToken()}
              >
                ADD TO GROUP
              </button>
            </>
          ) : (
            <>
              <Label>Set token for PoH ID.</Label>
              <div className="mb-4 flex">
                <Field
                  placeholder="Token address"
                  value={tokenToConfirm}
                  onChange={(e) => setTokenToConfirm(e.target.value)}
                />
                <button
                  className="btn-main ml-2 px-2 font-bold"
                  onClick={async () => await confirmHuman(tokenToConfirm)}
                >
                  CONFIRM
                </button>
              </div>
            </>
          )
        ) : confirmedToken ? (
          confirmedToken === userToken && (
            <div className="mb-4 flex justify-between">
              <span className="flex flex-col">
                Token for this PoH ID set to{" "}
                <code className="text-slate-400">{confirmedToken}</code>
              </span>
              <button
                className="btn-main"
                onClick={async () => await confirmToken(humanityId)}
              >
                ADD TO GROUP
              </button>
            </div>
          )
        ) : (
          <span className="mb-4">
            No personal <code>CRC</code> set for this POH ID. Connect with your
            POH registered wallet and input the token address.
          </span>
        )}
      </div>
    </div>
  );
};

export default NotRegisteredToken;
