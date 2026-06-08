"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Compass } from "lucide-react";
import { HolographicCard } from "@vector-pokeapi/ui";
import { usePokemonDetail } from "../../../composables";
import StatsSection from "../../../components/pokemon/StatsSection";
import EvolutionSection from "../../../components/pokemon/EvolutionSection";
import SimilarPokemonAccordion from "../../../components/pokemon/SimilarPokemonAccordion";
import LoreSection from "../../../components/pokemon/LoreSection";
import { motion } from "framer-motion";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import BackButton from "../../../components/BackButton";
import { useTranslations } from "next-intl";

export default function PokemonDetailPage() {
  const params = useParams();
  const pokemonId = Number(params.id);
  const { pokemon, similarGroups, isLoading, error, expandedGens, toggleGenAccordion } = usePokemonDetail(pokemonId);
  const t = useTranslations("PokemonDetail");

  if (isLoading) return <LoadingState />;
  if (error || !pokemon) return <ErrorState errorMessage={error || t("errorDefault")} />;

  return (
    <div className="space-y-8 pb-16">
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col items-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <HolographicCard pokemon={pokemon} showEvolutionsHover={false} />
          </motion.div>
        </div>
        <div className="lg:col-span-8 space-y-8">
          <StatsSection stats={pokemon.stats} />
          <LoreSection description={pokemon.description} />
          <EvolutionSection pokemon={pokemon} />
          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Compass size={18} className="text-purple-400" /> {t("similarConcepts")}
            </h2>
            {similarGroups.length > 0 ? (
              <SimilarPokemonAccordion groups={similarGroups} expandedGens={expandedGens} onToggle={toggleGenAccordion} />
            ) : (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl text-xs text-zinc-600">
                {t("noVectors")}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}