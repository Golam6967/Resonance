import { colors, font, radius } from "../../lib/theme";

// ── Badge ──────────────────────────────────────────────────────────────────────
const badgeMap = {
  indexed: { bg: colors.accentMuted, color: colors.accent, label: "Indexed" },
  parsing: { bg: colors.warnSurface, color: colors.warn, label: "Parsing" },
  queued:  { bg: colors.bgOverlay,   color: colors.textTertiary, label: "Queued" },
  error:   { bg: colors.dangerSurface, color: colors.danger, label: "Error" },
};

export function StatusBadge({ status }) {
  const s = badgeMap[status] ?? badgeMap.queued;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        borderRadius: radius.full,
        background: s.bg,
        color: s.color,
        fontFamily: font.sans,
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: radius.sm,
        background: colors.bgOverlay,
        border: `1px solid ${colors.border}`,
        color: colors.textSecondary,
        fontFamily: font.sans,
        fontSize: "11px",
        fontWeight: 400,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, selected = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? colors.bgCardHover : colors.bgCard,
        border: `1px solid ${selected ? colors.borderHigh : colors.border}`,
        borderRadius: radius.lg,
        padding: "16px 18px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, background 0.15s",
        outline: selected ? `1px solid ${colors.accentGlow}` : "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = colors.borderMid;
          e.currentTarget.style.background = colors.bgCardHover;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.background = colors.bgCard;
        }
      }}
    >
      {children}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style = {} }) {
  return (
    <div
      style={{
        height: 1,
        background: colors.border,
        ...style,
      }}
    />
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = colors.accent }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        gap: "12px",
      }}
    >
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.lg,
            background: colors.bgOverlay,
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textTertiary,
            fontSize: 20,
            marginBottom: 4,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          color: colors.textPrimary,
          fontFamily: font.sans,
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            color: colors.textTertiary,
            fontFamily: font.sans,
            fontSize: "13px",
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, onKeyDown, placeholder, style = {}, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: "9px 13px",
        color: colors.textPrimary,
        fontFamily: font.sans,
        fontSize: "13px",
        outline: "none",
        width: "100%",
        transition: "border-color 0.15s",
        letterSpacing: "-0.01em",
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = colors.accentSub; }}
      onBlur={(e) => { e.target.style.borderColor = colors.border; }}
    />
  );
}
