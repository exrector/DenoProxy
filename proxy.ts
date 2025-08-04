import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const UUID = "12e237d3-2e54-4f32-9c1e-877d19f8b9ac";
const DEFAULT_DEST = "https://example.com";

serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const uuidFromHeader = req.headers.get("x-session-id");
  const isValid = uuidFromHeader === UUID || url.pathname.includes(UUID);

  if (!isValid) {
    return new Response("Unauthorized", { status: 403 });
  }

  // WebSocket tunnel handling
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log("WebSocket opened");
    };

    socket.onmessage = (event) => {
      // echo tunnel, can be replaced with real proxying
      socket.send(event.data);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      socket.close();
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return response;
  }

  // HTTP proxy
  const target = req.headers.get("x-destination-url") ?? DEFAULT_DEST;

  try {
    const proxyRes = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(proxyRes.headers);
    responseHeaders.delete("content-encoding"); // Ensure Deno can stream it

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response("Proxy error: " + err.message, { status: 502 });
  }
});
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
