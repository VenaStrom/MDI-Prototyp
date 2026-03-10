import express from "express";
import { mkdir, access, appendFile } from "node:fs/promises";
import path from "node:path";

const app = express();
const port = 3000;

const LOG_ROOT = path.resolve(import.meta.dirname, "logs");

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    );
  } catch {
    return false;
  }
}

type AnalyticsEventType =
  | "view_open"
  | "button_click"
  | "search_submit"
  | "results_loaded"
  | "journey_open"
  | "purchase_start"
  | "purchase_success"
  | "purchase_failed"
  | "task_start"
  | "task_step"
  | "task_complete"
  | "custom";

type AnalyticsEvent = {
  sessionId: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  view: string;
  elementId?: string;
  stepIndex?: number;
  taskId?: string;
  taskStep?: string;
  success?: boolean;
  durationMs?: number;
  details?: Record<string, unknown>;
};

type StatsRequestBody = AnalyticsEvent | { events: AnalyticsEvent[] };

const CSV_COLUMNS: ReadonlyArray<keyof AnalyticsEvent | "receivedAt"> = [
  "receivedAt",
  "timestamp",
  "sessionId",
  "eventType",
  "view",
  "elementId",
  "stepIndex",
  "taskId",
  "taskStep",
  "success",
  "durationMs",
  "details",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeSessionId(sessionId: string): string {
  return sessionId.replace(/[^a-zA-Z0-9-_]/g, "_");
}

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  const raw = typeof value === "string" ? value : JSON.stringify(value);
  const escaped = raw.replaceAll('"', '""');
  return `"${escaped}"`;
}

function toCsvRow(event: AnalyticsEvent, receivedAt: string): string {
  const values: Record<string, unknown> = {
    ...event,
    receivedAt,
    details: event.details ?? {},
  };

  return CSV_COLUMNS.map((column) => csvEscape(values[column])).join(",") + "\n";
}

function parseEvent(input: unknown): AnalyticsEvent | null {
  if (!isRecord(input)) {
    return null;
  }

  const {
    sessionId,
    eventType,
    timestamp,
    view,
    elementId,
    stepIndex,
    taskId,
    taskStep,
    success,
    durationMs,
    details,
  } = input;

  if (
    typeof sessionId !== "string" ||
    typeof eventType !== "string" ||
    typeof timestamp !== "string" ||
    typeof view !== "string"
  ) {
    return null;
  }

  const event: AnalyticsEvent = {
    sessionId,
    eventType: eventType as AnalyticsEventType,
    timestamp,
    view,
  };

  if (typeof elementId === "string") {
    event.elementId = elementId;
  }

  if (typeof stepIndex === "number") {
    event.stepIndex = stepIndex;
  }

  if (typeof taskId === "string") {
    event.taskId = taskId;
  }

  if (typeof taskStep === "string") {
    event.taskStep = taskStep;
  }

  if (typeof success === "boolean") {
    event.success = success;
  }

  if (typeof durationMs === "number") {
    event.durationMs = durationMs;
  }

  if (isRecord(details)) {
    event.details = details;
  }

  return event;
}

function parseEvents(body: unknown): AnalyticsEvent[] {
  if (isRecord(body) && Array.isArray(body.events)) {
    return body.events.map(parseEvent).filter((event): event is AnalyticsEvent => event !== null);
  }

  const singleEvent = parseEvent(body);
  return singleEvent ? [singleEvent] : [];
}

async function appendSessionEvents(events: AnalyticsEvent[]): Promise<void> {
  const groupedEvents = new Map<string, AnalyticsEvent[]>();

  for (const event of events) {
    const key = sanitizeSessionId(event.sessionId);
    const list = groupedEvents.get(key);

    if (list) {
      list.push(event);
    } else {
      groupedEvents.set(key, [event]);
    }
  }

  for (const [sessionId, sessionEvents] of groupedEvents) {
    const sessionDir = path.join(LOG_ROOT, sessionId);
    const sessionFile = path.join(sessionDir, "events.csv");

    await mkdir(sessionDir, { recursive: true });

    let hasFile = true;
    try {
      await access(sessionFile);
    } catch {
      hasFile = false;
    }

    if (!hasFile) {
      await appendFile(sessionFile, CSV_COLUMNS.join(",") + "\n", "utf8");
    }

    const receivedAt = new Date().toISOString();
    const rows = sessionEvents.map((event) => toCsvRow(event, receivedAt)).join("");
    await appendFile(sessionFile, rows, "utf8");
  }
}

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (typeof origin === "string" && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.post("/stats", async (req, res) => {
  const events = parseEvents(req.body as StatsRequestBody);

  if (events.length === 0) {
    res.status(400).json({
      ok: false,
      error: "Invalid payload. Send one AnalyticsEvent or { events: AnalyticsEvent[] }.",
    });
    return;
  }

  try {
    await appendSessionEvents(events);
    res.status(202).json({ ok: true, received: events.length });
  } catch (error) {
    console.error("Failed to write stats", error);
    res.status(500).json({ ok: false, error: "Could not persist stats." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});