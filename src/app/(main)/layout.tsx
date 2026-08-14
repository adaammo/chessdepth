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
        <div className="grid min-h-screen w-full grid-cols-[170px_minmax(0,1fr)] bg-(--bg-primary)">
            <SidebarMain /> 
            <main className="min-w-0">
                {children}
            </main>
        </div>
    )
}
