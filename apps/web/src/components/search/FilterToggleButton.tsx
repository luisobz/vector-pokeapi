import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

interface FilterToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  activeFiltersCount?: number;
}

export default function FilterToggleButton({ isActive, onClick }: FilterToggleButtonProps) {
  const t = useTranslations("SearchPage");

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${isActive
          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
          : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
        }`}
    >
      <SlidersHorizontal size={16} />
      <span>{t("filtersButton")}</span>
    </button>
  );
}
