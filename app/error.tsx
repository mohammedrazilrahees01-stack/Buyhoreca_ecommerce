"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("BuyHoreca application error:", error); }, [error]);
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "48px 20px", fontFamily: "Arial, sans-serif", color: "#15212b" }}>
      <section style={{ width: "min(680px,100%)", padding: "40px", border: "1px solid #e4e8eb", borderRadius: "28px", background: "#fff", boxShadow: "0 20px 50px rgba(21,33,43,.08)" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#66737d" }}>BuyHoreca</p>
        <h1 style={{ margin: "12px 0 0", fontSize: "clamp(32px,6vw,58px)", lineHeight: .98 }}>We’re refreshing the store.</h1>
        <p style={{ margin: "18px 0 0", lineHeight: 1.7, color: "#66737d" }}>Something interrupted this page. Your Shopify catalogue and checkout are still separate from this display error.</p>
        <button onClick={() => reset()} style={{ marginTop: 24, minHeight: 48, padding: "0 22px", border: 0, borderRadius: 999, background: "#00a879", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Try again</button>
      </section>
    </main>
  );
}
