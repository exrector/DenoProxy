import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("WebSocket opened");
  };

  socket.onmessage = async (event) => {
    try {
      const target = "1.1.1.1:443"; // временно, чтобы не парсить SNI
      const [host, portStr] = target.split(":");
      const port = parseInt(portStr);

      const conn = await Deno.connect({ hostname: host, port });
      const writer = conn.writable.getWriter();
      const reader = conn.readable.getReader();

      // отправка данных с WebSocket в egress
      await writer.write(event.data);
      writer.releaseLock();

      // чтение ответа и отправка обратно
      const { value } = await reader.read();
      if (value) socket.send(value);

      reader.releaseLock();
    } catch (err) {
      console.error("Proxy error:", err);
      socket.close();
    }
  };

  socket.onerror = (e) => console.error("WebSocket error", e);
  socket.onclose = () => console.log("WebSocket closed");

  return response;
});    return response;
  }

  // === HTTP-проксирование ===
  const target = req.headers.get("x-destination-url") ?? DEFAULT_DEST;

  try {
    const proxyRes = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(proxyRes.headers);
    responseHeaders.delete("content-encoding");

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response("Proxy error: " + err.message, { status: 502 });
  }
});
