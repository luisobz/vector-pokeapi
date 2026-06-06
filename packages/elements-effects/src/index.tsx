"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { fireContainerVariants, generateFireParticles } from "./elements/fire";
import { waterContainerVariants, waveVariants } from "./elements/water";

export type ElementType = "fire" | "water" | "normal";

interface ElementEffectProps {
  type: ElementType;
  children: React.ReactNode;
}

export const ElementEffect: React.FC<ElementEffectProps> = ({ type, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [fireParticles] = useState(() => generateFireParticles(8));

  const getContainerVariants = () => {
    if (type === "fire") return fireContainerVariants;
    if (type === "water") return waterContainerVariants;
    return { initial: {}, hover: {} };
  };

  return (
    <motion.div
      className="relative inline-flex overflow-hidden rounded-xl border border-transparent transition-colors duration-300"
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={getContainerVariants()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ isolation: "isolate" }}
    >
      {type === "fire" && isHovered && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {fireParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bottom-0 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400 mix-blend-screen"
              style={{ width: p.size, height: p.size, left: `${p.x}%` }}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -40, opacity: 0, scale: 0.2 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {type === "water" && (
        <motion.div
          className="absolute inset-0 pointer-events-none bg-blue-600/20 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="absolute bg-gradient-to-t from-blue-500/50 to-cyan-400/40 w-[200%] h-[200%] left-[-50%]"
            style={{ borderRadius: "43%" }}
            variants={waveVariants as any}
          />
        </motion.div>
      )}

      <div className="relative z-10 w-full h-full bg-transparent">
        {children}
      </div>
    </motion.div>
  );
};
