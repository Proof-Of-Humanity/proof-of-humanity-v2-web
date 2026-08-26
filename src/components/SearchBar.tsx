"use client";

import cn from "classnames";
import { InputHTMLAttributes } from "react";
import SearchIcon from "icons/SearchMajor.svg";

type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: string;
  onSearch: (value: string) => void;
  className?: string;
};

function SearchBar({ value, onSearch, className, ...props }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flat-control flex min-h-12 w-full items-center gap-2 rounded-input px-4 transition duration-200 ease-premium",
        className,
      )}
    >
      <SearchIcon className="h-5 w-5 shrink-0 fill-current text-peach" />
      <input
        className="text-primaryText placeholder:text-secondaryText w-full border-none bg-transparent text-base outline-none focus:ring-0"
        placeholder="Search by name"
        aria-label="Search"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          className="hover:text-orange flex h-6 w-6 shrink-0 items-center justify-center text-lg leading-none text-peach transition-colors"
          onClick={() => onSearch("")}
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default SearchBar;
