"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pokemon, EvolutionEdge } from "@vector-pokeapi/shared-types";
import { cn } from "../utils";
import { Sparkles } from "lucide-react";

interface HolographicCardProps {
  pokemon: Pokemon;
  className?: string;
  onClick?: () => void;
  showEvolutionsHover?: boolean;
}

// Color palette mapping based on primary Pokemon type
const typeThemes: Record<
  string,
  {
    bg: string;
    border: string;
    glow: string;
    shimmer: string;
    text: string;
  }
> = {
  grass: {
    bg: "bg-linear-to-br from-emerald-950 to-teal-900",
    border: "border-emerald-500/50",
    glow: "shadow-emerald-500/30",
    shimmer: "from-emerald-400/20 via-teal-400/10 to-transparent",
    text: "text-emerald-300",
  },
  fire: {
    bg: "bg-linear-to-br from-red-950 to-orange-900",
    border: "border-orange-500/50",
    glow: "shadow-orange-500/30",
    shimmer: "from-orange-400/20 via-red-400/10 to-transparent",
    text: "text-orange-300",
  },
  water: {
    bg: "bg-linear-to-br from-blue-950 to-sky-900",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/30",
    shimmer: "from-sky-400/20 via-blue-400/10 to-transparent",
    text: "text-sky-300",
  },
  electric: {
    bg: "bg-linear-to-br from-yellow-950/80 to-amber-900/80",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    shimmer: "from-yellow-400/20 via-amber-400/10 to-transparent",
    text: "text-yellow-300",
  },
  poison: {
    bg: "bg-linear-to-br from-purple-950 to-fuchsia-950",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/30",
    shimmer: "from-fuchsia-400/20 via-purple-400/10 to-transparent",
    text: "text-purple-300",
  },
  default: {
    bg: "bg-linear-to-br from-zinc-900 to-zinc-800",
    border: "border-zinc-700/50",
    glow: "shadow-zinc-500/10",
    shimmer: "from-white/10 via-zinc-400/5 to-transparent",
    text: "text-zinc-300",
  },
};

const defaultTheme = typeThemes["default"]!;

export function HolographicCard({
  pokemon,
  className,
  onClick,
  showEvolutionsHover = true,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Spring animated transforms
  const rotateX = useState(() => 0);
  const rotateY = useState(() => 0);
  const shimmerX = useState(() => 50);
  const shimmerY = useState(() => 50);
  const shimmerOpacity = useState(() => 0);

  const primaryType = pokemon.types[0];
  const theme = (primaryType != null ? typeThemes[primaryType] : undefined) ?? defaultTheme;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate cursor coordinate percentage relative to the card center
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Smoothly scale rotation values
    const degX = -(mouseY / (height / 2)) * 12; // max 12 deg
    const degY = (mouseX / (width / 2)) * 12; // max 12 deg

    rotateX[1](degX);
    rotateY[1](degY);

    // Calculate shimmer coordinates
    const pxX = ((e.clientX - rect.left) / width) * 100;
    const pxY = ((e.clientY - rect.top) / height) * 100;

    shimmerX[1](pxX);
    shimmerY[1](pxY);
    shimmerOpacity[1](0.6);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rotateX[1](0);
    rotateY[1](0);
    shimmerOpacity[1](0);
  };

  // Safe checks for nested evolution data
  const nextEvolutions = pokemon.evolvesTo
    ?.map((edge: EvolutionEdge) => edge.to)
    .filter((p): p is Pokemon => !!p) || [];

  return (
    <div className="relative group/fan select-none">
      {/* Evolution Mini-cards Fan Out (Hover Effect) */}
      {showEvolutionsHover && nextEvolutions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <AnimatePresence>
            {hovered &&
              nextEvolutions.map((evol: Pokemon, index: number) => {
                // Calculate fan offsets
                const angle = (index - (nextEvolutions.length - 1) / 2) * 20; // 20 deg spacing
                const xOffset = (index - (nextEvolutions.length - 1) / 2) * 55 + 50; // offset right
                const yOffset = -80; // offset upwards

                const evolPrimaryType = evol.types[0];
                const evolTheme = (evolPrimaryType != null ? typeThemes[evolPrimaryType] : undefined) ?? defaultTheme;

                return (
                  <motion.div
                    key={evol.id}
                    initial={{ opacity: 0, scale: 0.6, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      opacity: 0.95,
                      scale: 0.75,
                      x: xOffset,
                      y: yOffset,
                      rotate: angle,
                      transition: {
                        type: "spring",
                        stiffness: 120,
                        damping: 12,
                        delay: index * 0.05,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.6,
                      x: 0,
                      y: 0,
                      rotate: 0,
                      transition: { duration: 0.2 },
                    }}
                    className={cn(
                      "absolute top-0 left-0 w-full h-full rounded-2xl flex flex-col justify-center items-center border p-2 backdrop-blur-md shadow-2xl overflow-hidden",
                      evolTheme.bg,
                      evolTheme.border
                    )}
                  >
                    {/* Background Image Layer */}
                    <div
                      className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-50 mix-blend-overlay bg-no-repeat"
                      style={{
                        backgroundImage: "url('/future-background.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        zIndex: -1,
                      }}
                    />
                    {/* Sprite */}
                    {evol.sprite && (
                      <img
                        src={evol.sprite}
                        alt={evol.name}
                        className="w-24 h-24 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] pointer-events-none select-none z-10 relative"
                        draggable={false}
                      />
                    )}
                    <span className="text-white text-[10px] uppercase tracking-wider font-bold mt-1 z-10 relative">
                      {evol.nameEs || evol.name}
                    </span>
                    <div className="flex gap-1 mt-1 z-10 relative">
                      {evol.types.map((t: string) => (
                        <span
                          key={t}
                          className="px-1 text-[8px] bg-white/10 rounded-full text-white/90"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}

      {/* Main Holographic Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          transformStyle: "preserve-3d",
          rotateX: rotateX[0],
          rotateY: rotateY[0],
        }}
        animate={{
          scale: hovered ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className={cn(
          "relative w-72 h-[420px] rounded-2xl p-4 border flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl transition-colors transition-shadow duration-150 z-10",
          theme.bg,
          theme.border,
          theme.glow,
          hovered && "shadow-2xl"
        )}
      >
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay bg-no-repeat"
          style={{
            backgroundImage: "url('/future-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -1,
          }}
        />

        {/* Holographic Reflective Overlay */}
        <div
          style={{
            background: `radial-gradient(circle at ${shimmerX[0]}% ${shimmerY[0]}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 45%, transparent 70%), linear-gradient(${shimmerX[0]}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)`,
            opacity: shimmerOpacity[0],
          }}
          className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300 z-20"
        />

        {/* Card Header */}
        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest">
              N.º {String(pokemon.id).padStart(3, "0")}
            </span>
            <h3 className="text-xl font-extrabold text-white capitalize leading-tight">
              {pokemon.nameEs || pokemon.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white uppercase tracking-wider">
              GEN {pokemon.generation}
            </span>
            {pokemon.embedding && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md">
                <Sparkles size={8} /> Vector
              </span>
            )}
          </div>
        </div>

        {/* Card Body - Sprite Viewport */}
        <div className="relative flex-1 flex justify-center items-center my-2">
          {/* Glassmorphic backdrop circle */}
          <div className="absolute w-44 h-44 rounded-full bg-white/5 border border-white/5 blur-md" />

          {pokemon.sprite ? (
            <motion.img
              src={pokemon.sprite}
              alt={pokemon.name}
              initial={{ scale: 0.9, y: 5 }}
              animate={{
                scale: hovered ? 1.05 : 0.95,
                y: hovered ? -8 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-44 h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] z-10 pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-zinc-600 z-10">
              No Image
            </div>
          )}
        </div>

        {/* Card Footer - Types & Description */}
        <div className="space-y-3 z-10">
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-white shadow-md border",
                  type === "grass" && "bg-emerald-400 text-emerald-950 border-emerald-300",
                  type === "fire" && "bg-orange-500 text-orange-950 border-orange-400",
                  type === "water" && "bg-sky-400 text-sky-950 border-sky-300",
                  type === "electric" && "bg-yellow-400 text-yellow-950 border-yellow-300",
                  type === "poison" && "bg-purple-400 text-purple-950 border-purple-300",
                  type === "normal" && "bg-zinc-400 text-zinc-950 border-zinc-300"
                )}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Quick stats mini bar horizontal */}
          <div className="flex gap-1 justify-between items-center pt-2 border-t border-white/10 text-center text-[10px] font-mono text-zinc-400">
            <div>
              <span className="block text-white font-bold">{pokemon.stats.hp}</span>
              <span>HP</span>
            </div>
            <div>
              <span className="block text-white font-bold">{pokemon.stats.attack}</span>
              <span>ATK</span>
            </div>
            <div>
              <span className="block text-white font-bold">{pokemon.stats.defense}</span>
              <span>DEF</span>
            </div>
            <div>
              <span className="block text-white font-bold">{(pokemon as any).weight ? `${(pokemon as any).weight / 10}kg` : '-'}</span>
              <span>PESO</span>
            </div>
            <div>
              <span className="block text-white font-bold">{(pokemon as any).height ? `${(pokemon as any).height / 10}m` : '-'}</span>
              <span>ALT.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
