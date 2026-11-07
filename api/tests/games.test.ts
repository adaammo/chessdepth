import { expect, describe, it, vi, afterAll, beforeEach } from "vitest"
import request from "supertest";
import { app } from "../src/app";

const api_key = "test_key"
// reste each mock aand env stub before any describe
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("API_KEY", api_key)
})

afterAll(() => {
    vi.unstubAllEnvs();
})

const fakeClient = vi.hoisted(() => ({
    client: vi.fn()
}));

const fakeSupabase = vi.hoisted(() => ({
    from: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    or: vi.fn()
}));

vi.mock("../lib/supabase", () => ({
    getSupabaseClient: fakeClient.client
}))

const fakeGames = [
    { id: 1, opening: "Italian Game" },
    { id: 2, opening: "Italian Game" }
];

fakeClient.client.mockReturnValue(fakeSupabase)

fakeSupabase.from.mockReturnValue(fakeSupabase)
fakeSupabase.eq.mockReturnValue(fakeSupabase)
fakeSupabase.select.mockReturnValue(fakeSupabase)
fakeSupabase.order.mockReturnValue(fakeSupabase)
fakeSupabase.or.mockReturnValue(fakeSupabase)
fakeSupabase.range.mockReturnValue({
    data: fakeGames,
    error: null
})

describe("/api/games/getGamesForOpening", () => {
    // consistent body
    const body = {
        opening: "Italian Game",
        side: "black",
        username: "Hikaru",
        offset: 25
    }
    // consistent request via supertest

    it("Queries blacks username when side is black, and white when white", async () => {
        const response = await request(app)
            .get(`/api/games/${body.opening}/${body.side}/${body.username}/${body.offset}`)
            .set("x-api-key", api_key)
        expect(fakeSupabase.eq).toHaveBeenCalledTimes(2)
        expect(response.status).toEqual(200)
        const [col, val] = fakeSupabase.eq.mock.calls[1]
        expect(col).toBe("black_username")
        expect(val).toEqual("hikaru")
    })

    it("Tests to see if side can be anything besides white/black", async () => {
        const response = await request(app)
            .get(`/api/games/${body.opening}/yellow/${body.username}/${body.offset}`)
            .set("x-api-key", api_key)

        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: "Side must be white or black" })
    })

    it("Expects a response full of data", async () => {
        const response = await request(app)
            .get(`/api/games/${body.opening}/${body.side}/${body.username}/${body.offset}`)
            .set("x-api-key", api_key)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
            games: fakeGames,
            nextOffset: body.offset + 24,
            hasMore: expect.any(Boolean)
        })
    })
})

describe("/api/games/getAllGames", () => {
    const body = {
        username: "hikaru",
        offset: 25
    }
    it("Returns all games starting from a offset", async () => {
        const response = await request(app)
            .get(`/api/games/all/${body.username}/${body.offset}`)
            .set("x-api-key", api_key)
        expect(response.status).toEqual(200)
        expect(fakeSupabase.or).toHaveBeenCalled()
        expect(response.body).toEqual({
            games: fakeGames,
            nextOffset: body.offset + 24,
            hasMore: expect.any(Boolean)
        })
    })
})