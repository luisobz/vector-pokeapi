import React from "react";
import { useTranslations } from "next-intl";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  const t = useTranslations("PokemonDetail");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-t-2 border-cyan-400 border-r-2 border-r-transparent rounded-full animate-spin" />
      <span className="text-zinc-500 text-xs font-mono">{message || t("loading")}</span>
    </div>
  );
}
