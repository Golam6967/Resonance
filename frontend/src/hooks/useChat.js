import { useState, useCallback, useEffect, useRef } from "react";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const initializedRef = useRef(false);

  // 1. Automatically fetch or initialize the persistent Global Chat Session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initializeGlobalChat() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/chat/global/session",
        );

        const result = await res.json();
        console.log(result);
        if (result.success) {
          setCurrentSessionId(result.data.id);
          setMessages(result.data.messages || []);
        } else {
          setError("Failed to initialize conversational workspace thread.");
        }
      } catch (err) {
        setError("Could not establish a connection to the chat server.");
      }
    }
    initializeGlobalChat();
  }, []);

  // 2. Modified Message Dispatcher targeting our Express RAG Pipeline
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !currentSessionId || isLoading) return;

    // Optimistically update UI with the user's message right away
    const temporaryId = Date.now();
    const userMessage = { id: temporaryId, role: "user", content: text };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Hit your new Express global query orchestration controller endpoint
      const res = await fetch("http://localhost:5000/api/chat/global/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          content: text,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Swap out our optimistic UI block with the permanent rows verified by PostgreSQL/Prisma
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== temporaryId);
          return [
            ...filtered,
            result.data.userMessage,
            result.data.assistantMessage,
          ];
        });
      } else {
        setError(result.error || "Failed to compile vector analysis query.");
      }
    } catch (err) {
      setError(
        "Communication breakdown between backend orchestrator and client.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentSessionId]);

  // 3. Modified Clear Logs matching our database truncate endpoint
  const clearMessages = useCallback(async () => {
    if (!currentSessionId) return;

    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/global/clear/${currentSessionId}`,
        {
          method: "DELETE",
        },
      );
      const result = await res.json();
      if (result.success) {
        setMessages([]);
      } else {
        setError("Failed to clear conversational logs from server storage.");
      }
    } catch (err) {
      setError("Failed to execute clear-history command on the server.");
    }
  }, [currentSessionId]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
