import cors from "cors";
import express, { type Express } from "express";
import { company, MONTHS, type ClientsResponse } from "./data.js";

export interface AppOptions {
  /** Artificial latency, handy for demoing the loading state. */
  defaultDelayMs?: number;
}

export const MAX_DELAY_MS = 10_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reads a `?delay=` value; anything missing, non-numeric or negative falls back, and the result is capped. */
export function parseDelay(raw: unknown, fallbackMs: number): number {
  const ms = raw === undefined ? fallbackMs : Number(raw);
  if (!Number.isFinite(ms) || ms < 0) return fallbackMs;
  return Math.min(ms, MAX_DELAY_MS);
}

export function createApp({ defaultDelayMs = 0 }: AppOptions = {}): Express {
  const app = express();
  app.use(cors());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // `?delay=<ms>` and `?fail=1` exist so the UI's loading/error states can be exercised by hand.
  app.get("/api/clients", async (req, res) => {
    const delay = parseDelay(req.query.delay, defaultDelayMs);
    if (delay > 0) await sleep(delay);

    if (req.query.fail === "1") {
      res.status(500).json({ error: "Simulated server failure" });
      return;
    }

    const body: ClientsResponse = { months: MONTHS, company };
    res.json(body);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
