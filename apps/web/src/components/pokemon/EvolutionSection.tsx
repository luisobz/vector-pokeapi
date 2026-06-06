import React from "react";
import { GitFork } from "lucide-react";
import EvolutionGraph from "./EvolutionGraph";
import { useTranslations } from "next-intl";

interface EvolutionSectionProps {
  evolutionChain: any;
  currentPokemonId: number;
}

export default function EvolutionSection({ evolutionChain, currentPokemonId }: EvolutionSectionProps) {
  const t = useTranslations("PokemonDetail");

  if (!evolutionChain) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <GitFork size={18} className="text-emerald-400" /> {t("evolutionRoadmap")}
      </h2>
      <EvolutionGraph chain={evolutionChain} currentPokemonId={currentPokemonId} />
    </section>
  );
}
