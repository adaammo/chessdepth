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
        <div className="grid min-h-screen w-full bg-(--bg-primary)">
            {/** fix later */}
            {/** <SidebarMain /> */}
            <main className="w-screen">
                {children}
            </main>
        </div>
    )
}
