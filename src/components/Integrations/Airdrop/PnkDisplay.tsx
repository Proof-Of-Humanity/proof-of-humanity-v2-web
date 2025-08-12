import Image from "next/image";
import { formatUnits } from "viem";

function formatPnkAmount(amount: bigint): string {
  const formatted = formatUnits(amount, 18);
  const num = parseFloat(formatted);
  if (num >= 1000) {
    const k = (num / 1000).toFixed(1).replace(/\.0$/, "");
    return `${k}k PNK`;
  }
  return `${Math.round(num)} PNK`;
}

export default function PnkDisplay({ amount }: { amount?: bigint }) {
  const displayText = amount ? formatPnkAmount(amount) : "";
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <Image src="/logo/pnk-token.svg" alt="PNK Token" width={24} height={24} />
      <span className="text-primaryText text-2xl font-normal">{displayText}</span>
    </div>
  );
}


