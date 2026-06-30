"use server"
import axios, { isAxiosError } from "axios"
export async function PostChessUsername(username: string):
    Promise<{ ok: true, msg: string, status: number } | { ok: false, msg: string, status: number }> {
    const api_key = process.env.API_KEY ?? ""
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analyze`
    console.log(username, url, api_key);
    try {
        const res = await axios.post(url, { username: username }, {
            headers: {
                "x-api-key": api_key
            }
        });
        return { ok: true, msg: res.data.message as string, status: 200 }
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