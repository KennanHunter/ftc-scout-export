"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#0a0a0a", color: "#ededed", fontFamily: "sans-serif" }}>
        <div style={{ padding: 32, maxWidth: 480, margin: "80px auto" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 16, wordBreak: "break-word" }}>
            {error.message}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
