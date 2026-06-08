import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export default function BackButton({ href, onClick, label }: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations("PokemonDetail");

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
    >
      <ArrowLeft size={14} /> <span className="hidden sm:inline">{label || t("backButton")}</span>
    </button>
  );
}
