import { GamesDatabase } from "@/api/lib/types";
import { LoaderCircle } from "lucide-react";

type LoadingProgress = {
    completedMoves: number;
    totalPlies: number;
    currentFullMove: number;
    totalFullMoves: number;
    progress: number;
};

export default function ReviewLoadingSidebar({ game, ...loading }: { game: GamesDatabase } & LoadingProgress) {
    const rows = [
        { name: "Inhumane", color: "text-(--brilliant)", available: false },
        { name: "Exceptional", color: "text-(--accent-blue)", available: true },
        { name: "Best", color: "text-(--success)", available: true },
        { name: "Precise", color: "text-orange-500", available: true },
        { name: "Good", color: "text-(--text-secondary)", available: true },
        { name: "Confusing", color: "text-(--warning)", available: true },
        { name: "Incorrect", color: "text-orange-500", available: true },
        { name: "Throw", color: "text-(--danger)", available: true },
    ];

    return (
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-4" aria-busy="true">
            <LoadingProgressHeader {...loading} />

            <section className="flex flex-col gap-2" aria-label="Loading game accuracy">
                <p className="text-xs font-medium uppercase tracking-wide text-(--text-secondary)">Game Accuracy</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { username: game.white_username, side: "White" },
                        { username: game.black_username, side: "Black" },
                    ].map(({ username, side }) => (
                        <div key={side} className="flex flex-col gap-2 rounded-md border border-(--border-subtle) bg-(--bg-primary) p-4">
                            <div className="flex items-center justify-between gap-2 text-xs text-(--text-muted)">
                                <span className="min-w-0 truncate">{username}</span>
                                <span>{side}</span>
                            </div>
                            <LoadingBlock className="h-9 w-20 max-w-full" />
                            <LoadingBlock className="h-1.5 w-full" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-secondary)" aria-label="Loading move quality">
                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center gap-1 px-4 py-3 text-[11px] font-medium text-(--text-secondary)">
                    <span className="truncate">{game.white_username}</span>
                    <span className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">Move Quality</span>
                    <span className="truncate text-right">{game.black_username}</span>
                </div>
                {rows.map(({ name, color, available }) => (
                    <div key={name} className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                        {available ? <LoadingBlock className="h-4 w-6" /> : <span className="text-sm font-semibold">--</span>}
                        <span className={`text-center text-[14px] font-semibold tracking-[0.12em] ${color}`}>{name}</span>
                        <span className="flex justify-end">
                            {available ? <LoadingBlock className="h-4 w-6" /> : <span className="text-sm font-semibold">--</span>}
                        </span>
                    </div>
                ))}
            </section>
        </div>
    );
}

function LoadingBlock({ className }: { className: string }) {
    return <span aria-hidden="true" className={`skeleton block rounded-sm bg-(--bg-tertiary) ${className}`} />;
}


function LoadingProgressHeader({ completedMoves, totalPlies, currentFullMove, totalFullMoves, progress }: LoadingProgress) {
    const description = completedMoves === 0
        ? "Starting analysis"
        : completedMoves === totalPlies
            ? "Finishing review"
            : `Reviewing move ${currentFullMove} of ${totalFullMoves}`;

    return (
        <div className="rounded-lg border border-(--accent-muted) bg-(--bg-primary) px-4 py-3" role="status" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-(--accent)" aria-hidden="true" />
                    {description}
                </span>
                <span className="text-xs font-semibold tabular-nums text-(--accent)">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--bg-tertiary)" aria-hidden="true">
                <div className="h-full rounded-full bg-(--accent) transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}