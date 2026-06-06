import React from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export default function SearchInput({ value, onChange, placeholder, isSearching }: SearchInputProps) {
  const t = useTranslations("SearchPage");

  return (
    <div className="relative flex-grow">
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
        <Search size={18} className={isSearching ? "animate-pulse text-cyan-400" : ""} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || t("searchPlaceholder")}
        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md text-white placeholder-zinc-500 text-sm font-medium focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 shadow-inner transition-all"
      />
    </div>
  );
}
