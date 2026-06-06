import React from "react";

interface PokemonTypeBadgeProps {
  type: string;
}

export default function PokemonTypeBadge({ type }: PokemonTypeBadgeProps) {
  return (
    <span className="text-[8px] px-1 bg-white/5 rounded-sm text-zinc-400">
      {type}
    </span>
  );
}
