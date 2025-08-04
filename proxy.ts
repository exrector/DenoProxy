// proxy.ts — Deno Deploy Web Stream proxy to Fastly 

const FASTLY_TARGET = "https://thoroughly-champion-mastiff.edgecompute.app"; // замени на свой

export default async function handler(req: Request): Promise<Response> {
  const { method, headers } = req;

  const url = new URL(req.url);
  const targetUrl = `${FASTLY_TARGET}${url.pathname}${url.search}`;

  const proxiedRequest = new Request(targetUrl, {
    method,
    headers: stripHopByHop(headers),
    body: method !== "GET" && method !== "HEAD" ? req.body : null,
  });

  const resp = await fetch(proxiedRequest);

  return new Response(resp.body, {
    status: resp.status,
    headers: stripHopByHop(resp.headers),
  });
}

function stripHopByHop(headers: Headers): Headers {
  const result = new Headers();
  for (const [key, value] of headers.entries()) {
    if (!["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-authenticate", "proxy-authorization", "te", "trailers"].includes(key.toLowerCase())) {
      result.set(key, value);
    }
  }
  return result;
}