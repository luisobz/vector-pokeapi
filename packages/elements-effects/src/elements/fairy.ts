// Fairy — glittery pink/white star sparkles floating upward
export const fairyContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(214, 133, 173, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow: [
      "0 0 20px rgba(214, 133, 173, 0.55), inset 0 0 14px rgba(255, 200, 230, 0.2)",
      "0 0 34px rgba(214, 133, 173, 0.85), inset 0 0 22px rgba(255, 200, 230, 0.4)",
      "0 0 20px rgba(214, 133, 173, 0.55), inset 0 0 14px rgba(255, 200, 230, 0.2)",
    ],
    borderColor: "#d685ad",
    transition: {
      duration: 0.35,
      borderColor: { duration: 0.25 },
      boxShadow: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
    },
  },
};

export interface FairyParticle {
  id: number;
  size: number;
  x: number;
  drift: number;
  delay: number;
  duration: number;
  rotate: number;
}

export const generateFairyParticles = (count = 12): FairyParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 5 + 3,
    x: Math.random() * 82 + 9,
    drift: (Math.random() - 0.5) * 28,
    delay: Math.random() * 1.0,
    duration: Math.random() * 0.8 + 1.0,
    rotate: Math.random() * 360,
  }));
