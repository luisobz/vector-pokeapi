import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  errorMessage: string;
  onBack?: () => void;
}

export default function ErrorState({ errorMessage, onBack }: ErrorStateProps) {
  const t = useTranslations("PokemonDetail");
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="text-center py-16 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-red-400">{t("errorTitle")}</h2>
      <p className="text-zinc-400 text-sm">{errorMessage || t("errorDefault")}</p>
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white hover:bg-zinc-800 transition-all"
      >
        <ArrowLeft size={14} /> {t("backButton")}
      </button>
    </div>
  );
}
