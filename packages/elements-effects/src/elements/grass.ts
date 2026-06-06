// Grass — leaf particles floating upward with rotation and sideways drift
export const grassContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(122, 199, 76, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 6px 28px rgba(122, 199, 76, 0.65), inset 0 -6px 16px rgba(74, 222, 128, 0.3)",
    borderColor: "#7ac74c",
    transition: { duration: 0.3 },
  },
};

export interface GrassParticle {
  id: number;
  width: number;
  height: number;
  x: number;
  drift: number;
  rotate: number;
  rotateTo: number;
  delay: number;
  duration: number;
}

export const generateGrassParticles = (count = 10): GrassParticle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    width: Math.random() * 6 + 5,
    height: Math.random() * 3 + 2,
    x: Math.random() * 80 + 10,
    drift: (Math.random() - 0.5) * 40,
    rotate: Math.random() * 180,
    rotateTo: Math.random() * 360 + 180,
    delay: Math.random() * 1.0,
    duration: Math.random() * 0.9 + 1.1,
  }));
