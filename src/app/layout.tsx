import type { Metadata } from "next";
import { Geist, } from "next/font/google";
import "./globals.css";
import SidebarMain from "../components/layout/SidebarMain";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "ChessDepth",
  description: "ChessDepth gives free chess.com premium features such as game analysis and opening winrates. Powered by Stockfish 18.",
  icons: {
    icon: "/squares-chessdepth.svg"
  }
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.className} bg-(--bg-primary)`}
    >
      <body className = "h-full antialiased bg-(--bg-primary) text-(--text-primary) max-w-screen">
        {children}
      </body>
    </html>
  );
}
