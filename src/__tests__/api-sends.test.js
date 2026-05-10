import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server so NextResponse works outside Next.js runtime
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
}));

// Mock getDb — we replace it per test
const mockExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getDb: () => ({ execute: mockExecute }),
}));

// Import after mocks are set up
const { POST } = await import("@/app/api/sends/route.js");

function makeRequest(body) {
  return { json: async () => body };
}

describe("POST /api/sends", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("returns 400 when campaign_id is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/campaign_id/i);
  });

  it("returns 400 when campaign_id is not a number", async () => {
    const res = await POST(makeRequest({ campaign_id: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when campaign does not exist or is inactive", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });
    const res = await POST(makeRequest({ campaign_id: 99 }));
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("inserts a send row and returns ok:true for a valid campaign", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // campaign lookup
      .mockResolvedValueOnce({}); // insert

    const res = await POST(makeRequest({ campaign_id: 1 }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    // Verify insert was called with the right campaign_id
    const insertCall = mockExecute.mock.calls[1];
    expect(insertCall[0].sql).toMatch(/INSERT INTO sends/i);
    expect(insertCall[0].args).toContain(1);
  });

  it("returns 500 when the database throws", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db error"));
    const res = await POST(makeRequest({ campaign_id: 1 }));
    expect(res.status).toBe(500);
  });
});
