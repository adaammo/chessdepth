"use client"
import { ReadJobStatus } from "@/src/lib/services/analyze";
import { useEffect, useState } from "react";
import HistoryLoading from "./HistoryLoading";
import { AnalysisReport } from "@/src/lib/services/types";
import HistoryErrorPage from "./HistoryErrorPage";
import { motion } from "motion/react";

export default function MainHistoryPage({ slug, uuid }: { slug: string, uuid: string }) {
    const [status, setStatus] = useState<"completed" | "processing" | "queued" | "not_found" | "failed" | null>("queued");
    const [result, setResult] = useState<AnalysisReport | null>(null);
    useEffect(() => {
        const interval = setInterval(async () => {
            // accurate to the the wya it was set in redis, MUST NEVER BE CHANGED
            const trueJobId = `analysis:${slug}:${uuid}`;

            const response = await ReadJobStatus(trueJobId);
            setStatus(response.status);
            if (response.status === "completed") {
                setResult(response.result);
                clearInterval(interval);
            }
            if (response.status === "not_found" || response.status === "failed") {
                clearInterval(interval);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [slug, uuid]);
    if (status === "queued" || status === "processing") {
        return <HistoryLoading status={status} username={slug} />
    }
    if (status === "completed") {
        return (
            <div className="flex min-h-screen w-screen">
                <div className=" flex flex-col items-start justify-center w-full gap-5 mx-32.5 mt-18.75">
                    {result?.openings.map((data) => {
                        const color = ColorSelector(data.scorePercent);
                        const progressBg = BackgroundPercentageBar(data.scorePercent);
                        const stringKey: string[] = data.gameIds;
                        return (
                            <div
                                key={data.openingName}
                                className="flex flex-col items-start justify-start w-full gap-3  p-4 bg-(--bg-secondary) border border-(--border-subtle) rounded-md">
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-row justify-between w-full items-start">
                                        <div className="flex flex-col gap-1">
                                            <h1 className="font-black text-2xl tracking-[-0.045em]">
                                                {data.openingName === "Unknown-Opening" ? "Unknown Openings" : data.openingName}
                                            </h1>
                                            <p className="text-(--text-secondary) text-light">
                                                {data.games} games played
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-center text-xl justify-center">
                                            <p className={`${color} font-black tracking-wide`}>
                                                {data.scorePercent}%
                                            </p>
                                            <p className="text-(--text-muted) font-light tracking-wide text-[15px]">
                                                accuracy
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div
                                        className="w-full h-2 bg-(--bg-tertiary) rounded-full"
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${data.scorePercent}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`${progressBg} h-2 rounded-full`}
                                        />
                                    </motion.div>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    {stringKey.map((s, i) => {
                                        const bg = i % 2 === 0 ? "bg-(--bg-secondary)" : "bg-(--bg-tertiary)"
                                        const game = result.games[s];
                                        return (
                                            <div
                                                key={game.url}
                                                className={`flex flex-row items-start justify-between ${bg} p-3 rounded-md`}>
                                                    {game.openingName}{game.openingVariation.length >= 1 && `: ${game.openingVariation}` }
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            </div>
        )
    }

    if (status === "failed" || status === "not_found") {
        return (
            <HistoryErrorPage />
        )
    }
    return null;
}

function ColorSelector(percentage: number): string {
    if (percentage >= 50) {
        return "text-(--success)"
    }
    if (percentage >= 30) {
        return "text-(--warning)"
    }
    return "text-(--danger)"
}
function BackgroundPercentageBar(percentage: number): string {
    if (percentage >= 50) {
        return "bg-(--success)"
    }
    if (percentage >= 30) {
        return "bg-(--warning)"
    }
    return "bg-(--danger)"
}