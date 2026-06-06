
// Dragon — deep aura cycling blue↔indigo with diagonal scale shimmer
export const dragonContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(111, 53, 252, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow: [
      "0 0 24px rgba(111, 53, 252, 0.65), inset 0 0 18px rgba(60, 100, 255, 0.3)",
      "0 0 38px rgba(30, 100, 255, 0.8), inset 0 0 28px rgba(111, 53, 252, 0.45)",
      "0 0 24px rgba(111, 53, 252, 0.65), inset 0 0 18px rgba(60, 100, 255, 0.3)",
    ],
    borderColor: "#6f35fc",
    transition: {
      duration: 0.4,
      borderColor: { duration: 0.3 },
      boxShadow: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
    },
  },
};

export const dragonShimmerVariants = {
  initial: { x: "-120%", y: "-120%", opacity: 0 },
  hover: {
    x: "220%",
    y: "220%",
    opacity: [0, 0.45, 0.45, 0],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      repeatDelay: 0.6,
      ease: "easeInOut",
    },
  },
};
