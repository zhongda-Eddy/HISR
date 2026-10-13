export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const incoming = new URL(origin);
    const target = new URL(request.url);
    // Next.js may normalize the URL to localhost while the browser uses 127.0.0.1.
    const host = request.headers.get("host") ?? target.host;
    if (incoming.protocol === target.protocol && incoming.host === host)
      return true;
    const actual = new URL(`${target.protocol}//${host}`);
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return (
      incoming.protocol === actual.protocol &&
      incoming.port === actual.port &&
      loopback.has(incoming.hostname) &&
      loopback.has(actual.hostname)
    );
  } catch {
    return false;
  }
}
