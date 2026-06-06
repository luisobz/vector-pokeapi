// Ground — dust/earth particles erupting outward from bottom
export const groundContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(226, 191, 101, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 6px 24px rgba(226, 191, 101, 0.65), inset 0 -8px 16px rgba(180, 120, 40, 0.4)",
    borderColor: "#e2bf65",
    transition: { duration: 0.3 },
  },
};

export interface GroundParticle {
  id: number;
  size: number;
  x: number;
  dirX: number;   // horizontal spread direction
  delay: number;
  duration: number;
}

export const generateGroundParticles = (count = 12): GroundParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 7 + 3,
    x: Math.random() * 70 + 15,
    dirX: (Math.random() - 0.5) * 50,
    delay: Math.random() * 0.5,
    duration: Math.random() * 0.5 + 0.5,
  }));
