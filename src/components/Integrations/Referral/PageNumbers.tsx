"use client";

import cn from "classnames";
import ChevronDownIcon from "icons/ChevronDown.svg";

interface PageNumbersProps {
  /** 0-based; rendered 1-based. */
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

type PageListItem = number | "ellipsis";

const SHOW_ALL_PAGES_LIMIT = 7;

const pageListItems = (
  currentPage: number,
  pageCount: number,
): PageListItem[] => {
  const allPages = Array.from({ length: pageCount }, (_, index) => index);
  if (pageCount <= SHOW_ALL_PAGES_LIMIT) return allPages;

  const firstPage = 0;
  const lastPage = pageCount - 1;
  const deservesButton = (page: number) =>
    page === firstPage ||
    page === lastPage ||
    Math.abs(page - currentPage) <= 1;

  const items: PageListItem[] = [];
  for (const page of allPages) {
    // A page an ellipsis would hide alone still gets a button — "1 … 3" reads
    // worse than "1 2 3". Runs of two or more hidden pages collapse.
    const betweenTwoButtons =
      deservesButton(page - 1) && deservesButton(page + 1);
    if (deservesButton(page) || betweenTwoButtons) items.push(page);
    else if (items.at(-1) !== "ellipsis") items.push("ellipsis");
  }
  return items;
};

const buttonShape =
  "flex h-8 min-w-8 items-center justify-center rounded-full border px-1 text-sm transition-colors";
const inactiveButtonColors =
  "text-secondaryText hover:text-orange border-white/15 hover:border-white/40";
const activePageColors = "text-orange border-peach font-semibold";

const ChevronButton: React.FC<{
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, disabled, onClick }) => (
  <button
    type="button"
    aria-label={direction === "previous" ? "Previous page" : "Next page"}
    aria-disabled={disabled}
    onClick={disabled ? undefined : onClick}
    className={cn(buttonShape, inactiveButtonColors, disabled && "opacity-40")}
  >
    <ChevronDownIcon
      className={cn(
        "h-3.5 w-3.5",
        direction === "previous" ? "rotate-90" : "-rotate-90",
      )}
    />
  </button>
);

const PageNumbers: React.FC<PageNumbersProps> = ({
  currentPage,
  pageCount,
  onPageChange,
}) => {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Referred list pages"
      className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
    >
      <ChevronButton
        direction="previous"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {pageListItems(currentPage, pageCount).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="text-secondaryText flex h-8 w-8 select-none items-center justify-center text-sm"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              buttonShape,
              item === currentPage ? activePageColors : inactiveButtonColors,
            )}
          >
            {item + 1}
          </button>
        ),
      )}
      <ChevronButton
        direction="next"
        disabled={currentPage === pageCount - 1}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </nav>
  );
};

export default PageNumbers;
