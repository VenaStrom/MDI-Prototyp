export type AnalyticsEventType =
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

export type AnalyticsEventInput = {
  eventType: AnalyticsEventType;
  view: string;
  elementId?: string;
  taskId?: string;
  taskStep?: string;
  success?: boolean;
  durationMs?: number;
  details?: Record<string, unknown>;
};

const SESSION_ID_STORAGE_KEY = "mdi.telemetry.sessionId";
const STEP_INDEX_STORAGE_KEY = "mdi.telemetry.stepIndex";

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getOrCreateSessionId = (): string => {
  const storedSessionId = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const nextSessionId = createSessionId();
  window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, nextSessionId);
  return nextSessionId;
};

const getNextStepIndex = (): number => {
  const current = Number.parseInt(window.sessionStorage.getItem(STEP_INDEX_STORAGE_KEY) ?? "0", 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  window.sessionStorage.setItem(STEP_INDEX_STORAGE_KEY, String(next));
  return next;
};

const getStatsEndpoint = (): string => {
  const fromWindow = (window as Window & { __MDI_STATS_URL__?: string }).__MDI_STATS_URL__;
  if (typeof fromWindow === "string" && fromWindow.length > 0) {
    return fromWindow;
  }

  return "http://localhost:3000/stats";
};

export async function logEvent(event: AnalyticsEventInput): Promise<void> {
  const payload = {
    sessionId: getOrCreateSessionId(),
    timestamp: new Date().toISOString(),
    stepIndex: getNextStepIndex(),
    ...event,
  };

  try {
    await fetch(getStatsEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.error("Telemetry failed", error);
  }
}
