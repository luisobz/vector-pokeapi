import React from "react";
import Link from "next/link";
import PokemonTypeBadge from "./PokemonTypeBadge";
import SimilarScoreBadge from "./SimilarScoreBadge";
import { buildPath } from "@/lib/routes";

interface SimilarPokemonCardProps {
  similar: any;
}

export default function SimilarPokemonCard({ similar }: SimilarPokemonCardProps) {
  return (
    <Link
      href={buildPath('POKEMON_DETAIL', { id: similar.id })}
      className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all group"
    >
      <div className="flex items-center gap-3">
        {similar.sprite ? (
          <img
            src={similar.sprite}
            alt={similar.name}
            className="w-10 h-10 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="w-10 h-10 bg-zinc-850 rounded-md" />
        )}
        <div className="text-left">
          <span className="text-xs font-bold text-white capitalize block group-hover:text-cyan-400 transition-colors">
            {similar.nameEs || similar.name}
          </span>
          <div className="flex gap-1 mt-0.5">
            {similar.types.map((t: string) => (
              <PokemonTypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>

      <SimilarScoreBadge score={similar.similarity_score} />
    </Link>
  );
}
