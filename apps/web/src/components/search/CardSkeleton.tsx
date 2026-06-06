import React from "react";

export default function CardSkeleton() {
  return (
    <div className="w-72 h-[420px] rounded-2xl border border-white/5 bg-zinc-900/20 animate-pulse flex flex-col justify-between p-4">
      <div className="space-y-2">
        <div className="w-16 h-3 bg-zinc-850 rounded" />
        <div className="w-32 h-6 bg-zinc-850 rounded" />
      </div>
      <div className="w-40 h-40 rounded-full bg-zinc-850/50 mx-auto" />
      <div className="space-y-2">
        <div className="w-24 h-5 bg-zinc-850 rounded-full" />
        <div className="w-full h-12 bg-zinc-850 rounded" />
      </div>
    </div>
  );
}
