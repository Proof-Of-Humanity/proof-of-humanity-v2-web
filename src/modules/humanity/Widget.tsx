import { Link } from "react-router-dom";
import { HumanityInterface } from "api/humanities";
import { CHAIN } from "constants/chains";
import useWeb3 from "hooks/useWeb3";
import { shortenAddress } from "utils/address";
import { prettifyId } from "utils/identifier";
import ProofOfHumanityLogo from "../../assets/svg/ProofOfHumanityLogo.svg";

interface HumanityWidgetProps {
  humanity: HumanityInterface;
}

const HumanityWidget: React.FC<HumanityWidgetProps> = ({ humanity }) => {
  const { account } = useWeb3(false);

  return (
    <div className="px-8 pb-8 flex flex-col justify-center items-center rounded bg-white">
      <div className="bordered absolute -top-16 w-32 h-32 rounded-full shadow-md">
        <div className="w-full h-full px-6 pt-5 rounded-full bg-white shadow-md">
          <ProofOfHumanityLogo />
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="mt-20">
          Humanity ID: <strong>{prettifyId(humanity.id)}</strong>
          <div>{humanity.claimed ? `Claimed` : `Not claimed`}</div>
          {humanity.claimed && (
            <div>Owner: {shortenAddress(humanity.owner!.id)}</div>
          )}
        </div>
        <div>
          Home chain: <strong>{CHAIN[humanity.chainID].NAME}</strong>
        </div>
        <div className="px-2 py-1 bg-blue-500 text-white font-bold rounded-full">
          {humanity.nbPendingRequests} pending requests
        </div>
        <div className="mb-8">Claimed</div>
        <Link className="btn-main" to={`/claim/${prettifyId(humanity.id)}`}>
          Claim this humanity
        </Link>
        {humanity.claimed && account && account === humanity.owner!.id && (
          <button className="btn-main">Transfer to another chain</button>
        )}
      </div>
    </div>
  );
};

export default HumanityWidget;
