// Fire — rising ember particles with horizontal drift
export const fireContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(239, 68, 68, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 6px 32px rgba(239, 68, 68, 0.75), inset 0 -8px 22px rgba(249, 115, 22, 0.55)",
    borderColor: "#f97316",
    transition: { duration: 0.3 },
  },
};

export interface FireParticle {
  id: number;
  size: number;
  x: number;
  drift: number;
  delay: number;
  duration: number;
}

export const generateFireParticles = (count = 12): FireParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 9 + 4,
    x: Math.random() * 82 + 9,
    drift: (Math.random() - 0.5) * 22,
    delay: Math.random() * 0.65,
    duration: Math.random() * 0.7 + 0.55,
  }));
