import React from "react";
import { useTranslations } from "next-intl";

interface EmptyResultsProps {
  title?: string;
  description?: string;
}

export default function EmptyResults({ title, description }: EmptyResultsProps) {
  const t = useTranslations("SearchPage");

  return (
    <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-zinc-950/20 max-w-md mx-auto space-y-2">
      <span className="text-zinc-500 font-bold block">{title || t("noResults")}</span>
      <p className="text-zinc-600 text-xs">
        {description || t("noResultsDesc")}
      </p>
    </div>
  );
}
