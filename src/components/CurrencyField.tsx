import cn from "classnames";
import { InputHTMLAttributes, ReactNode } from "react";
import XdaiTokenIcon from "icons/XdaiToken.svg";
import EthTokenIcon from "icons/EthToken.svg";
import Label from "./Label";

type CurrencyFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  labelClassName?: string;
  /** Native currency symbol deciding the token icon, e.g. "ETH" or "xDAI". */
  symbol?: string;
  /** Renders a MAX button that fills the field with its maximum value. */
  onMax?: () => void;
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
  onMax,
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
        {onMax && (
          <button
            type="button"
            disabled={props.disabled}
            onClick={onMax}
            className="text-orange text-xs font-semibold tracking-wide transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            MAX
          </button>
        )}
        <CurrencyIcon symbol={symbol} />
      </div>
    </div>
  );
}

export default CurrencyField;
