"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

const MOCKUPS = [
  { id: "round-half", label: "Round Neck", sleeve: "Half Sleeve", emoji: "👕" },
  { id: "vneck-half", label: "V-Neck", sleeve: "Half Sleeve", emoji: "👕" },
  { id: "polo-half", label: "Polo Collar", sleeve: "Half Sleeve", emoji: "👕" },
  { id: "round-full", label: "Round Neck", sleeve: "Full Sleeve", emoji: "🧥" },
  { id: "polo-full", label: "Polo Collar", sleeve: "Full Sleeve", emoji: "🧥" },
  { id: "vneck-full", label: "V-Collar", sleeve: "Full Sleeve", emoji: "🧥" },
  { id: "sleeveless-v", label: "Sleeveless", sleeve: "V-Neck", emoji: "🎽" },
  { id: "sleeveless-round", label: "Sleeveless", sleeve: "Round Neck", emoji: "🎽" },
  { id: "chinese-collar", label: "Chinese Collar", sleeve: "Half Sleeve", emoji: "👔" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

interface Design {
  designDescription: string;
  colors: { primary: string; secondary: string; accent: string; text: string };
  pattern: string;
  teamName: string;
  number: string;
  designElements: string[];
}

interface Player {
  id: number;
  name: string;
  number: string;
  size: string;
}

export default function JerseyDesigner() {
  const [selectedMockup, setSelectedMockup] = useState(MOCKUPS[0]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"design" | "order">("design");
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "", number: "", size: "M" },
    { id: 2, name: "", number: "", size: "M" },
  ]);
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateDesign = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mockupStyle: `${selectedMockup.label} ${selectedMockup.sleeve}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDesign(data.design);
    } catch (e: any) {
      setError(e.message || "Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!design || !canvasRef.current) return;
    drawJersey(canvasRef.current, design, selectedMockup.id);
  }, [design, selectedMockup]);

  const addPlayer = () => {
    setPlayers(p => [...p, { id: Date.now(), name: "", number: "", size: "M" }]);
  };

  const removePlayer = (id: number) => {
    setPlayers(p => p.filter(pl => pl.id !== id));
  };

  const updatePlayer = (id: number, field: string, value: string) => {
    setPlayers(p => p.map(pl => pl.id === id ? { ...pl, [field]: value } : pl));
  };

  const totalQty = Object.values(sizeQty).reduce((a, b) => a + (b || 0), 0) +
    players.filter(p => p.name).length;

  const submitOrder = () => {
    setOrderSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoText}>NEXT</span>
            <span className={styles.logoDot}>PRINT</span>
          </div>
          <div className={styles.headerTag}>AI Jersey Designer</div>
          <a href="https://nextprint.in" className={styles.storeLink}>← Back to store</a>
        </div>
      </header>

      {!orderSubmitted ? (
        <main className={styles.main}>
          {step === "design" ? (
            <div className={styles.designLayout}>
              {/* Left — Mockup selector + prompt */}
              <div className={styles.leftCol}>
                <div className={styles.sectionTitle}>01 — Choose Style</div>
                <div className={styles.mockupGrid}>
                  {MOCKUPS.map(m => (
                    <button
                      key={m.id}
                      className={`${styles.mockupBtn} ${selectedMockup.id === m.id ? styles.mockupBtnActive : ""}`}
                      onClick={() => { setSelectedMockup(m); setDesign(null); }}
                    >
                      <span className={styles.mockupEmoji}>{m.emoji}</span>
                      <span className={styles.mockupLabel}>{m.label}</span>
                      <span className={styles.mockupSleeve}>{m.sleeve}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: "2rem" }}>02 — Describe Your Design</div>
                <div className={styles.promptBox}>
                  <textarea
                    className={styles.promptInput}
                    placeholder={`e.g. "Blue jersey with gold stripes, team name EAGLES on chest, number 7 on back, white collar"`}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <button
                    className={styles.generateBtn}
                    onClick={generateDesign}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? (
                      <span className={styles.loadingDots}>Generating<span>.</span><span>.</span><span>.</span></span>
                    ) : "Generate Design ✦"}
                  </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {design && (
                  <div className={styles.refineBox}>
                    <div className={styles.sectionTitle}>03 — Refine</div>
                    <p className={styles.refineHint}>Not happy? Change the prompt and generate again!</p>
                    <div className={styles.designDesc}>{design.designDescription}</div>
                    <div className={styles.colorChips}>
                      {Object.entries(design.colors).map(([key, val]) => (
                        <div key={key} className={styles.colorChip}>
                          <div className={styles.colorDot} style={{ background: val }} />
                          <span>{key}: {val}</span>
                        </div>
                      ))}
                    </div>
                    <button className={styles.proceedBtn} onClick={() => setStep("order")}>
                      Proceed to Order →
                    </button>
                  </div>
                )}
              </div>

              {/* Right — Preview canvas */}
              <div className={styles.rightCol}>
                <div className={styles.sectionTitle}>Preview</div>
                <div className={styles.previewBox}>
                  {!design ? (
                    <div className={styles.previewEmpty}>
                      <div className={styles.previewEmptyIcon}>🎽</div>
                      <div className={styles.previewEmptyText}>
                        Select a style and describe your design<br />
                        <span>AI will generate a preview</span>
                      </div>
                    </div>
                  ) : (
                    <canvas ref={canvasRef} width={320} height={380} className={styles.canvas} />
                  )}
                  {loading && (
                    <div className={styles.previewLoading}>
                      <div className={styles.spinner} />
                      <span>Designing your jersey...</span>
                    </div>
                  )}
                </div>
                <div className={styles.selectedStyle}>
                  {selectedMockup.emoji} {selectedMockup.label} — {selectedMockup.sleeve}
                </div>
              </div>
            </div>
          ) : (
            /* Order Form */
            <div className={styles.orderLayout}>
              <button className={styles.backBtn} onClick={() => setStep("design")}>← Back to design</button>

              <div className={styles.orderHeader}>
                <div className={styles.sectionTitle}>Your Design Summary</div>
                <div className={styles.designSummary}>
                  <canvas ref={canvasRef} width={200} height={240} className={styles.canvasSmall} />
                  <div className={styles.summaryDetails}>
                    <div><b>Style:</b> {selectedMockup.label} {selectedMockup.sleeve}</div>
                    {design?.teamName && <div><b>Team:</b> {design.teamName}</div>}
                    <div><b>Pattern:</b> {design?.pattern}</div>
                    <div className={styles.colorChips} style={{ marginTop: "8px" }}>
                      {design && Object.entries(design.colors).map(([key, val]) => (
                        <div key={key} className={styles.colorChip}>
                          <div className={styles.colorDot} style={{ background: val }} />
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.orderGrid}>
                {/* Player details */}
                <div className={styles.orderSection}>
                  <div className={styles.sectionTitle}>Player Details</div>
                  <div className={styles.playerHeader}>
                    <span>Player Name</span><span>Number</span><span>Size</span><span></span>
                  </div>
                  {players.map(p => (
                    <div key={p.id} className={styles.playerRow}>
                      <input
                        className={styles.orderInput}
                        placeholder="Player name"
                        value={p.name}
                        onChange={e => updatePlayer(p.id, "name", e.target.value)}
                      />
                      <input
                        className={styles.orderInput}
                        placeholder="No."
                        maxLength={3}
                        value={p.number}
                        onChange={e => updatePlayer(p.id, "number", e.target.value)}
                      />
                      <select
                        className={styles.orderSelect}
                        value={p.size}
                        onChange={e => updatePlayer(p.id, "size", e.target.value)}
                      >
                        {SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className={styles.removeBtn} onClick={() => removePlayer(p.id)}>×</button>
                    </div>
                  ))}
                  <button className={styles.addPlayerBtn} onClick={addPlayer}>+ Add player</button>
                </div>

                {/* Size wise qty */}
                <div className={styles.orderSection}>
                  <div className={styles.sectionTitle}>Size-wise Quantity</div>
                  <div className={styles.sizeGrid}>
                    {SIZES.map(s => (
                      <div key={s} className={styles.sizeRow}>
                        <label className={styles.sizeLabel}>{s}</label>
                        <input
                          type="number"
                          min="0"
                          className={styles.qtyInput}
                          value={sizeQty[s] || ""}
                          onChange={e => setSizeQty(q => ({ ...q, [s]: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total pieces</span>
                    <span className={styles.totalVal}>{totalQty} pcs</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className={styles.orderSection} style={{ marginTop: "1.5rem" }}>
                <div className={styles.sectionTitle}>Contact Details</div>
                <div className={styles.contactGrid}>
                  <input className={styles.orderInput} placeholder="Your name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <input className={styles.orderInput} placeholder="Phone / WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                  <input className={styles.orderInput} placeholder="Email address" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
              </div>

              <button className={styles.submitBtn} onClick={submitOrder}>
                Submit Order Enquiry →
              </button>
            </div>
          )}
        </main>
      ) : (
        <div className={styles.successPage}>
          <div className={styles.successIcon}>✦</div>
          <h1 className={styles.successTitle}>Order Received!</h1>
          <p className={styles.successText}>
            Thank you {customerName}! Our team will contact you at {customerPhone} within 24 hours with your quote.
          </p>
          <a href="https://nextprint.in" className={styles.successBtn}>← Back to NextPrint Store</a>
        </div>
      )}
    </div>
  );
}

function drawJersey(canvas: HTMLCanvasElement, design: Design, style: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { primary, secondary, accent, text } = design.colors;
  const isFullSleeve = style.includes("full");
  const isSleeveless = style.includes("sleeveless");
  const isChinese = style.includes("chinese");

  // Background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, W, H);

  // Draw jersey body
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(90, 65);
    ctx.lineTo(55, 110);
    ctx.lineTo(35, 150);
    ctx.lineTo(40, 300);
    ctx.lineTo(280, 300);
    ctx.lineTo(285, 150);
    ctx.lineTo(265, 110);
    ctx.lineTo(230, 65);
    ctx.closePath();
  };

  // Apply pattern
  if (design.pattern === "gradient") {
    const grad = ctx.createLinearGradient(0, 60, 0, 300);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    bodyPath();
    ctx.fillStyle = grad;
    ctx.fill();
  } else if (design.pattern === "stripes") {
    bodyPath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (let x = 30; x < 300; x += 24) {
      ctx.fillStyle = secondary;
      ctx.fillRect(x, 60, 12, 250);
    }
    ctx.restore();
  } else if (design.pattern === "diagonal") {
    bodyPath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 14;
    for (let i = -200; i < 400; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 60);
      ctx.lineTo(i + 200, 320);
      ctx.stroke();
    }
    ctx.restore();
  } else if (design.pattern === "geometric") {
    bodyPath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(160, 60);
    ctx.lineTo(290, 200);
    ctx.lineTo(290, 300);
    ctx.lineTo(160, 300);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    bodyPath();
    ctx.fillStyle = primary;
    ctx.fill();
  }

  // Body border
  bodyPath();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sleeves
  if (!isSleeveless) {
    const drawSleeve = (isLeft: boolean) => {
      ctx.beginPath();
      if (isLeft) {
        if (isFullSleeve) {
          ctx.moveTo(90, 65);
          ctx.lineTo(55, 110);
          ctx.lineTo(10, 270);
          ctx.lineTo(35, 278);
          ctx.lineTo(72, 130);
          ctx.lineTo(105, 90);
        } else {
          ctx.moveTo(90, 65);
          ctx.lineTo(55, 110);
          ctx.lineTo(35, 150);
          ctx.lineTo(60, 158);
          ctx.lineTo(75, 125);
          ctx.lineTo(105, 90);
        }
      } else {
        if (isFullSleeve) {
          ctx.moveTo(230, 65);
          ctx.lineTo(265, 110);
          ctx.lineTo(310, 270);
          ctx.lineTo(285, 278);
          ctx.lineTo(248, 130);
          ctx.lineTo(215, 90);
        } else {
          ctx.moveTo(230, 65);
          ctx.lineTo(265, 110);
          ctx.lineTo(285, 150);
          ctx.lineTo(260, 158);
          ctx.lineTo(245, 125);
          ctx.lineTo(215, 90);
        }
      }
      ctx.closePath();
      ctx.fillStyle = secondary;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    drawSleeve(true);
    drawSleeve(false);
  }

  // Collar
  if (isChinese) {
    ctx.beginPath();
    ctx.roundRect(130, 55, 60, 28, 4);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.stroke();
  } else if (style.includes("round") || style.includes("sleeveless-round")) {
    ctx.beginPath();
    ctx.arc(160, 70, 32, Math.PI, 2 * Math.PI);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (style.includes("vneck") || style.includes("sleeveless-v")) {
    ctx.beginPath();
    ctx.moveTo(128, 65);
    ctx.lineTo(160, 100);
    ctx.lineTo(192, 65);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.stroke();
  } else if (style.includes("polo")) {
    ctx.beginPath();
    ctx.moveTo(128, 65);
    ctx.lineTo(128, 95);
    ctx.lineTo(160, 102);
    ctx.lineTo(192, 95);
    ctx.lineTo(192, 65);
    ctx.fillStyle = accent;
    ctx.fill();
    // Collar wings
    ctx.beginPath();
    ctx.moveTo(128, 65); ctx.lineTo(108, 78); ctx.lineTo(128, 90); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(192, 65); ctx.lineTo(212, 78); ctx.lineTo(192, 90); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.stroke();
  }

  // Team name
  const teamName = design.teamName || "";
  if (teamName) {
    ctx.font = "bold 22px 'Bebas Neue', sans-serif";
    ctx.fillStyle = text;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(teamName.toUpperCase(), 160, 175);
    ctx.shadowBlur = 0;
  }

  // Number
  const num = design.number || "";
  if (num) {
    ctx.font = "bold 52px 'Bebas Neue', sans-serif";
    ctx.fillStyle = text;
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.9;
    ctx.fillText(num, 160, 255);
    ctx.globalAlpha = 1;
  }
}
