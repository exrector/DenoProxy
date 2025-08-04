// proxy.ts — DenoProxy без Fastly, прямой выход в интернет

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// UUID-контроль (зашито жёстко, можешь заменить на ENV)
const UUID = "12e237d3-2e54-4f32-9c1e-877d19f8b9ac";

// Порт назначения по умолчанию (куда мы будем проксировать)
const DEFAULT_DEST = "https://example.com"; // Можно изменить

// Основной сервер
serve(async (req: Request): Promise<Response> => {
  const { pathname } = new URL(req.url);

  // Проверка UUID в заголовке / пути
  const isValid = req.headers.get("x-session-id") === UUID || pathname.includes(UUID);
  if (!isValid) {
    return new Response("Unauthorized", { status: 403 });
  }

  // Если WebSocket-запрос — проксируем как raw TCP/UDP tunnel
  if (
    req.headers.get("upgrade")?.toLowerCase() === "websocket"
  ) {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onmessage = async (msg) => {
      try {
        // Простая заглушка — в реальной реализации: тут можно вставить raw socket TCP proxy
        console.log("[SOCKET]", msg.data);
        socket.send(msg.data); // Эхо-ответ
      } catch (e) {
        console.error("WebSocket error:", e);
        socket.close();
      }
    };

    socket.onclose = () => console.log("WebSocket closed");
    return response;
  }

  // Иначе — обычный HTTP-проксирование
  const target = req.headers.get("x-destination-url") ?? DEFAULT_DEST;

  try {
    const proxyRes = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: "manual"
    });

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: proxyRes.headers,
    });
  } catch (e) {
    return new Response("Proxy error: " + e.message, { status: 502 });
  }
});    ].includes(key.toLowerCase())) {
      result.set(key, value);
    }
  }
  return result;
}
