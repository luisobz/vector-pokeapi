import React from "react";
import { useTranslations } from "next-intl";
import { ElementEffect, ElementType } from "@vector-pokeapi/elements-effects";

interface TypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  types: string[];
}

export default function TypeSelector({ selectedType, onSelect, types }: TypeSelectorProps) {
  const t = useTranslations("SearchPage");

  return (
    <div>
      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
        {t("elementalType")}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {types.map((type) => (
          <ElementEffect key={type} type={type as ElementType}>
            <button
              key={type}
              onClick={() => onSelect(selectedType === type ? "" : type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all border ${selectedType === type
                ? "bg-white text-black border-white shadow-lg"
                : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
            >
              {type}
            </button>
          </ElementEffect>
        ))}
      </div>
    </div>
  );
}
