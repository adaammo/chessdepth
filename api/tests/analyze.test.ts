import { expect, describe, it, vi, afterAll, beforeEach } from "vitest"
import request from "supertest";
import { app } from "../src/app";
const api_key = "test_key"
// reste each mock aand env stub before any describe
beforeEach(() => {
    queueMock.add.mockReset();
    queueMock.getJob.mockReset();
    vi.stubEnv("API_KEY", api_key)
})
afterAll(() => {
    vi.unstubAllEnvs();
})
// creates the object that has the functions used in the main analyze controller
const queueMock = vi.hoisted(() => ({
    add: vi.fn(),
    getJob: vi.fn(),
}))
queueMock.getJob.mockResolvedValue(null);

// mock it now
vi.mock("../lib/queue.ts", () => ({
    chess_queue: {
        add: queueMock.add,
        getJob: queueMock.getJob,
    }
}));
describe("/api/analyze", () => {
    it("A job that doesnt exist creates correctly and return 202", async () => {
        const body = { username: "hikaru" };
        const response = await request(app)
            .post("/api/analyze")
            .set("x-api-key", api_key)
            .send(body)
        expect(response.status).toBe(202);
        expect(response.body).toEqual({
            status: "added",
            message: "Username Found! Waiting to analyze",
            username: "hikaru",
            uuid: expect.any(String)
        })
        expect(queueMock.add).toHaveBeenCalledOnce();
        expect(queueMock.getJob).toHaveBeenCalledOnce();
        const [jobName, jobUsername, jobInfo] = queueMock.add.mock.calls[0];

        expect(jobName).toEqual("analyze-user")
        expect(jobUsername).toEqual({ username: "hikaru" })
        expect(jobInfo).toEqual({

            attempts: 3,
            jobId: expect.any(String),
            removeOnComplete: {
                age: 300,
            },
            removeOnFail: true,
        })
    })
    const invalidUsernameCases = [
        {
            reason: "contains spaces",
            body: { username: "hikaru the greatest of all time wowee" }
        },
        {
            reason: "is too long",
            body: { username: "hikaruuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu" }
        },
        {
            reason: "is too short",
            body: { username: "hi" }
        }
    ];
    it.each(invalidUsernameCases)("returns 400 on broken usernames", async ({ body }) => {
        const response = await request(app)
            .post("/api/analyze")
            .set("x-api-key", api_key)
            .send(body)
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "You must insert a username/valid username."
        })
    })
})

