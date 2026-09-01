"use server"
import axios, { isAxiosError } from "axios"
import { AnalysisReport, AnalyzeControllerResponse, OpeningExplorerMastersResponse } from "./types";
import { GamesAPIResponse, ProfileDatabase } from "@/api/lib/types";

export async function PostChessUsername(username: string):
    Promise<{ status: "processing" | "added", msg: string, username: string, uuid: string, statusCode: number } | { status: "completed", username: string, uuid: string, result: AnalysisReport } | { status: "failed", failedReason: string, statusCode: number }> {
    const api_key = process.env.API_KEY ?? ""
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analyze`
    try {
        const res = await axios.post<AnalyzeControllerResponse>(url, { username: username }, {
            headers: {
                "x-api-key": api_key
            }
        });
        const message = res.data.status === "completed" ? "Game history analyzed" : res.data.status === "processing" ? "Analyzing..." : "Username found! Processing games";
        const status = res.data.status;
        if (status === "added") {
            return {
                status,
                msg: message,
                username: res.data.username,
                uuid: res.data.uuid,
                statusCode: 200
            }
        }
        if (status === "completed") {
            return {
                status,
                username: res.data.username,
                uuid: res.data.uuid,
                result: res.data.result
            }
        }
        return {
            status,
            msg: message,
            username: res.data.username,
            uuid: res.data.uuid,
            statusCode: 200
        }
    }
    catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status;
            const msg = error.response?.data.failedReason
            return { status: "failed", failedReason: msg ?? "Server is not communicating.", statusCode: status ?? 500 }
        }
    }
    return {
        status: "failed",
        failedReason: "Something went wrong...",
        statusCode: 503
    }
}
export async function ReadJobStatus(jobId: string):
    Promise<{ status: "completed", result: AnalysisReport } | { status: "processing" | "queued" } | { status: "failed" | "not_found", reason: string }> {
    try {
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/jobs/${encodeURIComponent(jobId)}`
        const response = await axios.get<{ status: "processing" | "queued" } | { status: "completed", result: AnalysisReport }>(url,
            {
                headers: {
                    "x-api-key": api_key
                }
            })

        if (response.data.status === "processing" || response.data.status === "queued") {
            return {
                status: response.data.status,
            };
        }
        if (response.data.status === "completed") {
            return { status: response.data.status, result: response.data.result }
        }
    }
    catch (error) {
        if (isAxiosError<{ status: "failed" | "not_found", reason: string }>(error)) {
            const error_code = error.response?.status;
            console.log(error.response?.data);
            const msg = error.response?.data.reason ?? "We couldn't find anything to display. Please go back to the search page, and try again. Either this user does not exist, chess.com's API is down, or this search is out of date."
            if (error_code === 404) {
                return {
                    status: "not_found",
                    reason: msg
                }
            }
        }
    }
    return {
        status: "failed",
        reason: "We couldn't find anything to display. Please go back to the search page, and try again. Either this user does not exist, chess.com's API is down, or this search is out of date."
    }
}
export async function chessProfile(username: string): Promise<{ status: "completed", profile: ProfileDatabase } | { status: "failed" | "not_found" }> {
    try {
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/jobs/profile/${encodeURIComponent(username)}`
        const response = await axios.get<{ status: "completed", profile: ProfileDatabase }>(url,
            {
                headers: {
                    "x-api-key": api_key
                },
            })
        return { status: "completed", profile: response.data.profile };
    }
    catch (error) {
        if (isAxiosError<{ error: string }>(error)) {
            console.log("");
            const error_code = error.response?.status;
            if (error_code === 401) {
                return {
                    status: "not_found"
                }
            }
        }
    }
    return {
        status: "failed"
    }
}
export async function getOpeningGames(offset: string, opening: string, side: "white" | "black", username: string):
    Promise<{ status: "completed", profile: GamesAPIResponse } | { status: "failed" | "not_found" }> {
    try {
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(opening)}/${encodeURIComponent(side)}/${encodeURIComponent(username)}/${encodeURIComponent(offset)}`
        const response = await axios.get<GamesAPIResponse>(url,
            {
                headers: {
                    "x-api-key": api_key
                },
            })
        return { status: "completed", profile: response.data };
    }
    catch (error) {
        if (isAxiosError<{ error: string }>(error)) {
            const error_code = error.response?.status;
            console.log(error.response);
            if (error_code === 401) {
                return {
                    status: "not_found"
                }
            }
        }
    }
    return {
        status: "failed"
    }
}
export async function getEveryGame(offset: string, username: string):
    Promise<{ status: "completed", profile: GamesAPIResponse } | { status: "failed" | "not_found" }> {
    try {
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/games/all/${encodeURIComponent(username)}/${encodeURIComponent(offset)}`
        const response = await axios.get<GamesAPIResponse>(url,
            {
                headers: {
                    "x-api-key": api_key
                },
            })
        return { status: "completed", profile: response.data };
    }
    catch (error) {
        if (isAxiosError<{ error: string }>(error)) {
            const error_code = error.response?.status;
            console.log(error.response);
            if (error_code === 401) {
                return {
                    status: "not_found"
                }
            }
        }
    }
    return {
        status: "failed"
    }
}
{/** Commented out as it might work in the future */}
// export async function GetBookMoves(fen: string, played_move: string) : Promise<{ok: true, book: boolean} | {ok: false, error: string}>{
//     try{
//         const response = await axios.get<OpeningExplorerMastersResponse>(
//             `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}`,
//             {
//                 headers: {
//                     Authorization: LICHESS_AUTH_HEADERS,
//                 },
//             }
//         );
//         const data = response.data.moves
//         const bookMove = data.some((u) => played_move === u.uci)
//         console.log(bookMove);
//         return {ok: true, book: bookMove}
//     }
//     catch(error){
//         console.log("error", error)
//         if(isAxiosError( error)){
//             const msg = "Lichess's masters api is currently down."
//             const status = 503
//             return {ok: false, error: msg}
//         }
//     }
//     return {ok: false, error: "Server seemed to malfunction when trying to evaluate the game. Reloading the page."}
// }
