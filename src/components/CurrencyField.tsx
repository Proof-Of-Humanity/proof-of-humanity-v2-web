import cn from "classnames";
import { InputHTMLAttributes, ReactNode } from "react";
import CaretDownIcon from "icons/CaretDown.svg";
import XdaiTokenIcon from "icons/XdaiToken.svg";
import EthTokenIcon from "icons/EthToken.svg";
import Label from "./Label";

type CurrencyFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  labelClassName?: string;
  /** Native currency symbol deciding the token icon, e.g. "ETH" or "xDAI". */
  symbol?: string;
  /** When set, the token becomes a selector with a caret. */
  onTokenClick?: () => void;
};

export const CurrencyIcon = ({ symbol }: { symbol?: string }) =>
  /dai/i.test(symbol ?? "") ? (
    <XdaiTokenIcon className="h-6 w-6 shrink-0" />
  ) : (
    <EthTokenIcon className="h-6 w-6 shrink-0" />
  );

function CurrencyField({
  label,
  labelClassName,
  symbol,
  onTokenClick,
  className,
  ...props
}: CurrencyFieldProps) {
  return (
    <div className="flex w-full flex-col">
      {label && <Label className={labelClassName}>{label}</Label>}
      <div className="flat-control flex min-h-12 w-full items-center gap-2 rounded-input px-4 transition duration-200 ease-premium">
        <input
          type="number"
          className={cn(
            "no-spinner text-primaryText placeholder:text-secondaryText min-w-0 flex-1 border-none bg-transparent text-base outline-none focus:ring-0",
            className,
          )}
          {...props}
        />
        {onTokenClick ? (
          <button
            type="button"
            onClick={onTokenClick}
            aria-label="Select currency"
            className="flex shrink-0 items-center gap-1.5"
          >
            <CurrencyIcon symbol={symbol} />
            <CaretDownIcon className="h-2 w-2 fill-current text-peach" />
          </button>
        ) : (
          <CurrencyIcon symbol={symbol} />
        )}
      </div>
    </div>
  );
}

export default CurrencyField;
