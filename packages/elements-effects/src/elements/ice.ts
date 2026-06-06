// Ice — frost crystallizing from edges + falling snowflake particles
export const iceContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(144, 224, 239, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 0 28px rgba(144, 224, 239, 0.7), inset 0 4px 18px rgba(186, 240, 253, 0.35)",
    borderColor: "#90e0ef",
    transition: { duration: 0.4 },
  },
};

export const frostOverlayVariants = {
  initial: { opacity: 0, scale: 1.05 },
  hover: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export interface IceParticle {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  rotate: number;
}

export const generateIceParticles = (count = 9): IceParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    x: Math.random() * 80 + 10,
    delay: Math.random() * 1.2,
    duration: Math.random() * 1.0 + 1.5,
    rotate: Math.random() * 360,
  }));
