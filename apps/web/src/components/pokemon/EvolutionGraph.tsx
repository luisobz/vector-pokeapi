"use client";

import React from "react";
import { ArrowRight, Sparkles, HelpCircle, RefreshCw, Zap } from "lucide-react";
import { cn } from "@vector-pokeapi/ui";
import Link from "next/link";
import type { EvolutionNode, EvolutionLink, EvolutionTree } from "@vector-pokeapi/shared-types";

interface EvolutionGraphProps {
  chain: EvolutionTree;
  currentPokemonId: number;
  className?: string;
}

export default function EvolutionGraph({ chain, currentPokemonId, className }: EvolutionGraphProps) {
  // Helper to render trigger details
  const renderTriggerBadge = (link: EvolutionLink) => {
    switch (link.trigger) {
      case "level-up":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-emerald-400 text-[9px] uppercase tracking-wider">Nivel</span>
            <span>N.º {link.minLevel || "—"}</span>
          </div>
        );
      case "use-item":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-amber-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Zap size={8} /> Objeto
            </span>
            <span className="capitalize">{link.itemName?.replace("-", " ") || "Piedra"}</span>
          </div>
        );
      case "trade":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-blue-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <RefreshCw size={8} /> Intercambio
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={8} /> Otro
            </span>
          </div>
        );
    }
  };

  // Helper to render a single Pokemon node card
  const renderNode = (node: EvolutionNode) => {
    const isCurrent = node.id === currentPokemonId;
    const primaryType = node.types[0] || "default";

    return (
      <Link
        href={`/pokemon/${node.id}`}
        key={node.id}
        className={cn(
          "relative flex flex-col items-center p-3 rounded-xl border w-36 bg-zinc-900/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-xl",
          isCurrent
            ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-450/10"
            : "border-zinc-800 hover:border-zinc-700",
          primaryType === "grass" && "hover:border-emerald-500/50",
          primaryType === "fire" && "hover:border-orange-500/50",
          primaryType === "water" && "hover:border-blue-500/50",
          primaryType === "electric" && "hover:border-yellow-500/50",
          primaryType === "poison" && "hover:border-purple-500/50"
        )}
      >
        {isCurrent && (
          <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1 animate-pulse">
            <Sparkles size={8} /> Actual
          </span>
        )}

        {/* Sprite */}
        {node.sprite ? (
          <img
            src={node.sprite}
            alt={node.name}
            className="w-20 h-20 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center text-zinc-600">No Img</div>
        )}

        {/* Details */}
        <span className="text-xs font-bold text-white capitalize mt-1 truncate max-w-full text-center">
          {node.nameEs || node.name}
        </span>

        <div className="flex gap-1 mt-1 justify-center">
          {node.types.map((t) => (
            <span
              key={t}
              className={cn(
                "px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-sm text-zinc-300 bg-zinc-800",
                t === "grass" && "text-emerald-300 bg-emerald-950/40",
                t === "fire" && "text-orange-300 bg-orange-950/40",
                t === "water" && "text-sky-300 bg-sky-950/40",
                t === "electric" && "text-yellow-300 bg-yellow-950/40",
                t === "poison" && "text-purple-300 bg-purple-950/40"
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </Link>
    );
  };

  // Render the tree recursively using a columns based layout
  // Column 1: Root Node
  // Column 2: Branches (If Eevee, there are multiple branches vertically stacked)
  // Column 3: Secondary branches (Ivysaur -> Venusaur)
  const renderTree = (tree: EvolutionTree): React.ReactNode => {
    if (tree.evolvesTo.length === 0) {
      return <div className="flex items-center">{renderNode(tree.pokemon)}</div>;
    }

    return (
      <div className="flex flex-row items-center gap-6 md:gap-12">
        {/* Current Node */}
        {renderNode(tree.pokemon)}

        {/* Connections and Next Nodes */}
        <div className="flex flex-col gap-6">
          {tree.evolvesTo.map((link, idx) => (
            <div key={idx} className="flex flex-row items-center gap-6 md:gap-12">
              {/* Connector Arrow with Trigger Badge */}
              <div className="flex flex-col items-center justify-center min-w-[60px] relative">
                {renderTriggerBadge(link)}
                <div className="w-full flex items-center justify-center mt-2 text-zinc-600">
                  <ArrowRight size={16} className="text-zinc-500 animate-pulse" />
                </div>
              </div>

              {/* Next Node Tree */}
              {renderTree(link.to)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto py-6 px-4 bg-zinc-950/30 border border-white/5 rounded-2xl flex justify-center items-center scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-zinc-950",
        className
      )}
    >
      <div className="min-w-max flex justify-center py-2">{renderTree(chain)}</div>
    </div>
  );
}
