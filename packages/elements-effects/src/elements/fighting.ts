// Fighting — expanding concentric shockwave rings from center
export const fightingContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(194, 46, 40, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 4px 24px rgba(194, 46, 40, 0.7), inset 0 0 14px rgba(255, 100, 60, 0.3)",
    borderColor: "#c22e28",
    transition: { duration: 0.3 },
  },
};

// Three rings staggered in time
export const fightingRingVariants = (delay = 0) => ({
  initial: { scale: 0.4, opacity: 0.8 },
  hover: {
    scale: [0.4, 1.6],
    opacity: [0.7, 0],
    transition: {
      duration: 0.9,
      delay,
      repeat: Infinity,
      repeatDelay: 0.1,
      ease: "easeOut",
    },
  },
});
