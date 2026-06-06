import { colors, font } from "../lib/theme";

const pageMeta = {
  dashboard: { title: "Dashboard", description: "Overview of your research workspace" },
  vault:     { title: "Paper Vault", description: "Manage and explore your uploaded papers" },
  chat:      { title: "AI Chat", description: "Ask questions across your paper collection" },
};

export function Topbar({ active }) {
  const meta = pageMeta[active] ?? pageMeta.dashboard;

  return (
    <header
      style={{
        height: 56,
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        background: colors.bg,
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontFamily: font.sans,
            fontSize: "14px",
            fontWeight: 600,
            color: colors.textPrimary,
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {meta.title}
        </h1>
        <p
          style={{
            fontFamily: font.sans,
            fontSize: "12px",
            color: colors.textTertiary,
            margin: "3px 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          {meta.description}
        </p>
      </div>
    </header>
  );
}
