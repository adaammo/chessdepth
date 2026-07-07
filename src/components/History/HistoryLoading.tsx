"use client"
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export default function HistoryLoading({ username }: { username: string }) {
    const CHESS_FACTS = useMemo(() => {
        return ([
            "The queen was once a very weak piece, only able to move one square diagonally.",
            "There are more possible chess games (10^120) than atoms (10^82) in the observable universe.",
            "The Sicilian Defense is the most played and highest-scoring response to 1.e4 at grandmaster level.",
            "The longest chess game theoretically possible is 5,949 moves.",
            "The first chess computer program was written by Alan Turing in 1951 — by hand, since no computer could run it yet.",
            "Magnus Carlsen became a grandmaster at just 13 years old.",
            "Between July 31, 2018, and October 10, 2020, Carlsen played 125 consecutive classical games at the elite level without a single loss.",
            "The developer of this website starting playing chess this year, you can find his profile on @sspiidey!"
        ])
    }, []);

    const [factIndex, setFactIndex] = useState<number>(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setFactIndex(() => {
                return Math.floor(Math.random() * CHESS_FACTS.length);
            })
        }, 4000);
        return () => clearInterval(interval);
    }, [CHESS_FACTS])
    return (
        <div className="min-w-full min-h-screen flex items-center justify-center">
            <motion.div
                animate={{ opacity: [0.12, 0.20, 0.12] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, var(--accent) 0%, transparent 50%)",
                }}
            />
            <div className=" flex flex-col items-center justify-center rounded-md  gap-5 h-full w-1/2 lg:w-1/3">
                <div className="flex flex-col border-b border-(--border-subtle) pb-5 items-center justify-center min-w-full">
                    <span className="loading loading-spinner loading-xl" />
                    <p className="font-black text-2xl">
                        Loading {username}&apos;s games
                    </p>
                    <span className="text-(--text-muted) font-light">
                        This usually takes some time
                    </span>
                </div>
                <div className="flex flex-col gap-2 items-center justify-center w-full h-full">
                    <p className="uppercase tracking-widest text-(--text-muted) text-sm">
                        Did you know
                    </p>
                    <motion.p
                        key={CHESS_FACTS[factIndex]}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="text-(--text-secondary) tracking-wide text-md">
                        {CHESS_FACTS[factIndex]}
                    </motion.p>
                </div>
            </div>
        </div>
    )
}