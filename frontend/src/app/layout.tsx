import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManMitra — Your AI Companion for Mental Wellness",
  description: "An empathetic AI-powered wellness platform providing emotional support, mood tracking, private journals, and personalized routines.",
  keywords: ["mental health", "AI companion", "wellness routines", "mood tracking", "journaling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#090e0c] text-[#e6f0ed] antialiased">
        {children}
      </body>
    </html>
  );
}
