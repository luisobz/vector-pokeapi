"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

interface LoreSectionProps {
  descriptions: Record<string, string | null | undefined>;
}

export default function LoreSection({ descriptions }: LoreSectionProps) {
  const t = useTranslations("PokemonDetail");
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!descriptions) return null;

  const description =
    descriptions[locale] ?? Object.values(descriptions).find(Boolean) ?? "";

  if (!description) return null;
  const paragraphs = description.split("\n").filter(p => p.trim() !== "");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <BookOpen size={18} className="text-emerald-400" /> {t("loreTitle")}
        </h2>
      </div>

      <div className="relative p-6 pb-18 rounded-2xl bg-zinc-900/50 border border-white/5">
        <motion.div
          animate={{ height: isExpanded ? "auto" : "180px" }}
          initial={{ height: "180px" }}
          className="overflow-hidden text-sm text-zinc-300 leading-relaxed"
        >
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Overlays para estado colapsado */}
        {!isExpanded && paragraphs.length > 0 && (
          <>
            <div className="absolute bottom-14 left-0 right-0 h-18 bg-gradient-to-t from-zinc-900/90 to-transparent pointer-events-none rounded-b-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-69
              bg-gradient-to-t from-zinc-900/95 via-zinc-900/60 to-transparent
              dark:from-zinc-950 dark:via-zinc-950 dark:to-transparent
              shadow-[0_-25px_30px_-15px_rgb(0,0,0,0.25)]
              shadow-[0_-15px_20px_-10px_rgb(0,0,0,0.15)]
              pointer-events-none"
            />
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 pb-6 flex justify-center items-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/20"
          >
            {isExpanded ? (
              <>
                {t("showLess")} <ChevronUp size={14} />
              </>
            ) : (
              <>
                {t("showMore")} <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}