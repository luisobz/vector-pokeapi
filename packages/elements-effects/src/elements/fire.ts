export const fireContainerVariants = {
  initial: { boxShadow: "0 0 0px rgba(239, 68, 68, 0)", borderColor: "transparent" },
  hover: {
    boxShadow: "0 4px 20px rgba(239, 68, 68, 0.6), inset 0 -4px 12px rgba(249, 115, 22, 0.4)",
    borderColor: "#ef4444",
    transition: { duration: 0.3 }
  }
};

export const generateFireParticles = (count = 6) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    x: Math.random() * 80 + 10,
    delay: Math.random() * 0.4,
    duration: Math.random() * 0.6 + 0.6
  }));
};
