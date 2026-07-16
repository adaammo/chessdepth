import { useState, useEffect } from "react";
import { ReadJobStatus } from "../lib/services/analyze";
import { AnalysisReport } from "../lib/services/types";

export default function useHistory(slug: string, uuid: string) {
    const [status, setStatus] = useState<"completed" | "processing" | "queued" | "not_found" | "failed" | null>("queued");
    const [result, setResult] = useState<AnalysisReport | null>(null);
    const trueJobId = `analysis:${slug}:${uuid}`;
    useEffect(() => {
        let timeOutId: ReturnType<typeof setTimeout>;
        async function checkStatus() {
            const response = await ReadJobStatus(trueJobId);
            setStatus(response.status);
            if (response.status === "completed") {
                setResult(response.result);
                return;
            }
            if (response.status === "not_found" || response.status === "failed") {
                return;
            }
            timeOutId = setTimeout(checkStatus, 2500);
        }
        checkStatus();
        return () => clearTimeout(timeOutId);
    }, [trueJobId]);
    return {status, result};
}