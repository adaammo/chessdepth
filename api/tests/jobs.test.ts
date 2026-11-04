import { expect, describe, it, vi, afterAll, beforeEach } from "vitest"
import request from "supertest";
import { app } from "../src/app";
/**
 * Test file for testing the jobs router
 * Each describe is a single API endpoint for the single router
 */
const api_key = "test_key"

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("API_KEY", api_key);
})

afterAll(() => {
    vi.unstubAllEnvs();
})

const mockQueue = vi.hoisted(() => ({
    getJob: vi.fn(),
}))

vi.mock("../lib/queue.ts", () => ({
    chess_queue: mockQueue
}))
describe("/api/jobs/:jobId", () => {
    it("returns 404 when no job is found", async () => {
        const response = await request(app)
        .get("/api/jobs/123")
        .set("x-api-key", api_key)

        expect(response.status).toBe(404);
    })

    it("returns 200 when job is waiting", async () => {
        mockQueue.getJob.mockResolvedValueOnce({
            id: "job",
            getState: vi.fn().mockResolvedValue("waiting"),
        });
        const response = await request(app)
        .get("/api/jobs/123")
        .set("x-api-key", api_key)
        expect(response.status).toBe(200)
    })

    it("returns 200 when job is processing", async () => {
        mockQueue.getJob.mockResolvedValueOnce({
            id: "job",
            getState: vi.fn().mockResolvedValue("active"),
        });
        const response = await request(app)
        .get("/api/jobs/123")
        .set("x-api-key", api_key)
        expect(response.status).toBe(200)
    })

    it("returns 200 when job is done", async () => {
        mockQueue.getJob.mockResolvedValueOnce({
            id: "job",
            getState: vi.fn().mockResolvedValue("completed"),
        });
        const response = await request(app)
        .get("/api/jobs/123")
        .set("x-api-key", api_key)
        expect(response.status).toBe(200)
    })

    it("returns 200 when job failed AND is a database error", async () => {
        mockQueue.getJob.mockResolvedValueOnce({
            id: "job",
            getState: vi.fn().mockResolvedValue("failed"),
            failedReason: "DATABSE_ERROR",
        });
        const response = await request(app)
        .get("/api/jobs/123")
        .set("x-api-key", api_key)
        expect(response.status).toBe(200)
        expect(response.body.reason).toEqual("Something happened Internally. Please restart from the beginning.")
    })
})

const fakeChessProfile = vi.hoisted(() => vi.fn())
vi.mock("../database/chess-profiles.ts", () => ({
    getChessProfile: fakeChessProfile
}))
describe("/api/jobs/profile/:username", () => {
    it("returns 401 when the database returns no values", async () => {
        fakeChessProfile.mockResolvedValueOnce({status: "failed"});
        const response = await request(app)
        .get("/api/jobs/profile/hikaru")
        .set("x-api-key", api_key)

        expect(response.status).toBe(401)
    })

    it("returns 200 when the database returns a profile regarding a user", async () => {
        fakeChessProfile.mockResolvedValueOnce({status: "completed", profile: {username: "hikaru"}});
        const response = await request(app)
        .get("/api/jobs/profile/hikaru")
        .set("x-api-key", api_key)

        expect(response.status).toBe(200)
        expect(response.body.profile).toEqual({username: "hikaru"})
    })
})