import { colors, font, radius } from "../../lib/theme";

const variants = {
  primary: {
    background: colors.accent,
    color: colors.textInverse,
    border: "none",
    hoverBg: colors.accentDim,
  },
  secondary: {
    background: "transparent",
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    hoverBg: colors.bgOverlay,
  },
  ghost: {
    background: "transparent",
    color: colors.textSecondary,
    border: "none",
    hoverBg: colors.bgOverlay,
  },
  danger: {
    background: "transparent",
    color: colors.danger,
    border: `1px solid ${colors.dangerSurface}`,
    hoverBg: colors.dangerSurface,
  },
};

export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  style = {},
  type = "button",
  fullWidth = false,
}) {
  const v = variants[variant] ?? variants.secondary;
  const padding = size === "sm" ? "6px 12px" : size === "lg" ? "11px 22px" : "8px 16px";
  const fontSize = size === "sm" ? "12px" : size === "lg" ? "15px" : "13px";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding,
        borderRadius: radius.md,
        border: v.border,
        background: disabled ? colors.bgOverlay : v.background,
        color: disabled ? colors.textTertiary : v.color,
        fontFamily: font.sans,
        fontSize,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, color 0.15s, opacity 0.15s",
        width: fullWidth ? "100%" : undefined,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = disabled ? colors.bgOverlay : v.background;
      }}
    >
      {children}
    </button>
  );
}
