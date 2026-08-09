import { Geist, } from "next/font/google";
import "../globals.css";
import SidebarMain from "@/src/components/layout/SidebarMain";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.className} h-full antialiased bg-(--bg-primary) text-(--text-primary) max-w-screen`}
    >
      <body className="min-h-full grid grid-cols-[170px_1fr]">
        <SidebarMain/>
        {children}
      </body>
    </html>
  );
}
