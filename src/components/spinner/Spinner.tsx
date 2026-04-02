import React from "react";
import { Box } from "@mantine/core";

interface SpinnerProps {
  visible: boolean;
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ visible, size = 64 }) => {
  if (!visible) return null;

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2000,
        backdropFilter: "blur(8px)",
        background: "rgba(3,7,18,0.7)",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes dot { 0%,80%,100% { transform:scale(0.6); opacity:0.3; } 40% { transform:scale(1); opacity:1; } }
        .sb-dots { display:flex; gap:7px; align-items:center; }
        .sb-dot {
          width:6px; height:6px; border-radius:50%;
          background:#4ade80;
          animation: dot 1.2s ease-in-out infinite;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            style={{ animation: "spin 1.4s linear infinite" }}
          >
            <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
            <path
              d="M32 6 A26 26 0 0 1 58 32"
              stroke="#4ade80"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#4ade80",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <div className="sb-dots">
          {[0, 1, 2].map((i) => (
            <div key={i} className="sb-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </Box>
  );
};

export default Spinner;