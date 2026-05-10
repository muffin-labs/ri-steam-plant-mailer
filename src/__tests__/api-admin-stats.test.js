import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
}));

const mockExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getDb: () => ({ execute: mockExecute }),
}));

// Auth mock — default to passing; override per test for the 401 case
const mockRequireAuth = vi.fn(() => null);
vi.mock("@/lib/auth", () => ({
  requireAuth: (...args) => mockRequireAuth(...args),
}));

const { GET } = await import("@/app/api/admin/stats/route.js");

const TOTAL_ROW = { rows: [{ count: 42 }] };
const BY_DAY_ROWS = {
  rows: [
    { date: "2026-05-01", count: 10 },
    { date: "2026-05-02", count: 32 },
  ],
};
const BY_CAMPAIGN_ROWS = {
  rows: [
    {
      campaign_id: 1,
      campaign_name: "City Agencies",
      total_sends: 30,
      last_sent_at: "2026-05-02T10:00:00",
    },
    {
      campaign_id: 2,
      campaign_name: "City Council",
      total_sends: 12,
      last_sent_at: null,
    },
  ],
};

function makeRequest() {
  return {};
}

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockRequireAuth.mockReturnValue(null); // auth passes by default
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockReturnValueOnce({ status: 401, body: { error: "Unauthorized" } });
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns aggregated stats with correct shape", async () => {
    mockExecute
      .mockResolvedValueOnce(TOTAL_ROW)
      .mockResolvedValueOnce(BY_DAY_ROWS)
      .mockResolvedValueOnce(BY_CAMPAIGN_ROWS);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.body.total_sends).toBe(42);
    expect(res.body.sends_by_day).toHaveLength(2);
    expect(res.body.sends_by_day[0]).toEqual({ date: "2026-05-01", count: 10 });
    expect(res.body.by_campaign).toHaveLength(2);
  });

  it("coerces count strings to numbers", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ count: "17" }] })
      .mockResolvedValueOnce({ rows: [{ date: "2026-05-01", count: "5" }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await GET(makeRequest());
    expect(typeof res.body.total_sends).toBe("number");
    expect(res.body.total_sends).toBe(17);
    expect(typeof res.body.sends_by_day[0].count).toBe("number");
  });

  it("sets last_sent_at to null when no sends exist for a campaign", async () => {
    mockExecute
      .mockResolvedValueOnce(TOTAL_ROW)
      .mockResolvedValueOnce(BY_DAY_ROWS)
      .mockResolvedValueOnce(BY_CAMPAIGN_ROWS);

    const res = await GET(makeRequest());
    const noSends = res.body.by_campaign.find((c) => c.campaign_id === 2);
    expect(noSends.last_sent_at).toBeNull();
  });

  it("returns 500 when the database throws", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db error"));
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});
