import { ArchivesDestructor, getPlayerArchives } from "./archives";
import { BuildArchiveUrls } from "./build_archive_urls";
import { DoesThisUserExist } from "./user-existence";

export async function analyzeUser(username: string) {
    try {
        const user = await DoesThisUserExist(username.toLocaleLowerCase());
        const now = new Date()
        console.log(user.exists)
        const start = (user.exists ? user.startFrom : new Date(now.getFullYear(), now.getMonth() - 5));
        const archives = BuildArchiveUrls(username.toLocaleLowerCase(), start);
        const games = await ArchivesDestructor(archives, username.toLocaleLowerCase());
        return games;
    }
    catch (error) {
        throw error;
    }
}