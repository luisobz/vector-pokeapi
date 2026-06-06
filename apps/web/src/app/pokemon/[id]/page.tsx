"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, Compass } from "lucide-react";
import { HolographicCard } from "@vector-pokeapi/ui";
import StatsSection from "../../../components/pokemon/StatsSection";
import EvolutionSection from "../../../components/pokemon/EvolutionSection";
import SimilarPokemonAccordion from "../../../components/pokemon/SimilarPokemonAccordion";
import LoreSection from "../../../components/pokemon/LoreSection";
import { Pokemon, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";
import { motion } from "framer-motion";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import BackButton from "../../../components/BackButton";
import { useTranslations } from "next-intl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("PokemonDetail");
  const pokemonId = Number(params.id);

  const [pokemon, setPokemon] = useState<(Pokemon & { evolutionChain?: any }) | null>(null);
  const [similarGroups, setSimilarGroups] = useState<SimilarGroupedByGen[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGens, setExpandedGens] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!pokemonId) return;

    setIsLoading(true);
    setError(null);

    // Fetch Pokemon detail and similarity groups in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/api/pokemon/${pokemonId}`).then((res) => {
        if (!res.ok) throw new Error("Pokemon no encontrado");
        return res.json();
      }),
      fetch(`${API_BASE_URL}/api/pokemon/${pokemonId}/similar`).then((res) => {
        if (!res.ok) throw new Error("Error cargando similares");
        return res.json();
      }),
    ])
      .then(([detailData, similarData]) => {
        setPokemon(detailData);
        setSimilarGroups(similarData);

        // Expand the first generation category by default in the accordion
        if (similarData.length > 0) {
          setExpandedGens({ [similarData[0].generation]: true });
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar los datos del Pokémon");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pokemonId]);

  const toggleGenAccordion = (gen: number) => {
    setExpandedGens((prev) => ({
      ...prev,
      [gen]: !prev[gen],
    }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !pokemon) {
    return <ErrorState errorMessage={error || t("errorDefault")} />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button / Navigation */}
      <div className="flex items-center justify-between">
        <BackButton />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Card Display */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <HolographicCard pokemon={pokemon} showEvolutionsHover={false} />
          </motion.div>
        </div>

        {/* Right Column - Stats, Evolutions, Similars */}
        <div className="lg:col-span-8 space-y-8">
          <StatsSection stats={pokemon.stats} />

          {/* Section 1.5: Lore */}
          <LoreSection description={pokemon.description} />

          {/* Section 2: Evolution Roadmap */}
          <EvolutionSection evolutionChain={pokemon.evolutionChain} currentPokemonId={pokemon.id} />

          {/* Section 3: Conceptually Similar */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Compass size={18} className="text-purple-400" /> {t("similarConcepts")}
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                <Sparkles size={8} className="animate-pulse" /> {t("cosineSimilarity")}
              </span>
            </div>

            {similarGroups.length > 0 ? (
              <SimilarPokemonAccordion
                groups={similarGroups}
                expandedGens={expandedGens}
                onToggle={toggleGenAccordion}
              />
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
