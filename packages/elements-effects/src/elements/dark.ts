// Dark — shadow tendrils crawling inward from the corners
export const darkContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(116, 87, 70, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 0 28px rgba(20, 10, 40, 0.9), inset 0 0 24px rgba(10, 5, 30, 0.7)",
    borderColor: "#745746",
    transition: { duration: 0.4 },
  },
};

export const darkOverlayVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: [0, 0.6, 0.35, 0.6],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Corner shadow elements — positions for 4 corners
export const darkCorners = [
  { top: 0, left: 0, origin: "top left" },
  { top: 0, right: 0, origin: "top right" },
  { bottom: 0, left: 0, origin: "bottom left" },
  { bottom: 0, right: 0, origin: "bottom right" },
] as const;
