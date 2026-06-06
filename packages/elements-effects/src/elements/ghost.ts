// Ghost — ethereal wisps materialising, drifting, and fading out
export const ghostContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(115, 87, 151, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow: [
      "0 0 18px rgba(115, 87, 151, 0.5), inset 0 0 14px rgba(160, 100, 220, 0.2)",
      "0 0 30px rgba(115, 87, 151, 0.8), inset 0 0 22px rgba(160, 100, 220, 0.4)",
      "0 0 18px rgba(115, 87, 151, 0.5), inset 0 0 14px rgba(160, 100, 220, 0.2)",
    ],
    borderColor: "#735797",
    transition: {
      duration: 0.4,
      borderColor: { duration: 0.3 },
      boxShadow: { repeat: Infinity, duration: 2.0, ease: "easeInOut" },
    },
  },
};

export interface GhostWisp {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  drift: number;
}

export const generateGhostWisps = (count = 7): GhostWisp[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 14 + 8,
    x: Math.random() * 75 + 12,
    delay: Math.random() * 1.2,
    duration: Math.random() * 1.0 + 1.5,
    drift: (Math.random() - 0.5) * 18,
  }));
