import { GamesAPIResponse } from "@/api/lib/types";
import { AnimatePresence, motion, easeInOut } from "framer-motion";
import { ChevronRight, ChevronsDown } from "lucide-react";
import { GamesPopUp } from "./MainHistoryPage";
import SideBarGamesLoading from "./SideBarGamesLoading";
import GamesSection from "./GamesSection";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

type GameSideBarProps = {
    isPending: boolean;
    gamesPopUp: GamesPopUp | null;
    games: GamesAPIResponse | null;
    setGamesPopUp: (p: GamesPopUp | null) => void;
    setStatus: Dispatch<SetStateAction<"completed" | "failed" | "not_found" | "processing" | "queued" | null>>;
    side: "white" | "black";
    username: string;
    setGamesCache: React.Dispatch<
        React.SetStateAction<Map<string, GamesAPIResponse> | null>
    >
    setGames: Dispatch<SetStateAction<GamesAPIResponse | null>>;
}
export default function GameSideBar({ isPending, gamesPopUp, setGamesPopUp, side, games, username, setStatus, setGamesCache, setGames }: GameSideBarProps) {
    const gamesLength = games?.games.length;
    return (
        <AnimatePresence>
            {gamesPopUp && (
                <motion.div
                    initial={{ opacity: 0.3, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.24, ease: easeInOut }}
                    className="w-screen inset-0 h-screen items-center fixed justify-end flex z-50 overscroll-contain"
                    onClick={() => setGamesPopUp(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="flex flex-col z-50 lg:w-1/2 w-screen min-h-screen max-h-screen bg-(--bg-secondary) shadow-black shadow-xs border border-(--accent-muted) overscroll-contain rounded-lg">
                        <div className="flex flex-col border-b border-(--accent-muted) gap-1 px-5 py-3 items-start justify-center bg-[radial-gradient(circle_at_-55%_-25%,var(--accent-muted),transparent_72%)]">
                            <div className="w-full flex flex-row justify-between items-center">
                                <p className="text-2xl font-semibold">
                                    {gamesPopUp.opening_name}
                                </p>
                                <button
                                    onClick={() => setGamesPopUp(null)}
                                    className="h-7 w-7 rounded-md bg-(--bg-tertiary) border border-(--accent-muted) font-black hover:opacity-75 duration-300 cursor-pointer">
                                    x
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 items-start justify-center">
                                <div className="flex flex-row gap-1 items-center justify-center text-sm font-semibold">
                                    <span className="text-(--success)">
                                        {gamesPopUp.wins}W
                                    </span>
                                    <span>
                                        {gamesPopUp.draws}D
                                    </span>
                                    <span className="text-(--danger)">
                                        {gamesPopUp.losses}L
                                    </span>
                                    <span className="">
                                        as {side}
                                    </span>
                                </div>
                                <p className="text-sm text-(--text-muted) tracking-wide">
                                    Showing {gamesLength} of {gamesPopUp.wins + gamesPopUp.draws + gamesPopUp.losses} games
                                </p>
                            </div>
                        </div>
                        {isPending ? (
                            <SideBarGamesLoading />
                        ) : games && (
                            <GamesSection
                                games={games}
                                side={side}
                                opening={gamesPopUp.opening_name}
                                username={username}
                                setStatus={setStatus}
                                setGamesCache={setGamesCache}
                                setGames={setGames}
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
