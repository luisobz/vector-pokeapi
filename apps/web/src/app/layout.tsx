import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pokédex Semántica — v2.0",
  description:
    "Buscador de Pokémon potenciado por inteligencia artificial y emparejamientos vectoriales semánticos usando Qwen3-Embedding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Glowing header */}
        <header className="sticky top-0 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-glow bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                POKÉDEX<span className="text-cyan-400 font-light ml-1">SEMÁNTICA</span>
              </span>
            </Link>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="px-2.5 py-1 rounded-full border border-white/5 bg-white/2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                v2.0 Qwen Embedding
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-6 border-t border-white/5 bg-zinc-950/20 text-center text-xs text-zinc-600">
          <p>© 2026 Pokédex Semántica. Construido con Next.js + Fastify + pgvector.</p>
        </footer>
      </body>
    </html>
  );
}
