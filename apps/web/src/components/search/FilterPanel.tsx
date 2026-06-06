import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPanelProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export default function FilterPanel({ isOpen, children }: FilterPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border border-white/5 rounded-xl bg-zinc-950/40 backdrop-blur-md p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
