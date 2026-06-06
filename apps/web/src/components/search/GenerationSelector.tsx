import React from "react";
import { useTranslations } from "next-intl";

interface GenerationSelectorProps {
  selectedGen: number | "";
  onSelect: (gen: number | "") => void;
  generations: { value: number; label: string }[];
}

export default function GenerationSelector({ selectedGen, onSelect, generations }: GenerationSelectorProps) {
  const t = useTranslations("SearchPage");

  return (
    <div>
      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
        {t("generation")}
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {generations.map((gen) => (
          <button
            key={gen.value}
            onClick={() => onSelect(selectedGen === gen.value ? "" : gen.value)}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGen === gen.value
                ? "bg-white text-black border-white shadow-lg"
                : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
          >
            {t("genPrefix")} {gen.value}
          </button>
        ))}
      </div>
    </div>
  );
}
