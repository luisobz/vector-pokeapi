import React from "react";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export default function StatBar({ label, value, max, color }: StatBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-white">{value}</span>
      </div>
      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
