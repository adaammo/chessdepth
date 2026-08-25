"use client"
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import BlunderSvg from "../BlunderSvg";

export default function HistoryErrorPage({ errorMsg }: { errorMsg: string | null | undefined }) {
    const router = useRouter();
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <motion.div
                animate={{ opacity: [0.12, 0.20, 0.12] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, var(--danger) 0%, transparent 50%)",
                }}
            />
            <div className="flex flex-col items-center justify-center gap-2 text-center text-wrap">
                <BlunderSvg />
                {errorMsg ? (
                    <p className="text-(--text-accent) font-black tracking-widest text-wrap max-w-1/2">
                        {errorMsg}
                    </p>
                ) : (
                    <>
                        <p className="text-(--text-muted) font-black uppercase tracking-widest">
                            Something went wrong
                        </p>
                        <p className='text-(--accent) font-bold text-sm'>
                            We couldn&apos;t find anything to display. Please go back to the search page, and try again.
                        </p>
                        <p className="text-sm text-(--text-muted)">
                            Either this user does not exist, chess.com&apos;s API is down, or this search is out of date.
                        </p>
                    </>
                )}

                <button
                    onClick={() => router.push("/")}
                    className="w-1/2 flex flex-row items-center justify-center gap-1 py-2 border border-(--accent) bg-(--accent-muted)  hover:bg-(--button-hover)/30 duration-300 cursor-pointer font-bold rounded-md">
                    Try Again
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}