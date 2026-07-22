"use server"
import axios, { isAxiosError } from "axios"
import { AnalysisReport, AnalyzeControllerResponse } from "./types";
import { GamesAPIResponse, ProfileDatabase } from "@/api/lib/types";
export async function PostChessUsername(username: string):
    Promise<{ status: "processing" | "added", msg: string, username: string, uuid: string, statusCode: number } | { status: "completed",  username: string, uuid: string, result: AnalysisReport} | { status: "failed", failedReason: string, statusCode: number }> {
    const api_key = process.env.API_KEY ?? ""
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analyze`
    try {
        const res = await axios.post<AnalyzeControllerResponse>(url, { username: username }, {
            headers: {
                "x-api-key": api_key
            }
        });
        const message = res.data.status === "completed" ? "Game history analyzed" : res.data.status === "processing" ? "Analyzing..." :  "Username found! Processing games";
        const status = res.data.status;
        if(status === "added"){
            return {
                status,
                msg: message,
                username: res.data.username,
                uuid: res.data.uuid,
                statusCode: 200
            }
        }
        if(status === "completed"){
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
    Promise<{ status: "completed", result: AnalysisReport } | { status: "processing" | "queued" } | {status: "failed" | "not_found" }> {
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
        if (isAxiosError<{ error: string }>(error)) {
           const error_code = error.response?.status;
           if(error_code === 404){
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
export async function chessProfile(username: string): Promise<{status: "completed", profile: ProfileDatabase} | {status: "failed" | "not_found"}>{
    try{
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/jobs/profile/${encodeURIComponent(username)}`
        const response = await axios.get<{ status: "completed", profile: ProfileDatabase }>(url,
            {
                headers: {
                    "x-api-key": api_key
                },
            })
        return {status: "completed", profile: response.data.profile};
    }
    catch (error) {
        if (isAxiosError<{ error: string }>(error)) {
            console.log("");
           const error_code = error.response?.status;
           if(error_code === 401){
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
export async function getOpeningGames(offset: string, opening: string, side: "white" | "black", username: string) : 
Promise<{status: "completed", profile: GamesAPIResponse} | {status: "failed" | "not_found"}>{
    try{
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(opening)}/${encodeURIComponent(side)}/${encodeURIComponent(username)}/${encodeURIComponent(offset)}`
        const response = await axios.get<GamesAPIResponse>(url,
            {
                headers: {
                    "x-api-key": api_key
                },
            })
        return {status: "completed", profile: response.data};
    }
    catch (error) {
        if (isAxiosError<{ error: string }>(error)) {
           const error_code = error.response?.status;
           console.log(error.response);
           if(error_code === 401){
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