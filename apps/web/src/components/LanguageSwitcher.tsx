'use client';

import { useLocale } from 'next-intl';
import { setUserLocale } from '../services/locale';
import { useState, useTransition } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    startTransition(() => {
      setUserLocale(nextLocale).then(() => {
        window.location.reload();
      });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="px-2.5 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 flex items-center gap-1.5 transition-all text-xs font-mono text-zinc-300"
      title="Cambiar idioma / Change language"
    >
      <Globe size={14} className={isPending ? "animate-spin" : ""} />
      <span className="hidden sm:inline">{locale.toUpperCase()}</span>
    </button>
  );
}
