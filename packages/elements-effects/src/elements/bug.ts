// Bug — tiny swarming particles orbiting in random tight paths
export const bugContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(166, 185, 26, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 4px 20px rgba(166, 185, 26, 0.65), inset 0 0 12px rgba(200, 220, 40, 0.25)",
    borderColor: "#a6b91a",
    transition: { duration: 0.3 },
  },
};

export interface BugParticle {
  id: number;
  size: number;
  startX: number;
  startY: number;
  orbitX: number;
  orbitY: number;
  delay: number;
  duration: number;
}

export const generateBugParticles = (count = 10): BugParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 2,
    startX: Math.random() * 80 + 10,
    startY: Math.random() * 80 + 10,
    orbitX: (Math.random() - 0.5) * 20,
    orbitY: (Math.random() - 0.5) * 20,
    delay: Math.random() * 0.8,
    duration: Math.random() * 0.4 + 0.4,
  }));
