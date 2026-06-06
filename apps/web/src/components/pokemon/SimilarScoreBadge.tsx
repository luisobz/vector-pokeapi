import React from "react";

interface SimilarScoreBadgeProps {
  score: number;
}

export default function SimilarScoreBadge({ score }: SimilarScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "bg-emerald-500 text-emerald-400 border-emerald-500/20";
    if (score >= 0.65) return "bg-cyan-500 text-cyan-400 border-cyan-500/20";
    return "bg-purple-500 text-purple-400 border-purple-500/20";
  };

  return (
    <div className="text-right space-y-1 min-w-[70px]">
      <span className="text-[10px] font-mono font-bold block text-zinc-400">
        {(score * 100).toFixed(1)}%
      </span>
      <div className="w-16 h-1 bg-zinc-850 rounded-full overflow-hidden ml-auto">
        <div
          className={`h-full rounded-full ${getScoreColor(score)}`}
          style={{ width: `${Math.min(score * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
