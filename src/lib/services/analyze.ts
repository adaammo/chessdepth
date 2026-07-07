"use server"
import axios, { isAxiosError } from "axios"
import { AnalyzeControllerResponse } from "./types";
export async function PostChessUsername(username: string):
    Promise<{ ok: true, msg: string, jobId: string, status: number } | { ok: false, msg: string, status: number }> {
    const api_key = process.env.API_KEY ?? ""
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analyze`
    try {
        const res = await axios.post<AnalyzeControllerResponse>(url, { username: username }, {
            headers: {
                "x-api-key": api_key
            }
        });
        const message = res.data.status === "completed" ? "Game history analyzed" : res.data.status === "processing" ? "Analyzing..." : res.data.status === "queued" ? "Waiting to analyze..." : "Username found! Processing games";
        return { ok: true, msg: message, jobId: res.data.jobId, status: 200 }
    }
    catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status;
            const msg = error.response?.data.error as string;
            return { ok: false, msg: msg ?? "Server is not communicating.", status: status ?? 500 }
        }
    }
    return {
        ok: false,
        msg: "Something went wrong...",
        status: 503
    }
}
export async function ReadJobStatus(jobId: string):
    Promise<{ ok: true, status: "completed" | "processing" | "queued" } | { ok: false, msg: string, status: number }> {
    try {
        const api_key = process.env.API_KEY ?? ""
        const url = `${process.env.NEXT_PUBLIC_API_URL}/jobs/${encodeURIComponent(jobId)}`
        const response = await axios.get<{ status: "completed" | "processing" | "queued" }>(url,
            {
                headers: {
                    "x-api-key": api_key
                }
            })
        return { ok: true, status: response.data.status }
    }
    catch (error) {
        if (isAxiosError(error)) {
            const msg = error.response?.data.message;
            const status = error.response?.status;
            return {
                ok: false,
                msg: msg,
                status: status ?? 503
            }
        }
    }
    return {
        ok: false,
        msg: "Something went wrong...",
        status: 503
    }
}