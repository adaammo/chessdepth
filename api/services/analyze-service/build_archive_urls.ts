import { CHESS_URL_ARCHIVES_PREFIX } from "../../lib/constants"

export function BuildArchiveUrls(username: string, start: Date): string[]{
    // no need for end to be passed becaused start is always 6 months from now.
    const end = new Date()
    const ans = []
    const current = start
    console.log(current, end);
    while (current <= end){
        ans.push(`${CHESS_URL_ARCHIVES_PREFIX(username)}/${String(start.getFullYear())}/${String(start.getMonth() + 1).padStart(2, "0")}`)
        current.setMonth(current.getMonth() + 1);
    }
    return ans
}