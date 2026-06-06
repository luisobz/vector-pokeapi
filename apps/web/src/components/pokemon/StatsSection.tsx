import React from "react";
import { BarChart3 } from "lucide-react";
import StatsRadar from "./StatsRadar";
import StatBar from "./StatBar";
import { useTranslations } from "next-intl";

interface StatsSectionProps {
  stats: any; // We can use more specific type if imported
  className?: string;
}

export default function StatsSection({ stats, className = "" }: StatsSectionProps) {
  const t = useTranslations("PokemonDetail");

  const statItems = [
    { label: "HP", val: stats.hp, max: 150, color: "bg-emerald-500" },
    { label: "Ataque", val: stats.attack, max: 150, color: "bg-orange-500" },
    { label: "Defensa", val: stats.defense, max: 150, color: "bg-blue-500" },
    { label: "Ataque Especial", val: stats.spAtk, max: 150, color: "bg-purple-500" },
    { label: "Defensa Especial", val: stats.spDef, max: 150, color: "bg-pink-500" },
    { label: "Velocidad", val: stats.speed, max: 150, color: "bg-yellow-500" },
  ];

  return (
    <section className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <BarChart3 size={18} className="text-cyan-400" /> {t("baseStats")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Radar Chart */}
        <StatsRadar stats={stats} />

        {/* Numerical List */}
        <div className="space-y-3 p-5 rounded-2xl bg-zinc-950/20 border border-white/5">
          {statItems.map((item) => (
            <StatBar
              key={item.label}
              label={item.label}
              value={item.val}
              max={item.max}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
