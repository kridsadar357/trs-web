import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #022c22 0%, #0f172a 45%, #065f46 100%)",
          borderRadius: 108,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 340,
            height: 340,
            borderRadius: 72,
            background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
            border: "2px solid rgba(255,255,255,0.15)",
            fontSize: 168,
            lineHeight: 1,
          }}
        >
          💬
        </div>
      </div>
    ),
    { ...size }
  );
}
