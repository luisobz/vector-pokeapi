import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FilterPanel({ isOpen, onClose, children }: FilterPanelProps) {
  const isMobile = useIsMobile();
  // Prevent scroll when open only on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
          />
          {/* Panel */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-zinc-950 p-6 rounded-t-2xl border-t border-white/10 sm:relative sm:border sm:rounded-xl sm:bg-zinc-950/40 sm:backdrop-blur-md sm:p-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:!translate-y-0"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="flex justify-between items-center mb-6 sm:hidden">
              <h3 className="text-lg font-bold text-white">Filtros</h3>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col sm:contents gap-6 sm:gap-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
