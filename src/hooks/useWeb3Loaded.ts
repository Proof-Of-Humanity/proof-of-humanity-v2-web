import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function useWeb3Loaded() {
  const { isReconnecting } = useAccount();
  const [web3Loaded, setWeb3Loaded] = useState(false);

  useEffect(() => {
    if (!isReconnecting) setWeb3Loaded(true);
  }, [isReconnecting]);

  return web3Loaded;
}
