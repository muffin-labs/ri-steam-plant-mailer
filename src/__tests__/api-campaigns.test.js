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
const { GET } = await import("@/app/api/campaigns/route.js");

function makeRequest(query = "") {
  return { url: `http://localhost/api/campaigns${query}` };
}

describe("GET /api/campaigns", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("filters campaigns by the requested mailer", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ id: 6, name: "Fund 3-K", mailer: "ridn" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Speaker" }] });

    const res = await GET(makeRequest("?mailer=ridn"));

    expect(res.status).toBe(200);
    expect(mockExecute.mock.calls[0][0].args).toEqual(["ridn"]);
    expect(res.body.campaigns).toEqual([
      { id: 6, name: "Fund 3-K", mailer: "ridn", recipients: [{ id: 1, name: "Speaker" }] },
    ]);
  });

  it("defaults to the steamplant mailer when none is given", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    await GET(makeRequest());

    expect(mockExecute.mock.calls[0][0].args).toEqual(["steamplant"]);
  });

  it("returns 404 for an unknown mailer", async () => {
    const res = await GET(makeRequest("?mailer=nope"));

    expect(res.status).toBe(404);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
