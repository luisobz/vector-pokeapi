// Poison — purple toxic bubbles rising from below
export const poisonContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(163, 62, 161, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 4px 26px rgba(163, 62, 161, 0.7), inset 0 -6px 18px rgba(100, 60, 180, 0.35)",
    borderColor: "#a33ea1",
    transition: { duration: 0.3 },
  },
};

export interface PoisonBubble {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  wobble: number;
}

export const generatePoisonBubbles = (count = 9): PoisonBubble[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 78 + 11,
    delay: Math.random() * 1.0,
    duration: Math.random() * 0.8 + 1.2,
    wobble: (Math.random() - 0.5) * 16,
  }));
