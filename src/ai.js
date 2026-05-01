export async function aiRoute(request, reply) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body)
      }
    );

    const data = await response.json();
    reply.send(data);
  } catch (err) {
    reply.code(500).send({ error: "AI request failed" });
  }
}
