import request from "supertest";
import { app } from "../src/app";
import dotenv from "dotenv"
dotenv.config({path: "dev.env"})
const key = process.env.API_KEY
/** Recent optimization: 
 * Aug 26th 2026: API now runs based of an archive of 1 month(floor), to a max of 6months(roof) depending on whether or not the recently played game was in the 
 * last game or not.
 * Tests done on this day: Three friend usernames ran at 15-16-17 seconds each, and after optimization, we now are down to 2-3 seconds each
 * since we only care about
 */
async function testTiming(){
    const GMusernames = [
        "Hikaru",
        "MagnusCarlsen",
        "FabianoCaruana",
        "DanielNaroditsky",
        "hansen",
        "KNVB",
      
        "vanea_03",
        "thalaiva",
        "mitrabhaa",
        "HomayooonT",
        "VitaRasik",
        "shimastream",
        "GMAshley",
        "kaidanov",
        "mickey632702",
        "2bf41-0",
        "FrancyGM",
        "tigrangharamian",
        "Angry_Twin",
        "ilyajunior",
        "underdogchss",
        "BogdanDeac",
        "IvanMorovic",
        "Ucitelot",
      
        "baag",
        "kuli4ik",
        "DaggiGretarsson",
        "Illia_Nyzhnyk",
        "GMVallejo",
        "GMLazaroBruzon",
      ];
      const friends = [
        "sspiidey", "sharquanisha", "nitrobeast705", "MagnusCarlsen"
      ];
      const times : string[] = [];
    const beginningTime = performance.now();
    for (const name of friends){
        const start = performance.now();
        const req = await request(app)
        .post("/api/analyze")
        .set("x-api-key", key ?? "")
        .send({
            username: name
        })
        // uuid is the jobid
        const jobId = `analysis:${req.body.username}:${req.body.uuid}`
        while(true){
            const jobreq = await request(app)
            .get(`/api/jobs/${encodeURIComponent(jobId)}`)
            .set("x-api-key", key ?? "")
            console.log(name, jobreq.status, jobreq.body);
            const status = jobreq.body.status
            if (jobreq.status === 404) {
                const end = performance.now();
                times.push(`BROKE-ON:${name}: ${((end - start) / 1000).toFixed(2)}`);
                console.log(`${name}: skipped`);
                break;
            }
            if(status == "completed"){
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        const end = performance.now();
        const timing = `${name}: ${((end - start) / 1000).toFixed(2)} seconds`
        times.push(timing)
    }
    const endTime = performance.now();
    console.log(times)
    console.log("Total: ", (endTime - beginningTime) / 1000)
}
testTiming()