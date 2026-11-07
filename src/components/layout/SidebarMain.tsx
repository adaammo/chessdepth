"use client"
import { Home } from "lucide-react";
import Logo from "../Logo";
import { useRouter } from "next/navigation";

export default function SidebarMain() {
    const router = useRouter();
    return (
        <aside className="flex flex-col bg-(--bg-primary) items-start border-r border-(--border-subtle) p-3 gap-2">
            <div className="border-b border-(--border-subtle) w-full p-2 flex justify-start">
                <Logo size = {"xl"}/>
            </div>
            <button 
            onClick = {() => router.push("/")}
            className="flex items-center gap-2 w-full rounded-md cursor-pointer p-2 text-[#e8e8e8] hover:bg-[#222] transition-colors">
                <Home size={20} className="text-[#e8d9b8]" />
                <span className=" text-lg font-medium">Home</span>
            </button>
        </aside>
    )
}