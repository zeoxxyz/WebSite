// Error capture stub — replace with your error tracking service (Sentry, etc.)
let lastError: unknown = null;

export function captureError(error: unknown, context?: Record<string, unknown>) {
  lastError = error;
  if (import.meta.env.DEV) {
    console.error("[Error captured]", error, context);
  }
}

export function consumeLastCapturedError(): unknown {
  const e = lastError;
  lastError = null;
  return e;
}
