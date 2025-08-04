import { stripHopByHop } from "./utils.ts"; // вспомогательная функция для очистки заголовков

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Заменяем на адрес, куда проксируем трафик
  const targetBase = "https://thoroughly-champion-mastiff.edgecompute.app";

  const targetUrl = `${targetBase}${url.pathname}${url.search}`;

  // Создаём новый запрос к целевому серверу
  const proxiedRequest = new Request(targetUrl, {
    method: req.method,
    headers: stripHopByHop(req.headers),
    body: ["GET", "HEAD"].includes(req.method) ? null : req.body,
    redirect: "manual",
  });

  try {
    const response = await fetch(proxiedRequest);

    // Прокидываем ответ обратно, очищая заголовки
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: stripHopByHop(response.headers),
    });
  } catch (e) {
    return new Response(`Proxy error: ${e.message}`, { status: 502 });
  }
}

// utils.ts
export function stripHopByHop(headers: Headers): Headers {
  const result = new Headers();
  for (const [key, value] of headers.entries()) {
    if (
      ![
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailers",
        "transfer-encoding",
        "upgrade",
      ].includes(key.toLowerCase())
    ) {
      result.set(key, value);
    }
  }
  return result;
}
