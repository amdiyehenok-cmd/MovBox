import { ImageResponse } from "next/og";

/** Dynamic favicon — a stylized "H" in burgundy on a dark rounded square. */
export const size = { width: 32, height: 32 };
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
          background:
            "linear-gradient(135deg, #0d0909 0%, #140d0e 50%, #1b1113 100%)",
          borderRadius: 8,
          color: "#800020",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "serif",
        }}
      >
        H
      </div>
    ),
    { ...size }
  );
}
