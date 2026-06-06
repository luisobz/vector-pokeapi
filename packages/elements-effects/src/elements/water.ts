export const waterContainerVariants = {
  initial: { boxShadow: "0 0 0px rgba(59, 130, 246, 0)", borderColor: "transparent" },
  hover: {
    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.5), inset 0 -2px 10px rgba(147, 197, 253, 0.3)",
    borderColor: "#3b82f6",
    transition: { duration: 0.3 }
  }
};

export const waveVariants = {
  initial: { y: "100%", rotate: 0 },
  hover: {
    y: "40%",
    rotate: 360,
    transition: {
      y: { duration: 0.5, ease: "easeOut" },
      rotate: { repeat: Infinity, duration: 4, ease: "linear" }
    }
  }
};
