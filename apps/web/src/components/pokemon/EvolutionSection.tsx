import React from "react";
import { GitFork } from "lucide-react";
import EvolutionGraph from "./EvolutionGraph";
import { useTranslations } from "next-intl";
import type { PokemonDetail } from "@vector-pokeapi/shared-types";

interface EvolutionSectionProps {
  pokemon: PokemonDetail;
}

export default function EvolutionSection({ pokemon }: EvolutionSectionProps) {
  const t = useTranslations("PokemonDetail");

  // Only show if there are evolutions
  if (!pokemon.evolvesFrom && !pokemon.evolvesTo) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <GitFork size={18} className="text-emerald-400" /> {t("evolutionRoadmap")}
      </h2>
      <EvolutionGraph pokemon={pokemon} />
    </section>
  );
}
