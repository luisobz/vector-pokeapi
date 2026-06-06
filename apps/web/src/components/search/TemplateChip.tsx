import React from "react";
import { SearchTemplate } from "@vector-pokeapi/shared-types";

interface TemplateChipProps {
  template: SearchTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export default function TemplateChip({ template, isSelected, onClick }: TemplateChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isSelected
          ? "bg-purple-600 text-white shadow-md border border-purple-500"
          : "bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 text-zinc-300"
        }`}
    >
      {template.queryText}
    </button>
  );
}
