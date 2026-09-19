export function logError(scope, error, context) {
  console.error(JSON.stringify({
    level: "error",
    scope,
    message: error?.message || String(error),
    context: context || null,
    time: new Date().toISOString(),
  }));
}

export function logWarn(scope, message, context) {
  console.warn(JSON.stringify({
    level: "warn",
    scope,
    message,
    context: context || null,
    time: new Date().toISOString(),
  }));
}
