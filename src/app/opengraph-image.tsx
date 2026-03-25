import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SaaSKit — Next.js + Supabase + Creem Boilerplate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f0eb",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "4px solid #000",
            borderRadius: "24px",
            padding: "48px 64px",
            boxShadow: "8px 8px 0px #000",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#0a0a0a",
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            SaaSKit
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#ff6b2c",
              fontWeight: 700,
              marginTop: 16,
            }}
          >
            Next.js + Supabase + Creem
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#666",
              marginTop: 12,
            }}
          >
            Ship your SaaS in hours, not weeks
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
