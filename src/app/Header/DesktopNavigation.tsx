import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sepolia } from "viem/chains";
import ExternalLink from "components/ExternalLink";
import { prettifyId } from "utils/identifier";

interface DesktopNavigationProps {
  web3Loaded: boolean;
  chain: { id: number; name: string };
  pathname: string;
  policy: string;
  me: any;
  address?: `0x${string}`;
}

const DesktopNavigation = ({
  web3Loaded,
  chain,
  pathname,
  policy,
  me,
  address,
}: DesktopNavigationProps) => {
  const searchParams = useSearchParams();
  const currentUrl = searchParams.get("url");

  return (
    <div className="my-2 hidden gap-x-8 whitespace-nowrap md:flex">
      {web3Loaded && chain.id === sepolia.id && (
        <ExternalLink href="https://docs.scroll.io/en/user-guide/faucet/">
          Faucet
        </ExternalLink>
      )}
      <Link href="/" className={`${pathname === "/" ? "font-bold" : ""}`}>
        Profiles
      </Link>
      {me &&
        (me.pohId ? (
          <Link
            href={`/${prettifyId(me.pohId)}`}
            className={`${pathname === `/${prettifyId(me.pohId)}` ? "font-bold" : ""}`}
          >
            PoH ID
          </Link>
        ) : (
          <Link
            href={
              me.currentRequest
                ? `/${prettifyId(me.currentRequest.humanity.id)}/${
                    me.currentRequest.chain.name
                  }/${me.currentRequest.index}`
                : `/${prettifyId(address!)}/claim`
            }
            className={`${pathname.includes("/claim") ? "font-bold" : ""}`}
          >
            Register
          </Link>
        ))}
      <Link
        href={`/attachment?url=${encodeURIComponent(policy)}`}
        className={`${currentUrl?.includes(policy) ? "font-bold" : ""}`}
      >
        Policy
      </Link>
    </div>
  );
};

export default DesktopNavigation;
