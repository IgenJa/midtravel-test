import { ImageResponse } from "next/og";

export const alt = "MidTravel — prémium utazási élmények";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(145deg, #0f766e 0%, #134e4a 42%, #0f172a 100%)",
          color: "#f8fafc",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#99f6e4",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Travel agency
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            MidTravel
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              maxWidth: 820,
              color: "#ccfbf1",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            Prémium vezetett utazások Európában
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#a7f3d0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          midtravel.hu
        </div>
      </div>
    ),
    { ...size }
  );
}
