import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import { buildPath } from "@/lib/routes";

interface HeaderProps {
  t: any;
}

export default function Header({ t }: HeaderProps) {
  return (
    <header className="sticky top-0 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={buildPath('ROOT')} className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Sparkles size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-xl font-black tracking-tight text-glow bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {t.headerLogoPrefix}<span className="text-cyan-400 font-light ml-1">{t.headerLogoSuffix}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
