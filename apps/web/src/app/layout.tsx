import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Pokédex Semántica — v2.0",
  description:
    "Buscador de Pokémon potenciado por inteligencia artificial y emparejamientos vectoriales semánticos usando Qwen3-Embedding.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Cast messages to any for typing if not using global types, or just access safely
  const t = messages.Layout;

  return (
    <html lang={locale} className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header t={t} />

          {/* Page Content */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <Footer t={t} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
