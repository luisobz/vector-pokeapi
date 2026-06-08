import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardSkeleton from "./CardSkeleton";
import EmptyResults from "./EmptyResults";
import { PokemonDetail } from "@vector-pokeapi/shared-types";

interface ResultsGridProps {
  isLoading: boolean;
  pokemonList: PokemonDetail[];
  renderItem: (pokemon: PokemonDetail) => React.ReactNode;
  skeletonCount?: number;
}

export default function ResultsGrid({ isLoading, pokemonList, renderItem, skeletonCount = 8 }: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (pokemonList.length === 0) {
    return <EmptyResults />;
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center"
    >
      <AnimatePresence mode="popLayout">
        {pokemonList.map((pokemon) => (
          <motion.div
            key={pokemon.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {renderItem(pokemon)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
