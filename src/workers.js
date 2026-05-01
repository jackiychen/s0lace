export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // COOP/COEP headers for proxy paths
    const needsHeaders =
      url.pathname.startsWith("/scram/") ||
      url.pathname.startsWith("/baremux/") ||
      url.pathname.startsWith("/epoxy/") ||
      url.pathname.startsWith("/wisp/");

    // WebSocket upgrade → forward to your external wisp server
    if (request.headers.get("Upgrade") === "websocket" && url.pathname.endsWith("/wisp/")) {
      const wispUrl = env.WISP_SERVER_URL + url.pathname + url.search;
      return fetch(wispUrl, request);
    }

    // AI route
    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: request.body,
          }
        );
        const data = await response.json();
        return Response.json(data);
      } catch {
        return Response.json({ error: "AI request failed" }, { status: 500 });
      }
    }

    // Everything else → serve static assets
    const response = await env.ASSETS.fetch(request);

    // Apply security headers for proxy paths
    if (needsHeaders) {
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
      newResponse.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      return newResponse;
    }

    return response;
  },
};
