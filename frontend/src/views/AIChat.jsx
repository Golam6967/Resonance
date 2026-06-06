import { useEffect, useRef } from "react";
import { colors, font, radius } from "../lib/theme";
import { Spinner, EmptyState } from "../components/ui/index";
import { Button } from "../components/ui/Button";

// Render assistant message with basic markdown: **bold**, newlines
function renderContent(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0", lineHeight: 1.65 }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ fontWeight: 600, color: colors.textPrimary }}>
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        animation: "fadeUp 0.2s ease both",
      }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {!isUser && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: radius.md,
            background: colors.accentMuted,
            border: `1px solid ${colors.accentGlow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: 10,
            marginTop: 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      )}

      <div
        style={{
          maxWidth: "72%",
          padding: "11px 14px",
          borderRadius: isUser ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
          background: isUser ? colors.accentMuted : colors.bgCard,
          border: `1px solid ${isUser ? colors.accentGlow : colors.border}`,
          fontFamily: font.sans,
          fontSize: "13px",
          color: isUser ? colors.textPrimary : colors.textSecondary,
          letterSpacing: "-0.01em",
        }}
      >
        {isUser ? message.content : renderContent(message.content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.md,
          background: colors.accentMuted,
          border: `1px solid ${colors.accentGlow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "11px 14px",
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: "4px 12px 12px 12px",
        }}
      >
        <Spinner size={13} color={colors.textTertiary} />
        <span
          style={{
            fontFamily: font.sans,
            fontSize: "12px",
            color: colors.textTertiary,
            letterSpacing: "-0.01em",
          }}
        >
          Thinking…
        </span>
      </div>
    </div>
  );
}

export function AIChat({ messages, input, setInput, isLoading, error, sendMessage, clearMessages, papers }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasIndexedPapers = papers.some((p) => p.status === "indexed");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px - 56px)",
        maxWidth: 760,
        animation: "fadeIn 0.25s ease both",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Context bar */}
      {papers.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: hasIndexedPapers ? colors.accent : colors.warn,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: font.sans,
                fontSize: "12px",
                color: colors.textSecondary,
                letterSpacing: "-0.01em",
              }}
            >
              {papers.length} paper{papers.length !== 1 ? "s" : ""} in vault
              {hasIndexedPapers
                ? ` · ${papers.filter((p) => p.status === "indexed").length} indexed`
                : " · none indexed yet"}
            </span>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              Clear chat
            </Button>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          paddingRight: 4,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <EmptyState
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="Start a conversation"
              description="Ask questions about your research papers. The AI can compare findings, explain concepts, and synthesize information across your vault."
            />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div
            style={{
              padding: "11px 14px",
              background: colors.dangerSurface,
              border: `1px solid ${colors.danger}22`,
              borderRadius: radius.md,
              fontFamily: font.sans,
              fontSize: "12px",
              color: colors.danger,
              letterSpacing: "-0.01em",
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          padding: "14px 16px",
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask a question about your papers…  (Enter to send, Shift+Enter for newline)"
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: font.sans,
            fontSize: "13px",
            color: colors.textPrimary,
            letterSpacing: "-0.01em",
            lineHeight: 1.6,
            maxHeight: 120,
            overflowY: "auto",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />
        <Button
          variant="primary"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{ flexShrink: 0 }}
        >
          {isLoading ? <Spinner size={13} color={colors.textInverse} /> : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
