import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function SearchHero() {
  const t = useTranslations("SearchPage");

  return (
    <section className="text-center max-w-2xl mx-auto space-y-4 my-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wider uppercase"
      >
        <Sparkles size={12} className="animate-spin" style={{ animationDuration: "3s" }} /> {t("hnswBadge")}
      </motion.div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
        {t("heroTitle1")} <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t("heroTitleHighlight")}</span>
      </h1>

      <p className="text-zinc-400 text-sm sm:text-base font-medium">
        {t("heroSubtitle")}
      </p>
    </section>
  );
}
