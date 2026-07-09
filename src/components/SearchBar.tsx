"use client";

import cn from "classnames";
import { InputHTMLAttributes } from "react";
import SearchIcon from "icons/SearchMajor.svg";

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onSearch: (value: string) => void;
  className?: string;
};

function SearchBar({ onSearch, className, ...props }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flat-control flex min-h-12 w-full items-center gap-2 rounded-input px-4 transition duration-200 ease-premium",
        className,
      )}
    >
      <SearchIcon className="text-peach h-5 w-5 shrink-0 fill-current" />
      <input
        className="text-primaryText placeholder:text-secondaryText w-full border-none bg-transparent text-base outline-none focus:ring-0"
        placeholder="Search by name"
        onChange={(e) => onSearch(e.target.value)}
        {...props}
      />
    </div>
  );
}

export default SearchBar;
