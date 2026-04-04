import React from "react";
import { Box } from "@mantine/core";

interface SpinnerProps {
  visible: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ visible }) => {
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
        backdropFilter: "blur(10px)",
        background: "rgba(3, 7, 18, 0.72)",
      }}
    >
      <style>{`
        @keyframes sb-wave {
          0%, 100% { transform: scaleY(0.3); opacity: 0.3; }
          50%       { transform: scaleY(1);   opacity: 1;   }
        }
        .sb-bar {
          width: 4px;
          height: 28px;
          border-radius: 2px;
          background: #4ade80;
          transform-origin: center;
          animation: sb-wave 1.1s ease-in-out infinite;
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 40 }}>
        {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
          <div key={i} className="sb-bar" style={{ animationDelay: `${delay}s` }} />
        ))}
      </div>
    </Box>
  );
};

export default Spinner;