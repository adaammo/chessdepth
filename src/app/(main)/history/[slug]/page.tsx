import MainHistoryPage from "@/src/components/History/MainHistoryPage";
import { notFound } from "next/navigation";

export default async function HistoryPage({params, searchParams} : {params: Promise<{slug: string}>, searchParams: Promise<{jobId: string}>}){
    const slug = (await params).slug;
    const uuid = (await searchParams).jobId
    if(!slug){
    notFound();
    }
    return(
        <MainHistoryPage slug = {slug} uuid = {uuid}/>
    )
}