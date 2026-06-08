import React from "react";
import { RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ClearFiltersButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function ClearFiltersButton({ onClick, isVisible }: ClearFiltersButtonProps) {
  const t = useTranslations("SearchPage");

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-3.5 rounded-xl border border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all ${!isVisible ? "hidden" : ""}`}
      title={t("clearFilters")}
    >
      <RefreshCcw size={16} />
    </button>
  );
}