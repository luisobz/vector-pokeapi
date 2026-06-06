// Water — rising wave + floating bubble particles
export const waterContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 6px 28px rgba(59, 130, 246, 0.65), inset 0 -6px 16px rgba(147, 197, 253, 0.4)",
    borderColor: "#60a5fa",
    transition: { duration: 0.3 },
  },
};

export const waveVariants = {
  initial: { y: "100%", rotate: 0 },
  hover: {
    y: "28%",
    rotate: 360,
    transition: {
      y: { duration: 0.55, ease: "easeOut" },
      rotate: { repeat: Infinity, duration: 5, ease: "linear" },
    },
  },
};

export interface WaterBubble {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
}

export const generateWaterBubbles = (count = 7): WaterBubble[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    x: Math.random() * 80 + 10,
    delay: Math.random() * 1.2,
    duration: Math.random() * 0.9 + 1.0,
  }));
