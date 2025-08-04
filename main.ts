/// <reference lib="deno.unstable" />

Deno.serve(async (req) => {
  // Авторизация VLESS
  const url = new URL(req.url);
  const upgradeHeader = req.headers.get("upgrade") || "";
  const proxyProtocol = req.headers.get("sec-websocket-protocol") || "";

  const isWebSocket = upgradeHeader.toLowerCase() === "websocket";
  const isVLESS = proxyProtocol.toLowerCase() === "vless";

  if (!isWebSocket || !isVLESS) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Устанавливаем WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onmessage = async (event) => {
    try {
      const data = event.data;

      if (!(data instanceof Uint8Array)) {
        console.warn("Expected binary data");
        return;
      }

      // Здесь можно добавить проксирование, forward или echo
      socket.send(data); // Echo-сервер для проверки
    } catch (err) {
      console.error("Error handling message:", err);
      socket.close(1011, "Internal error");
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = (e) => {
    console.log("WebSocket closed:", e.code, e.reason);
  };

  return response;
});
