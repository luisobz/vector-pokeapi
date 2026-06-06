// Rock — pebble/debris particles tumbling downward with rotation
export const rockContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(182, 161, 54, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 6px 24px rgba(182, 161, 54, 0.65), inset 0 -4px 14px rgba(160, 140, 50, 0.35)",
    borderColor: "#b6a136",
    transition: { duration: 0.3 },
  },
};

export interface RockParticle {
  id: number;
  size: number;
  x: number;
  driftX: number;
  rotate: number;
  delay: number;
  duration: number;
}

export const generateRockParticles = (count = 9): RockParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 7 + 4,
    x: Math.random() * 80 + 10,
    driftX: (Math.random() - 0.5) * 24,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.6,
    duration: Math.random() * 0.5 + 0.7,
  }));
