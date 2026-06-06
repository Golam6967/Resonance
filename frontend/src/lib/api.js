const SYSTEM_PROMPT = `You are a research AI assistant embedded in a paper management workspace called Nexus Research. You have access to semantic search across uploaded research papers via pgvector embeddings.

When answering:
- Be concise and precise. Researchers value accuracy over verbosity.
- If you reference a specific paper concept, note it as [from indexed papers].
- If you cannot find relevant context in the vault, say so honestly.
- Format responses clearly: use short paragraphs, avoid bullet spam.
- Do not make up citations or paper details you were not given.`;

export async function sendMessageToAPI(messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}
