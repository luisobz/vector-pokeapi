import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import SimilarPokemonCard from "./SimilarPokemonCard";

interface SimilarPokemonAccordionProps {
  groups: any[];
  expandedGens: Record<number, boolean>;
  onToggle: (gen: number) => void;
}

export default function SimilarPokemonAccordion({ groups, expandedGens, onToggle }: SimilarPokemonAccordionProps) {
  const t = useTranslations("PokemonDetail");

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = !!expandedGens[group.generation];
        return (
          <div
            key={group.generation}
            className="border border-white/5 rounded-xl bg-zinc-950/20 overflow-hidden shadow-sm"
          >
            {/* Accordion Trigger */}
            <button
              onClick={() => onToggle(group.generation)}
              className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all"
            >
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                {t("genAccordion", { gen: group.generation, count: group.pokemons.length })}
              </span>
              {isExpanded ? (
                <ChevronUp size={16} className="text-zinc-500" />
              ) : (
                <ChevronDown size={16} className="text-zinc-500" />
              )}
            </button>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 bg-zinc-950/40">
                    {group.pokemons.map((sim: any) => (
                      <SimilarPokemonCard key={sim.id} similar={sim} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
