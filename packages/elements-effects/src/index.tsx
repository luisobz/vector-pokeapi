"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

// — Normal —
import { normalContainerVariants, normalShimmerVariants } from "./elements/normal";
// — Fire —
import { fireContainerVariants, generateFireParticles, type FireParticle } from "./elements/fire";
// — Water —
import { waterContainerVariants, waveVariants, generateWaterBubbles, type WaterBubble } from "./elements/water";
// — Grass —
import { grassContainerVariants, generateGrassParticles, type GrassParticle } from "./elements/grass";
// — Electric —
import { electricContainerVariants, generateElectricSparks, type ElectricSpark } from "./elements/electric";
// — Ice —
import { iceContainerVariants, frostOverlayVariants, generateIceParticles, type IceParticle } from "./elements/ice";
// — Fighting —
import { fightingContainerVariants, fightingRingVariants } from "./elements/fighting";
// — Poison —
import { poisonContainerVariants, generatePoisonBubbles, type PoisonBubble } from "./elements/poison";
// — Ground —
import { groundContainerVariants, generateGroundParticles, type GroundParticle } from "./elements/ground";
// — Flying —
import { flyingContainerVariants, generateWindStreaks, type WindStreak } from "./elements/flying";
// — Psychic —
import { psychicContainerVariants, psychicOrbitVariants, psychicOrbitVariants2 } from "./elements/psychic";
// — Bug —
import { bugContainerVariants, generateBugParticles, type BugParticle } from "./elements/bug";
// — Rock —
import { rockContainerVariants, generateRockParticles, type RockParticle } from "./elements/rock";
// — Ghost —
import { ghostContainerVariants, generateGhostWisps, type GhostWisp } from "./elements/ghost";
// — Dragon —
import { dragonContainerVariants, dragonShimmerVariants } from "./elements/dragon";
// — Dark —
import { darkContainerVariants, darkOverlayVariants, darkCorners } from "./elements/dark";
// — Steel —
import { steelContainerVariants, steelShineVariants, generateSteelSparkles, type SteelSparkle } from "./elements/steel";
// — Fairy —
import { fairyContainerVariants, generateFairyParticles, type FairyParticle } from "./elements/fairy";

// ─────────────────────────────────────────────────────────────────
export type ElementType =
  | "normal" | "fire" | "water" | "grass" | "electric" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

type AnyParticle =
  | FireParticle | WaterBubble | GrassParticle | ElectricSpark | IceParticle
  | PoisonBubble | GroundParticle | WindStreak | BugParticle | RockParticle
  | GhostWisp | SteelSparkle | FairyParticle;

// ─────────────────────────────────────────────────────────────────
const CONTAINER_VARIANTS: Record<ElementType, object> = {
  normal: normalContainerVariants,
  fire: fireContainerVariants,
  water: waterContainerVariants,
  grass: grassContainerVariants,
  electric: electricContainerVariants,
  ice: iceContainerVariants,
  fighting: fightingContainerVariants,
  poison: poisonContainerVariants,
  ground: groundContainerVariants,
  flying: flyingContainerVariants,
  psychic: psychicContainerVariants,
  bug: bugContainerVariants,
  rock: rockContainerVariants,
  ghost: ghostContainerVariants,
  dragon: dragonContainerVariants,
  dark: darkContainerVariants,
  steel: steelContainerVariants,
  fairy: fairyContainerVariants,
};

function initParticles(type: ElementType): AnyParticle[] {
  switch (type) {
    case "fire": return generateFireParticles(12);
    case "water": return generateWaterBubbles(7);
    case "grass": return generateGrassParticles(10);
    case "electric": return generateElectricSparks(10);
    case "ice": return generateIceParticles(9);
    case "poison": return generatePoisonBubbles(9);
    case "ground": return generateGroundParticles(12);
    case "flying": return generateWindStreaks(8);
    case "bug": return generateBugParticles(10);
    case "rock": return generateRockParticles(9);
    case "ghost": return generateGhostWisps(7);
    case "steel": return generateSteelSparkles(10);
    case "fairy": return generateFairyParticles(12);
    default: return [];
  }
}

// ─────────────────────────────────────────────────────────────────
interface ElementEffectProps {
  type: ElementType;
  children: React.ReactNode;
}

export const ElementEffect: React.FC<ElementEffectProps> = ({ type, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles] = useState<AnyParticle[]>(() => initParticles(type));

  return (
    <motion.div
      className="relative inline-flex overflow-hidden rounded-xl border border-transparent transition-colors duration-300"
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={CONTAINER_VARIANTS[type] as any}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ isolation: "isolate" }}
    >
      {/* ── Overlay layer ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {renderOverlay(type, isHovered, particles)}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full h-full bg-transparent">
        {children}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Overlay renderer — one branch per element type
// ─────────────────────────────────────────────────────────────────
function renderOverlay(
  type: ElementType,
  isHovered: boolean,
  particles: AnyParticle[]
): React.ReactNode {

  // ── Normal ──────────────────────────────────────────────────────
  if (type === "normal") {
    return (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-15deg]"
        variants={normalShimmerVariants as any}
      />
    );
  }

  // ── Fire ────────────────────────────────────────────────────────
  if (type === "fire" && isHovered) {
    return (particles as FireParticle[]).map((p) => (
      <motion.div
        key={p.id}
        className="absolute bottom-0 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 mix-blend-screen"
        style={{ width: p.size, height: p.size, left: `${p.x}%` }}
        initial={{ y: 0, opacity: 1, scale: 1, x: 0 }}
        animate={{ y: -52, x: p.drift, opacity: 0, scale: 0.2 }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
      />
    ));
  }

  // ── Water ───────────────────────────────────────────────────────
  if (type === "water") {
    return (
      <>
        {/* Wave */}
        <motion.div
          className="absolute inset-0 bg-blue-600/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="absolute bg-gradient-to-t from-blue-500/50 to-cyan-400/40 w-[200%] h-[200%] left-[-50%]"
            style={{ borderRadius: "43%" }}
            variants={waveVariants as any}
          />
        </motion.div>
        {/* Bubbles */}
        {isHovered && (particles as WaterBubble[]).map((b) => (
          <motion.div
            key={b.id}
            className="absolute bottom-0 rounded-full border border-blue-300/60 bg-blue-200/20"
            style={{ width: b.size, height: b.size, left: `${b.x}%` }}
            initial={{ y: 0, opacity: 0.8 }}
            animate={{ y: -60, opacity: 0 }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </>
    );
  }

  // ── Grass ───────────────────────────────────────────────────────
  if (type === "grass" && isHovered) {
    return (particles as GrassParticle[]).map((p) => (
      <motion.div
        key={p.id}
        className="absolute bottom-0 bg-green-400 rounded-sm"
        style={{ width: p.width, height: p.height, left: `${p.x}%` }}
        initial={{ y: 0, opacity: 1, x: 0, rotate: p.rotate }}
        animate={{ y: -58, x: p.drift, opacity: 0, rotate: p.rotateTo }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
      />
    ));
  }

  // ── Electric ────────────────────────────────────────────────────
  if (type === "electric" && isHovered) {
    return (particles as ElectricSpark[]).map((s) => (
      <motion.div
        key={s.id}
        className="absolute rounded-full bg-yellow-300"
        style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%` }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.4, 1.4, 0] }}
        transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: Math.random() * 0.4 }}
      />
    ));
  }

  // ── Ice ─────────────────────────────────────────────────────────
  if (type === "ice") {
    return (
      <>
        {/* Frost edge overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-200/30 via-transparent to-sky-200/30"
          variants={frostOverlayVariants as any}
        />
        {/* Snowflakes */}
        {isHovered && (particles as IceParticle[]).map((p) => (
          <motion.div
            key={p.id}
            className="absolute top-0 text-cyan-300/80 font-thin select-none"
            style={{ fontSize: p.size, left: `${p.x}%` }}
            initial={{ y: -10, opacity: 1, rotate: p.rotate }}
            animate={{ y: "110%", opacity: 0, rotate: p.rotate + 180 }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          >
            ❄
          </motion.div>
        ))}
      </>
    );
  }

  // ── Fighting ────────────────────────────────────────────────────
  if (type === "fighting" && isHovered) {
    return [0, 0.3, 0.6].map((delay, i) => (
      <motion.div
        key={i}
        className="absolute inset-0 m-auto rounded-full border-2 border-red-500/70"
        style={{ width: "60%", height: "60%" }}
        variants={fightingRingVariants(delay) as any}
      />
    ));
  }

  // ── Poison ──────────────────────────────────────────────────────
  if (type === "poison" && isHovered) {
    return (particles as PoisonBubble[]).map((b) => (
      <motion.div
        key={b.id}
        className="absolute bottom-0 rounded-full border border-purple-400/50 bg-gradient-to-t from-purple-600/40 to-violet-400/30"
        style={{ width: b.size, height: b.size, left: `${b.x}%` }}
        initial={{ y: 0, opacity: 0.9, x: 0 }}
        animate={{ y: -55, x: b.wobble, opacity: 0 }}
        transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
      />
    ));
  }

  // ── Ground ──────────────────────────────────────────────────────
  if (type === "ground" && isHovered) {
    return (particles as GroundParticle[]).map((p) => (
      <motion.div
        key={p.id}
        className="absolute bottom-0 rounded-sm bg-amber-700/80"
        style={{ width: p.size, height: p.size * 0.7, left: `${p.x}%` }}
        initial={{ y: 0, x: 0, opacity: 1 }}
        animate={{ y: -35, x: p.dirX, opacity: 0 }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
      />
    ));
  }

  // ── Flying ──────────────────────────────────────────────────────
  if (type === "flying" && isHovered) {
    return (particles as WindStreak[]).map((s) => (
      <motion.div
        key={s.id}
        className="absolute bg-gradient-to-r from-transparent via-violet-300/60 to-transparent rounded-full"
        style={{ height: 2, width: s.width, top: `${s.y}%`, left: "-10%" }}
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: "130%", opacity: [0, s.opacity, s.opacity, 0] }}
        transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeIn" }}
      />
    ));
  }

  // ── Psychic ─────────────────────────────────────────────────────
  if (type === "psychic") {
    return (
      <>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-[-3px] rounded-xl border-2 border-pink-400/60"
          variants={psychicOrbitVariants as any}
          style={{ borderRadius: "inherit" }}
        />
        {/* Inner tilted ring */}
        <motion.div
          className="absolute inset-[4px] rounded-xl border border-fuchsia-300/40"
          variants={psychicOrbitVariants2 as any}
          style={{ borderRadius: "inherit" }}
        />
      </>
    );
  }

  // ── Bug ─────────────────────────────────────────────────────────
  if (type === "bug" && isHovered) {
    return (particles as BugParticle[]).map((b) => (
      <motion.div
        key={b.id}
        className="absolute rounded-full bg-lime-400"
        style={{ width: b.size, height: b.size, left: `${b.startX}%`, top: `${b.startY}%` }}
        initial={{ x: 0, y: 0, opacity: 0.9 }}
        animate={{
          x: [0, b.orbitX, -b.orbitX, b.orbitX, 0],
          y: [0, b.orbitY, b.orbitY, -b.orbitY, 0],
          opacity: [0.9, 0.7, 0.9, 0.7, 0.9],
        }}
        transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ));
  }

  // ── Rock ────────────────────────────────────────────────────────
  if (type === "rock" && isHovered) {
    return (particles as RockParticle[]).map((p) => (
      <motion.div
        key={p.id}
        className="absolute top-0 rounded-sm bg-yellow-800/80"
        style={{ width: p.size, height: p.size * 0.8, left: `${p.x}%` }}
        initial={{ y: -10, x: 0, opacity: 1, rotate: p.rotate }}
        animate={{ y: "110%", x: p.driftX, opacity: 0, rotate: p.rotate + 270 }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeIn" }}
      />
    ));
  }

  // ── Ghost ───────────────────────────────────────────────────────
  if (type === "ghost" && isHovered) {
    return (particles as GhostWisp[]).map((w) => (
      <motion.div
        key={w.id}
        className="absolute bottom-0 rounded-full bg-purple-500/30 blur-sm"
        style={{ width: w.size, height: w.size, left: `${w.x}%` }}
        initial={{ y: 0, x: 0, opacity: 0, scale: 1 }}
        animate={{
          y: -65,
          x: [0, w.drift, w.drift * -0.5, w.drift],
          opacity: [0, 0.7, 0.5, 0],
          scale: [1, 1.2, 0.9, 0.7],
        }}
        transition={{ duration: w.duration, delay: w.delay, repeat: Infinity, ease: "easeOut" }}
      />
    ));
  }

  // ── Dragon ──────────────────────────────────────────────────────
  if (type === "dragon") {
    return (
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/30 to-purple-600/0"
        variants={dragonShimmerVariants as any}
        style={{ width: "60%", height: "60%" }}
      />
    );
  }

  // ── Dark ────────────────────────────────────────────────────────
  if (type === "dark") {
    return (
      <>
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60"
          variants={darkOverlayVariants as any}
        />
        {darkCorners.map((corner, i) => (
          <motion.div
            key={i}
            className="absolute w-1/2 h-1/2 bg-gradient-to-br from-black/70 to-transparent"
            style={{
              top: (corner as any).top ?? undefined,
              left: (corner as any).left ?? undefined,
              right: (corner as any).right ?? undefined,
              bottom: (corner as any).bottom ?? undefined,
              transformOrigin: corner.origin,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
          />
        ))}
      </>
    );
  }

  // ── Steel ───────────────────────────────────────────────────────
  if (type === "steel") {
    return (
      <>
        {/* Chrome shine sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          variants={steelShineVariants as any}
          style={{ width: "40%", skewX: "-20deg" }}
        />
        {/* Sparkle dots */}
        {isHovered && (particles as SteelSparkle[]).map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-slate-200"
            style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: Math.random() * 0.6 }}
          />
        ))}
      </>
    );
  }

  // ── Fairy ───────────────────────────────────────────────────────
  if (type === "fairy" && isHovered) {
    return (particles as FairyParticle[]).map((p) => (
      <motion.div
        key={p.id}
        className="absolute bottom-0 text-pink-300 select-none leading-none"
        style={{ fontSize: p.size, left: `${p.x}%` }}
        initial={{ y: 0, x: 0, opacity: 1, rotate: p.rotate }}
        animate={{ y: -62, x: p.drift, opacity: 0, rotate: p.rotate + 360 }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
      >
        ✦
      </motion.div>
    ));
  }

  return null;
}
