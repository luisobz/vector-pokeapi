// Electric — flickering yellow glow + sharp spark particles
export const electricContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(249, 212, 35, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow: [
      "0 0 16px rgba(249, 212, 35, 0.5), inset 0 0 10px rgba(253, 224, 71, 0.2)",
      "0 0 36px rgba(249, 212, 35, 0.95), inset 0 0 22px rgba(253, 224, 71, 0.45)",
      "0 0 20px rgba(249, 212, 35, 0.6), inset 0 0 12px rgba(253, 224, 71, 0.25)",
      "0 0 36px rgba(249, 212, 35, 0.95), inset 0 0 22px rgba(253, 224, 71, 0.45)",
    ],
    borderColor: "#f9d423",
    transition: {
      duration: 0.3,
      borderColor: { duration: 0.2 },
      boxShadow: { repeat: Infinity, duration: 0.55, ease: "easeInOut" },
    },
  },
};

export interface ElectricSpark {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export const generateElectricSparks = (count = 10): ElectricSpark[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    size: Math.random() * 3 + 2,
    delay: Math.random() * 0.6,
    duration: Math.random() * 0.25 + 0.15,
  }));
