import React from "react";

interface FooterProps {
  t: any;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="w-full py-6 border-t border-white/5 bg-zinc-950/20 text-center text-xs text-zinc-600">
      <p>{t.footer}</p>
    </footer>
  );
}
