"use client";
import { useState } from "react";

const BASE = "/mockups/";
const JERSEY_STYLES = [
  { id: "round-neck-half", label: "Round Neck", sub: "Half Sleeve", icon: "👕", image: BASE + "ChatGPT Image May 25, 2026, 10_56_11 PM.png" },
  { id: "vneck-half", label: "V-Neck", sub: "Half Sleeve", icon: "👕", image: BASE + "ChatGPT Image May 25, 2026, 10_45_50 PM.png" },
  { id: "polo-half", label: "Polo Collar", sub: "Half Sleeve", icon: "👕", image: BASE + "ChatGPT Image May 25, 2026, 10_39_26 PM.png" },
  { id: "round-neck-full", label: "Round Neck", sub: "Full Sleeve", icon: "🧥", image: BASE + "ChatGPT Image May 25, 2026, 10_57_22 PM.png" },
  { id: "polo-full", label: "Polo Collar", sub: "Full Sleeve", icon: "🧥", image: BASE + "ChatGPT Image May 25, 2026, 10_54_43 PM.png" },
  { id: "vcol-full", label: "V-Collar", sub: "Full Sleeve", icon: "🧥", image: BASE + "ChatGPT Image May 25, 2026, 10_50_00 PM.png" },
  { id: "sleeveless-vneck", label: "Sleeveless", sub: "V-Neck", icon: "🎽", image: BASE + "ChatGPT Image May 25, 2026, 10_47_15 PM.png" },
  { id: "sleeveless-round", label: "Sleeveless", sub: "Round Neck", icon: "🎽", image: BASE + "ChatGPT Image May 25, 2026, 10_48_24 PM.png" },
  { id: "chinese-half", label: "Chinese Collar", sub: "Half Sleeve", icon: "👔", image: BASE + "ChatGPT Image May 25, 2026, 10_58_42 PM.png" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
type Player = { name: string; number: string; size: string };

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([{ name: "", number: "", size: "M" }]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const selectedStyleObj = JERSEY_STYLES.find((s) => s.id === selectedStyle);

  async function handleGenerate() {
    if (!selectedStyle) { setError("Please select a jersey style first."); return; }
    if (!prompt.trim()) { setError("Please describe your design."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mockupStyle: `${selectedStyleObj?.label} ${selectedStyleObj?.sub}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const validPlayers = players.filter((p) => p.name.trim());

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-1px", color: "#c8ff00" }}>NEXTPRINT</span>
          <span style={{ fontSize: "12px", color: "#666" }}>AI Jersey Designer</span>
        </div>
        <a href="https://nextprint.in" style={{ color: "#666", fontSize: "13px", textDecoration: "none" }}>← Back to store</a>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>

        <section style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c8ff00", marginBottom: "16px", fontWeight: 700 }}>01 — CHOOSE STYLE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {JERSEY_STYLES.map((style) => (
              <button key={style.id} onClick={() => setSelectedStyle(style.id)} style={{ background: selectedStyle === style.id ? "#c8ff00" : "#141414", border: selectedStyle === style.id ? "2px solid #c8ff00" : "2px solid #222", borderRadius: "12px", padding: "12px 8px", cursor: "pointer", color: selectedStyle === style.id ? "#000" : "#ccc", textAlign: "center", transition: "all 0.15s" }}>
                <img src={style.image} alt={style.label} style={{ width: "70px", height: "70px", objectFit: "contain", marginBottom: "6px" }} />
                <div style={{ fontWeight: 700, fontSize: "11px" }}>{style.label}</div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>{style.sub}</div>
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c8ff00", marginBottom: "16px", fontWeight: 700 }}>02 — DESCRIBE YOUR DESIGN</div>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Blue jersey with lion design, gold accents, for cricket team Tigers..." rows={4} style={{ width: "100%", background: "#141414", border: "2px solid #222", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "15px", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          {error && <div style={{ marginTop: "10px", padding: "12px 16px", background: "#2a0000", border: "1px solid #ff4444", borderRadius: "8px", color: "#ff8888", fontSize: "13px" }}>{error}</div>}
          <button onClick={handleGenerate} disabled={loading} style={{ width: "100%", marginTop: "14px", padding: "18px", background: loading ? "#444" : "#c8ff00", color: loading ? "#888" : "#000", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
            {loading ? "⏳ Generating your design..." : "Generate Design ✦"}
          </button>
        </section>

        {result && selectedStyleObj && (
          <section style={{ marginBottom: "40px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c8ff00", marginBottom: "16px", fontWeight: 700 }}>03 — YOUR DESIGN PREVIEW</div>
            <div style={{ background: "#141414", border: "2px solid #222", borderRadius: "16px", padding: "24px" }}>

              {result.colors && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px", letterSpacing: "1px" }}>AI GENERATED COLORS</div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {Object.entries(result.colors).map(([name, hex]: any) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: hex, border: "2px solid #333" }} />
                        <div>
                          <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase" }}>{name}</div>
                          <div style={{ fontSize: "12px", color: "#ccc" }}>{hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: "11px", color: "#666", marginBottom: "12px", letterSpacing: "1px" }}>YOUR JERSEY PREVIEW</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={selectedStyleObj.image} alt="Jersey mockup" style={{ width: "400px", maxWidth: "100%", display: "block", borderRadius: "8px" }} />
                  {result.colors?.primary && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: result.colors.primary, mixBlendMode: "multiply", borderRadius: "8px", opacity: 0.75 }} />
                  )}
                  {result.colors?.secondary && (
                    <div style={{ position: "absolute", top: "18%", left: 0, right: 0, height: "12%", background: result.colors.secondary, mixBlendMode: "multiply", opacity: 0.85 }} />
                  )}
                  {result.colors?.accent && (
                    <div style={{ position: "absolute", bottom: "18%", left: 0, right: 0, height: "8%", background: result.colors.accent, mixBlendMode: "multiply", opacity: 0.7 }} />
                  )}
                </div>
              </div>

              <div style={{ marginTop: "16px", fontSize: "13px", color: "#aaa", lineHeight: 1.6, background: "#0d0d0d", padding: "14px", borderRadius: "8px" }}>
                {result.refinedPrompt}
              </div>
              <div style={{ marginTop: "12px", padding: "10px 14px", background: "#0d1a00", borderRadius: "8px", border: "1px solid #2a4000", fontSize: "12px", color: "#8dc800" }}>
                ✅ Style: {result.mockupStyle}
              </div>
            </div>
          </section>
        )}

        {result && (
          <section style={{ marginBottom: "40px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c8ff00", marginBottom: "16px", fontWeight: 700 }}>04 — TEAM ROSTER</div>
            <div style={{ background: "#141414", border: "2px solid #222", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 40px", gap: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", color: "#666", letterSpacing: "1px" }}>PLAYER NAME</div>
                <div style={{ fontSize: "11px", color: "#666", letterSpacing: "1px" }}>NUMBER</div>
                <div style={{ fontSize: "11px", color: "#666", letterSpacing: "1px" }}>SIZE</div>
                <div></div>
              </div>
              {players.map((player, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 40px", gap: "10px", marginBottom: "10px" }}>
                  <input type="text" placeholder="Player name" value={player.name} maxLength={15} onChange={(e) => { const u = [...players]; u[i].name = e.target.value; setPlayers(u); }} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
                  <input type="number" placeholder="No." value={player.number} min={0} max={99} onChange={(e) => { const u = [...players]; u[i].number = e.target.value; setPlayers(u); }} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
                  <select value={player.size} onChange={(e) => { const u = [...players]; u[i].size = e.target.value; setPlayers(u); }} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 8px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit" }}>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} disabled={players.length === 1} style={{ background: "#1a0000", border: "1px solid #330000", borderRadius: "8px", color: players.length === 1 ? "#333" : "#ff5555", cursor: players.length === 1 ? "not-allowed" : "pointer", fontSize: "16px" }}>×</button>
                </div>
              ))}
              <button onClick={() => setPlayers([...players, { name: "", number: "", size: "M" }])} style={{ marginTop: "6px", padding: "10px 20px", background: "transparent", border: "2px dashed #333", borderRadius: "8px", color: "#888", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>+ Add Team Member</button>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1f1f1f" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#888", fontSize: "14px" }}>Total Jerseys</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{validPlayers.length || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #1f1f1f", marginTop: "8px" }}>
                  <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>Total</span>
                  <span style={{ color: "#c8ff00", fontSize: "20px", fontWeight: 800 }}>₹{validPlayers.length * 499 || "—"}</span>
                </div>
                {!orderPlaced ? (
                  <button onClick={() => setOrderPlaced(true)} disabled={validPlayers.length === 0} style={{ width: "100%", marginTop: "12px", padding: "18px", background: validPlayers.length === 0 ? "#1a1a1a" : "#c8ff00", color: validPlayers.length === 0 ? "#444" : "#000", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 800, cursor: validPlayers.length === 0 ? "not-allowed" : "pointer" }}>
                    {validPlayers.length === 0 ? "Add players to order" : `Place Order — ₹${validPlayers.length * 499}`}
                  </button>
                ) : (
                  <div style={{ marginTop: "12px", padding: "20px", background: "#0d1a00", border: "2px solid #2a4000", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
                    <div style={{ color: "#c8ff00", fontWeight: 800, fontSize: "16px", marginBottom: "6px" }}>Order Received!</div>
                    <div style={{ color: "#8dc800", fontSize: "13px" }}>Our team will contact you to confirm the design and payment.</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!result && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎽</div>
            <div style={{ color: "#888", marginBottom: "4px" }}>Select a style and describe your design</div>
            <div style={{ color: "#555", fontSize: "13px" }}>AI will apply your colors onto the selected mockup</div>
          </div>
        )}
      </div>
    </main>
  );
}
