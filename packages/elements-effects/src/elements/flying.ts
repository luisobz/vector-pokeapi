// Flying — wind streaks sweeping left-to-right at varying heights
export const flyingContainerVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(169, 143, 243, 0)",
    borderColor: "transparent",
  },
  hover: {
    boxShadow:
      "0 -4px 26px rgba(169, 143, 243, 0.6), inset 0 4px 16px rgba(200, 180, 255, 0.25)",
    borderColor: "#a98ff3",
    transition: { duration: 0.3 },
  },
};

export interface WindStreak {
  id: number;
  y: number;         // vertical position %
  width: number;     // streak length px
  opacity: number;
  delay: number;
  duration: number;
}

export const generateWindStreaks = (count = 8): WindStreak[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    y: Math.random() * 80 + 10,
    width: Math.random() * 30 + 20,
    opacity: Math.random() * 0.4 + 0.2,
    delay: Math.random() * 0.8,
    duration: Math.random() * 0.4 + 0.4,
  }));
