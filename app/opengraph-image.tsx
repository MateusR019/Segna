import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Segna — Dashboard Pessoal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f0f0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, #6366f130 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, #22c55e18 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Grid dots pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px #6366f140",
            }}
          >
            <span style={{ color: "white", fontSize: 36, fontWeight: 800 }}>S</span>
          </div>

          <span style={{ color: "white", fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            Segna
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h1
              style={{
                color: "white",
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                margin: 0,
              }}
            >
              Seu dashboard
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                pessoal.
              </span>
            </h1>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 24,
                fontWeight: 400,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Finanças, hábitos, notas, cripto e muito mais —<br />
              tudo em um só lugar. Open source e grátis.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "💰 Finanças", color: "#22c55e" },
              { label: "🏋️ Hábitos", color: "#a78bfa" },
              { label: "📝 Notas", color: "#06b6d4" },
              { label: "₿ Cripto", color: "#f59e0b" },
              { label: "✅ Tarefas", color: "#6366f1" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  borderRadius: 9999,
                  background: color + "18",
                  border: `1px solid ${color}40`,
                  color: color,
                  fontSize: 16,
                  fontWeight: 600,
                  gap: 6,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#4a4a4a",
            fontSize: 18,
          }}
        >
          <span>segna.space</span>
          <span style={{ color: "#2a2a2a" }}>·</span>
          <span>Open source</span>
          <span style={{ color: "#2a2a2a" }}>·</span>
          <span>Feito no Brasil 🇧🇷</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
