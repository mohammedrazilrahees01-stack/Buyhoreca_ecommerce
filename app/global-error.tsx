"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body style={{ margin: 0, background: "#f5f7f8", color: "#15212b", fontFamily: "Arial, sans-serif" }}>
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <section style={{ width: "min(680px,100%)", padding: 40, borderRadius: 28, background: "#fff", border: "1px solid #e4e8eb", textAlign: "center" }}>
          <img src="/images/buyhoreca_logo.png" alt="BuyHoreca" style={{ width: 190, maxWidth: "70%", margin: "0 auto 28px" }} />
          <h1 style={{ margin: 0, fontSize: "clamp(30px,6vw,54px)" }}>Please reload BuyHoreca.</h1>
          <p style={{ color: "#66737d", lineHeight: 1.7 }}>A temporary application error prevented the storefront from loading.</p>
          <button onClick={() => reset()} style={{ marginTop: 18, minHeight: 48, padding: "0 22px", border: 0, borderRadius: 999, background: "#00a879", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Reload storefront</button>
        </section>
      </main>
    </body></html>
  );
}
