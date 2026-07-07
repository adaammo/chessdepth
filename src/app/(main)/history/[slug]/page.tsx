import HistoryLoading from "@/src/components/History/HistoryLoading";
import { notFound } from "next/navigation";

export default async function HistoryPage({params} : {params: Promise<{slug: string}>}){
    const jobId = (await params).slug;
    console.log(jobId);
    if(!jobId){
    notFound();
    }
    return(
        <HistoryLoading username = {jobId} />
    )
}