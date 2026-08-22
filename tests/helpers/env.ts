/** Temporarily set `process.env` keys, then restore the previous values. */
export function withEnv<T>(
  vars: Record<string, string | undefined>,
  fn: () => T
): T {
  const previous = new Map<string, string | undefined>();
  for (const key of Object.keys(vars)) {
    previous.set(key, process.env[key]);
  }

  try {
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    return fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
