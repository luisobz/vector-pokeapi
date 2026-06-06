// Psychic — rotating orbital ring + pulsing concentric glow
export const psychicContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(249, 85, 135, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow: [
      "0 0 18px rgba(249, 85, 135, 0.5), inset 0 0 12px rgba(255, 120, 180, 0.2)",
      "0 0 32px rgba(249, 85, 135, 0.85), inset 0 0 20px rgba(255, 120, 180, 0.4)",
      "0 0 18px rgba(249, 85, 135, 0.5), inset 0 0 12px rgba(255, 120, 180, 0.2)",
    ],
    borderColor: "#f95587",
    transition: {
      duration: 0.3,
      borderColor: { duration: 0.2 },
      boxShadow: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
    },
  },
};

export const psychicOrbitVariants = {
  initial: { rotate: 0, scaleX: 1, opacity: 0 },
  hover: {
    rotate: 360,
    opacity: 1,
    transition: {
      rotate: { repeat: Infinity, duration: 2.5, ease: "linear" },
      opacity: { duration: 0.3 },
    },
  },
};

export const psychicOrbitVariants2 = {
  initial: { rotate: 60, scaleX: 0.6, opacity: 0 },
  hover: {
    rotate: -300,
    opacity: 0.7,
    transition: {
      rotate: { repeat: Infinity, duration: 3.5, ease: "linear" },
      opacity: { duration: 0.3 },
    },
  },
};
