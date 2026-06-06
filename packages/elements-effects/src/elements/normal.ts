// Normal — subtle metallic shimmer sweep
export const normalContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(168, 167, 122, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 0 22px rgba(168, 167, 122, 0.5), inset 0 0 18px rgba(255, 255, 255, 0.1)",
    borderColor: "#a8a77a",
    transition: { duration: 0.35 },
  },
};

export const normalShimmerVariants = {
  initial: { x: "-120%", opacity: 0 },
  hover: {
    x: "320%",
    opacity: [0, 0.55, 0.55, 0],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      repeatDelay: 1.0,
      ease: "easeInOut",
    },
  },
};
