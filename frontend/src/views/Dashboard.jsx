import { colors, font, radius } from "../lib/theme";
import { EmptyState } from "../components/ui/index";
import { Button } from "../components/ui/Button";

function StatCard({ label, value, sub }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: "11px",
          fontWeight: 500,
          color: colors.textTertiary,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: font.sans,
          fontSize: "28px",
          fontWeight: 600,
          color: colors.textPrimary,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: font.sans,
            fontSize: "12px",
            color: colors.textTertiary,
            letterSpacing: "-0.01em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontFamily: font.sans,
        fontSize: "12px",
        fontWeight: 600,
        color: colors.textTertiary,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {title}
    </div>
  );
}

export function Dashboard({ papers, setActive }) {
  const total = papers.length;
  const indexed = papers.filter((p) => p.status === "indexed").length;
  const queued = papers.filter((p) => p.status === "queued").length;
  const parsing = papers.filter((p) => p.status === "parsing").length;

  const recent = [...papers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        maxWidth: 860,
        animation: "fadeUp 0.3s ease both",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Stats */}
      <div>
        <SectionHeader title="Overview" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <StatCard
            label="Total Papers"
            value={total}
            sub={total === 0 ? "No papers yet" : "in vault"}
          />
          <StatCard label="Indexed" value={indexed} sub="ready for search" />
          <StatCard label="Processing" value={parsing} sub="being parsed" />
          <StatCard label="Queued" value={queued} sub="awaiting parse" />
        </div>
      </div>

      {/* Recent papers */}
      <div>
        <SectionHeader title="Recently Added" />
        {recent.length === 0 ? (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
            }}
          >
            <EmptyState
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              title="No papers uploaded"
              description="Upload your first research paper to get started. Papers are parsed, embedded, and made available for AI search."
              action={
                <Button variant="primary" onClick={() => setActive("vault")}>
                  Go to Paper Vault
                </Button>
              }
            />
          </div>
        ) : (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              overflow: "hidden",
            }}
          >
            {recent.map((paper, i) => (
              <div
                key={paper.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 18px",
                  borderBottom:
                    i < recent.length - 1
                      ? `1px solid ${colors.border}`
                      : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                  <div
                    style={{
                      fontFamily: font.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      color: colors.textPrimary,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {paper.title}
                  </div>
                  {paper.authors && (
                    <div
                      style={{
                        fontFamily: font.sans,
                        fontSize: "12px",
                        color: colors.textTertiary,
                        marginTop: 2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {paper.authors}
                      {paper.year ? ` · ${paper.year}` : ""}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: "11px",
                    color: colors.textTertiary,
                    flexShrink: 0,
                  }}
                >
                  {new Date(paper.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup checklist */}
      <div>
        <SectionHeader title="Setup Checklist" />
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            overflow: "hidden",
          }}
        >
          {[
            {
              label: "Configure Cloudinary credentials",
              detail: "Set CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET in .env",
              done: false,
            },
            {
              label: "Connect PostgreSQL + pgvector",
              detail: "Run docker-compose up and set DATABASE_URL",
              done: false,
            },
            {
              label: "Add embedding model API key",
              detail: "OPENAI_API_KEY for text-embedding-3-large",
              done: false,
            },
            {
              label: "Configure Anthropic API key",
              detail: "ANTHROPIC_API_KEY for AI chat",
              done: false,
            },
            {
              label: "Upload your first paper",
              detail: "Head to Paper Vault and upload a PDF",
              done: total > 0,
            },
          ].map((item, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 18px",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${colors.border}` : "none",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `1.5px solid ${item.done ? colors.accent : colors.borderHigh}`,
                  background: item.done ? colors.accentMuted : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.done && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke={colors.accent}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: item.done
                      ? colors.textSecondary
                      : colors.textPrimary,
                    letterSpacing: "-0.01em",
                    textDecoration: item.done ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: "11px",
                    color: colors.textTertiary,
                    marginTop: 1,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
