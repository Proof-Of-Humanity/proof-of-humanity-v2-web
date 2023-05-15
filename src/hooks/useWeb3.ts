import { useWeb3React } from "@web3-react/core";
import { BrowserProvider } from "ethers";
import { NetworkContextName } from "constants/misc";

const useWeb3 = (network: boolean = false) =>
  useWeb3React<BrowserProvider>(network ? NetworkContextName : undefined);

export default useWeb3;
