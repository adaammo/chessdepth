import { ArchivesDestructor, getPlayerArchives } from "./archives";

export async function analyzeUser(username: string) {
    const archives = await getPlayerArchives(username);
    const games = await ArchivesDestructor(archives, username);
    return games;
}