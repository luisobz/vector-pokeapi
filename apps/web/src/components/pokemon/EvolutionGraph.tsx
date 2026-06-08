"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles, HelpCircle, RefreshCw, Zap } from "lucide-react";
import { cn } from "@vector-pokeapi/ui";
import Link from "next/link";
import { buildPath } from "@/lib/routes";
import type { PokemonDetail, EvolutionEdge } from "@vector-pokeapi/shared-types";

interface EvolutionGraphProps {
  pokemon: PokemonDetail;
  className?: string;
}

// ─── Graph types ─────────────────────────────────────────────────────────────

type GraphNode = {
  pokemon: PokemonDetail;
  /** Edge that leads INTO this node (undefined for roots). */
  incomingEdge?: EvolutionEdge;
  children: GraphNode[];
};

// ─── Graph builder ────────────────────────────────────────────────────────────

/**
 * Builds a proper directed graph from the current pokemon's evolution data.
 *
 * Key insight: edges from evolvesTo may include edges whose fromPokemonId is NOT
 * the current pokemon (e.g. Pichu's evolvesTo can contain the Pikachu→Raichu edge).
 * We use fromPokemonId / toPokemonId as adjacency keys instead of assuming the
 * current pokemon is always the source.
 */
function buildEvolutionGraph(pokemon: PokemonDetail): {
  roots: GraphNode[];
  nodeCount: number;
  isBranching: boolean;
} {
  const nodeMap = new Map<number, PokemonDetail>();
  const allEdges: EvolutionEdge[] = [];

  (pokemon.evolvesFrom ?? []).forEach((edge) => {
    if (edge.from) nodeMap.set(edge.from.id, edge.from);
    allEdges.push(edge);
  });

  nodeMap.set(pokemon.id, pokemon);

  (pokemon.evolvesTo ?? []).forEach((edge) => {
    if (edge.to) nodeMap.set(edge.to.id, edge.to);
    allEdges.push(edge);
  });

  // Build outgoing-edge map keyed by fromPokemonId (NOT by "which pokemon owns the array")
  const childEdgesOf = new Map<number, EvolutionEdge[]>();
  const hasParent = new Set<number>();

  allEdges.forEach((edge) => {
    if (!childEdgesOf.has(edge.fromPokemonId)) {
      childEdgesOf.set(edge.fromPokemonId, []);
    }
    childEdgesOf.get(edge.fromPokemonId)!.push(edge);
    hasParent.add(edge.toPokemonId);
  });

  // Roots = nodes present in our map that have no incoming edge within the set
  const rootIds = Array.from(nodeMap.keys()).filter((id) => !hasParent.has(id));

  const visited = new Set<number>();

  function buildNode(id: number, incomingEdge?: EvolutionEdge): GraphNode {
    visited.add(id);
    const poke = nodeMap.get(id)!;
    const childEdges = childEdgesOf.get(id) ?? [];
    const children = childEdges
      .filter((e) => nodeMap.has(e.toPokemonId) && !visited.has(e.toPokemonId))
      .map((e) => buildNode(e.toPokemonId, e));
    return { pokemon: poke, incomingEdge, children };
  }

  const roots = rootIds.map((id) => buildNode(id));

  function hasBranching(node: GraphNode): boolean {
    if (node.children.length > 1) return true;
    return node.children.some(hasBranching);
  }

  const isBranching = roots.length > 1 || roots.some(hasBranching);

  return { roots, nodeCount: nodeMap.size, isBranching };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EvolutionGraph({ pokemon, className }: EvolutionGraphProps) {
  const t = useTranslations("PokemonDetail");
  const currentPokemonId = pokemon.id;

  const { roots, nodeCount, isBranching } = useMemo(
    () => buildEvolutionGraph(pokemon),
    [pokemon],
  );

  const hasEvolutions = nodeCount > 1;

  // ── Shared render helpers ──────────────────────────────────────────────────

  const renderTriggerBadge = (edge: EvolutionEdge) => {
    switch (edge.trigger) {
      case "level-up":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-emerald-400 text-[9px] uppercase tracking-wider">{t("evolutionLevel")}</span>
            <span>{edge.minLevel != null ? t("evolutionLevelNo", { level: edge.minLevel }) : t("evolutionUnknown")}</span>
          </div>
        );

      case "use-item":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-amber-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Zap size={8} /> {t("evolutionItem")}
            </span>
            <span className="capitalize">{edge.itemName?.replace(/-/g, " ") || t("evolutionUnknown")}</span>
          </div>
        );

      case "trade":
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-blue-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <RefreshCw size={8} /> {t("evolutionTrade")}
            </span>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg text-[10px] font-bold text-zinc-300">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={8} /> {t("evolutionOther")}
            </span>
          </div>
        );
    }
  };

  /** A badge + arrow connector between two adjacent nodes in the chain. */
  const renderConnector = (edge?: EvolutionEdge) => (
    <div className="flex flex-col items-center justify-center min-w-[60px]">
      {edge && renderTriggerBadge(edge)}
      <ArrowRight size={16} className="text-zinc-500 mt-1" />
    </div>
  );

  const renderPokemonCard = (poke: PokemonDetail) => {
    const isCurrent = poke.id === currentPokemonId;
    const primaryType = poke.types[0] ?? "default";

    return (
      <Link
        href={buildPath("POKEMON_DETAIL", { id: poke.id })}
        className={cn(
          "relative flex flex-col items-center p-3 rounded-xl border w-36 bg-zinc-900/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-xl",
          isCurrent
            ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-400/10"
            : "border-zinc-800 hover:border-zinc-700",
          primaryType === "grass" && "hover:border-emerald-500/50",
          primaryType === "fire" && "hover:border-orange-500/50",
          primaryType === "water" && "hover:border-blue-500/50",
          primaryType === "electric" && "hover:border-yellow-500/50",
          primaryType === "poison" && "hover:border-purple-500/50",
        )}
      >
        {isCurrent && hasEvolutions && (
          <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={8} /> {t("current")}
          </span>
        )}

        {poke.sprite ? (
          <img
            src={poke.sprite}
            alt={poke.name}
            className="w-20 h-20 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center text-zinc-600">{t("noImage")}</div>
        )}

        <span className="text-xs font-bold text-white capitalize mt-1 truncate max-w-full text-center">
          {poke.nameEs ?? poke.name}
        </span>

        <div className="flex gap-1 mt-1 justify-center flex-wrap">
          {poke.types.map((t) => (
            <span
              key={t}
              className={cn(
                "px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-sm text-zinc-300 bg-zinc-800",
                t === "grass" && "text-emerald-300 bg-emerald-950/40",
                t === "fire" && "text-orange-300 bg-orange-950/40",
                t === "water" && "text-sky-300 bg-sky-950/40",
                t === "electric" && "text-yellow-300 bg-yellow-950/40",
                t === "poison" && "text-purple-300 bg-purple-950/40",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </Link>
    );
  };

  // ── Layout helpers ─────────────────────────────────────────────────────────

  /**
   * Walks a node downward while each node has exactly one child,
   * collecting those nodes as the "spine" (linear prefix).
   * Stops when it reaches a leaf or a branch point.
   */
  function flattenSpine(node: GraphNode): GraphNode[] {
    const spine: GraphNode[] = [];
    let current: GraphNode = node;
    while (current.children.length === 1) {
      spine.push(current);
      current = current.children[0]!;
    }
    spine.push(current); // leaf or branch point
    return spine;
  }

  /** Renders a pure horizontal linear chain. */
  const renderLinearChain = (spine: GraphNode[]) => (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {spine.map((node, idx) => (
        <React.Fragment key={node.pokemon.id}>
          {/* incomingEdge lives on the DESTINATION node, so idx > 0 is safe */}
          {idx > 0 && renderConnector(node.incomingEdge)}
          {renderPokemonCard(node.pokemon)}
        </React.Fragment>
      ))}
    </div>
  );

  /**
   * Renders a vertical fan of parallel branches, each row being:
   *   [trigger connector] → [pokemon card] → [...further linear evolutions]
   */
  const renderBranchFan = (branches: GraphNode[]) => (
    <div className="flex flex-col gap-3 pl-1 border-l-2 border-zinc-700/40">
      {branches.map((branch) => {
        // Each branch may itself continue linearly (e.g. Silcoon → Beautifly)
        const branchSpine = flattenSpine(branch);
        return (
          <div key={branch.pokemon.id} className="flex items-center gap-2">
            {branchSpine.map((node, idx) => (
              <React.Fragment key={node.pokemon.id}>
                {renderConnector(idx === 0 ? node.incomingEdge : node.incomingEdge)}
                {renderPokemonCard(node.pokemon)}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );

  /**
   * Main tree renderer. Detects whether the subtree rooted at `node` is
   * purely linear or has a fan-out, and renders accordingly.
   *
   *   Linear:    A ──► B ──► C
   *
   *   Fan-out:   [spine] ──► BranchPoint ─┬──► D
   *                                        ├──► E
   *                                        └──► F
   */
  const renderTree = (node: GraphNode): React.ReactNode => {
    const spine = flattenSpine(node);
    const branchPoint = spine[spine.length - 1]!;
    const branches = branchPoint!.children;

    // Pure linear — no branching anywhere in the spine
    if (branches.length === 0) {
      return renderLinearChain(spine);
    }

    // spine has a branch point at the end → render spine prefix + branch point + fan
    const spinePrefix = spine.slice(0, -1); // ancestors before the branch point

    return (
      <div className="flex items-center gap-3">
        {/* Spine prefix (ancestors before the branch point) */}
        {spinePrefix.map((n, idx) => (
          <React.Fragment key={n.pokemon.id}>
            {idx > 0 && renderConnector(n.incomingEdge)}
            {renderPokemonCard(n.pokemon)}
          </React.Fragment>
        ))}

        {/* Connector into branch point (only when there are ancestors above it) */}
        {spinePrefix.length > 0 && renderConnector(branchPoint.incomingEdge)}

        {/* The branch point itself */}
        {renderPokemonCard(branchPoint.pokemon)}

        {/* Fan of parallel branches */}
        {renderBranchFan(branches)}
      </div>
    );
  };

  // ── Root render ────────────────────────────────────────────────────────────

  if (!hasEvolutions) {
    return (
      <div
        className={cn(
          "w-full py-6 px-4 bg-zinc-950/30 border border-white/5 rounded-2xl flex justify-center",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-4">
          {renderPokemonCard(pokemon)}
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {t("noEvolutions")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto py-6 px-4 bg-zinc-950/30 border border-white/5 rounded-2xl",
        "flex justify-center items-center",
        "scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-zinc-950",
        isBranching && "items-start",
        className,
      )}
    >
      <div className="min-w-max flex flex-col gap-8 items-center py-2">
        {roots.map((root) => (
          <React.Fragment key={root.pokemon.id}>{renderTree(root)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}