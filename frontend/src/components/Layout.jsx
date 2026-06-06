import { colors } from "../lib/theme";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Layout({ active, setActive, children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg,
      }}
    >
      <Sidebar active={active} setActive={setActive} />

      <div
        style={{
          marginLeft: 220,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar active={active} />
        <main
          style={{
            flex: 1,
            padding: "28px 28px",
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
