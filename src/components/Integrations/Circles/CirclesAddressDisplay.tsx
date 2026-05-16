import CirclesLogo from "icons/CirclesLogo.svg";
import ExternalLinkIcon from "icons/ExternalLink.svg";

interface CirclesAddressDisplayProps {
  walletAddress: string;
}

export default function CirclesAddressDisplay({
  walletAddress,
}: CirclesAddressDisplayProps) {
  if (!walletAddress) return null;

  const circlesUrl = "https://app.metri.xyz";

  return (
    <div className="text-primaryText flex flex-wrap items-center">
      <CirclesLogo className="mr-2 h-6 w-6 flex-shrink-0" />
      <span className="text-secondaryText mr-2 break-all">{walletAddress}</span>
      <a
        href={circlesUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange flex items-center"
        aria-label="View address on Circles website"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
      >
        View on Circles <ExternalLinkIcon className="ml-1 h-4 w-4" />
      </a>
    </div>
  );
}
