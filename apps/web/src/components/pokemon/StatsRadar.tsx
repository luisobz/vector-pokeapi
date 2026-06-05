"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { PokemonStats } from "@vector-pokeapi/shared-types";

interface RadarChartProps {
  stats: PokemonStats;
  className?: string;
  primaryColor?: string; // Hex color for the fill/stroke
}

export default function StatsRadar({ stats, className, primaryColor = "#06b6d4" }: RadarChartProps) {
  // Convert stats to Recharts format
  const data = [
    { name: "HP", value: stats.hp },
    { name: "Ataque", value: stats.attack },
    { name: "Defensa", value: stats.defense },
    { name: "Velocidad", value: stats.speed },
    { name: "Def. Esp", value: stats.spDef },
    { name: "Atq. Esp", value: stats.spAtk },
  ];

  return (
    <div className="w-full h-72 flex justify-center items-center rounded-2xl bg-zinc-950/40 border border-white/5 p-4 backdrop-blur-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: "bold" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fill: "#52525b", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.25}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
