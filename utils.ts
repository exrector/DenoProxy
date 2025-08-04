export function stripHopByHop(headers: Headers): Headers {
  const hopByHopHeaders = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
  ]);

  const result = new Headers();

  for (const [key, value] of headers.entries()) {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      result.set(key, value);
    }
  }

  return result;
}