// Steel — metallic chrome shine sweep + sparkling dots
export const steelContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(183, 183, 206, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 0 26px rgba(183, 183, 206, 0.7), inset 0 0 20px rgba(220, 225, 240, 0.3)",
    borderColor: "#b7b7ce",
    transition: { duration: 0.3 },
  },
};

export const steelShineVariants = {
  initial: { x: "-150%", skewX: -20, opacity: 0 },
  hover: {
    x: "300%",
    opacity: [0, 0.7, 0.7, 0],
    transition: {
      duration: 1.1,
      repeat: Infinity,
      repeatDelay: 1.2,
      ease: "easeInOut",
    },
  },
};

export interface SteelSparkle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export const generateSteelSparkles = (count = 10): SteelSparkle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 2,
    x: Math.random() * 85 + 7,
    y: Math.random() * 85 + 7,
    delay: Math.random() * 1.0,
    duration: Math.random() * 0.4 + 0.3,
  }));
