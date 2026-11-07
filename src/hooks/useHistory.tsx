import { useState, useEffect } from "react";
import { chessProfile, ReadJobStatus } from "../lib/services/api-functions";
import { AnalysisReport } from "../lib/services/types";
import { ProfileDatabase } from "@/api/lib/types";

export default function useHistory(slug: string, uuid: string) {
    const [status, setStatus] = useState<"completed" | "processing" | "queued" | "not_found" | "failed" | null>("queued");
    const [result, setResult] = useState<ProfileDatabase | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>();
    const trueJobId = `analysis:${slug}:${uuid}`;
    useEffect(() => {
        let timeOutId: ReturnType<typeof setTimeout>;
        async function checkStatus() {
            const response = await ReadJobStatus(trueJobId);
            setStatus(response.status);
            if (response.status === "completed") {
                const data = await chessProfile(slug);
                if (data.status === "failed" || data.status === "not_found") {
                    return;
                }
                if (data.status === "completed") {
                    setResult(data.profile);
                    return;
                }
                return;
            }
            if (response.status === "not_found" || response.status === "failed") {
                setErrorMsg(response.reason)
                return;
            }
            timeOutId = setTimeout(checkStatus, 1200);
        }
        checkStatus();
        return () => clearTimeout(timeOutId);
    }, [slug, trueJobId]);
    return { status, result, errorMsg, setStatus };
}