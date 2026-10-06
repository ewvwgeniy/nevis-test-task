import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp, MAX_DELAY_MS, parseDelay } from "../src/app.js";

describe("GET /api/clients", () => {
  const app = createApp();

  it("returns the company tree with a 12-month axis", async () => {
    const res = await request(app).get("/api/clients").expect(200);

    expect(res.body.months).toHaveLength(12);
    expect(res.body.months[0]).toBe("2024-02-01");
    expect(res.body.months[11]).toBe("2025-01-01");
    expect(res.body.company.name).toBe("Company");
    expect(res.body.company.branches).toHaveLength(3);
  });

  it("keeps every values array aligned with the month axis", async () => {
    const res = await request(app).get("/api/clients").expect(200);
    const walk = (node: { values: number[]; [k: string]: unknown }) => {
      expect(node.values).toHaveLength(12);
      for (const key of ["branches", "employees", "channels"]) {
        for (const child of (node[key] as typeof node[] | undefined) ?? []) walk(child);
      }
    };
    walk(res.body.company);
  });

  it("can simulate a failure", async () => {
    const res = await request(app).get("/api/clients?fail=1").expect(500);
    expect(res.body.error).toBeTruthy();
  });

  it("returns JSON 404 for unknown api routes", async () => {
    await request(app).get("/api/nope").expect(404);
  });
});

describe("response delay", () => {
  const timed = async (app: ReturnType<typeof createApp>, url: string) => {
    const start = performance.now();
    await request(app).get(url).expect(200);
    return performance.now() - start;
  };

  it("responds immediately by default", async () => {
    expect(await timed(createApp(), "/api/clients")).toBeLessThan(100);
  });

  it("delays by the ?delay query value", async () => {
    expect(await timed(createApp(), "/api/clients?delay=150")).toBeGreaterThanOrEqual(140);
  });

  it("applies the configured default delay", async () => {
    expect(await timed(createApp({ defaultDelayMs: 150 }), "/api/clients")).toBeGreaterThanOrEqual(140);
  });

  it("lets ?delay override the default delay", async () => {
    expect(await timed(createApp({ defaultDelayMs: 500 }), "/api/clients?delay=0")).toBeLessThan(100);
  });

  it("still fails after the delay when ?fail=1 is set", async () => {
    const start = performance.now();
    await request(createApp()).get("/api/clients?delay=150&fail=1").expect(500);
    expect(performance.now() - start).toBeGreaterThanOrEqual(140);
  });
});

describe("parseDelay", () => {
  it("uses the fallback when absent", () => {
    expect(parseDelay(undefined, 25)).toBe(25);
  });

  it("parses numeric strings", () => {
    expect(parseDelay("300", 0)).toBe(300);
  });

  it("ignores junk and negatives", () => {
    expect(parseDelay("abc", 25)).toBe(25);
    expect(parseDelay("-5", 25)).toBe(25);
    expect(parseDelay("Infinity", 25)).toBe(25);
  });

  it("caps the delay so a request cannot hang the server", () => {
    expect(parseDelay("999999", 0)).toBe(MAX_DELAY_MS);
  });
});
