/**
 * Draw a transfer receipt as a PNG, in the app's own look, for sharing to
 * WhatsApp & co., saving, or copying. Plain canvas — no dependency. Browser
 * only (call from event handlers).
 */

export interface ReceiptImageData {
  headline: string; // "Sent to Ada Obi"
  amount: string; // "₦5,000.00"
  rows: { label: string; value: string }[];
}

const W = 1080;
const PAD = 72;
const INK = "#16171C";
const SOFT = "#5A5B66";
const FAINT = "#8A8C98";
const LINE = "#E7E6E0";
const PAPER = "#FAFAF8";
const CARD = "#171826";
const ACCENT = "#6366D9";
const POSITIVE = "#2F9E68";

/** The app's loaded font stacks (next/font gives them hashed names). */
function fontStacks() {
  const css = getComputedStyle(document.body);
  const sans = css.getPropertyValue("--font-sans-stack").trim();
  const serif = css.getPropertyValue("--font-serif-stack").trim();
  return {
    sans: sans ? `${sans}, Arial, sans-serif` : "Arial, sans-serif",
    serif: serif ? `${serif}, Georgia, serif` : "Georgia, serif",
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shorten text with "…" so it fits `max` px. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max)
    t = t.slice(0, -1);
  return `${t}…`;
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  const u = s / 32;
  ctx.fillStyle = CARD;
  roundRect(ctx, x, y, s, s, 8 * u);
  ctx.fill();
  const cell = (cx: number, cy: number, color: string) => {
    ctx.fillStyle = color;
    roundRect(ctx, x + cx * u, y + cy * u, 7 * u, 7 * u, 1.5 * u);
    ctx.fill();
  };
  cell(8, 8, "#F3F3F8");
  cell(17, 8, "#F3F3F8");
  cell(8, 17, "#F3F3F8");
  cell(17, 17, "#8B8EF0");
}

export async function renderReceiptPng(data: ReceiptImageData): Promise<Blob> {
  await document.fonts?.ready;
  const { sans, serif } = fontStacks();

  const ROW_H = 84;
  const cardTop = 236;
  const cardH = 360 + data.rows.length * ROW_H;
  const H = cardTop + cardH + 170;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Paper
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Brand row
  drawLogo(ctx, PAD, 80, 64);
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.font = `500 44px ${serif}`;
  ctx.fillText("GRID", PAD + 88, 114);
  const gridW = ctx.measureText("GRID ").width;
  ctx.fillStyle = ACCENT;
  ctx.fillText("•", PAD + 88 + gridW, 114);
  const dotW = ctx.measureText("• ").width;
  ctx.fillStyle = INK;
  ctx.fillText("PAY", PAD + 88 + gridW + dotW, 114);
  ctx.textAlign = "right";
  ctx.fillStyle = FAINT;
  ctx.font = `600 26px ${sans}`;
  ctx.fillText("TRANSFER RECEIPT", W - PAD, 114);
  ctx.textAlign = "left";

  // Card
  ctx.save();
  ctx.shadowColor = "rgba(22,23,28,0.10)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, PAD, cardTop, W - PAD * 2, cardH, 36);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  roundRect(ctx, PAD, cardTop, W - PAD * 2, cardH, 36);
  ctx.stroke();

  // Tick
  const cx = W / 2;
  ctx.fillStyle = "rgba(47,158,104,0.14)";
  ctx.beginPath();
  ctx.arc(cx, cardTop + 92, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = POSITIVE;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 18, cardTop + 93);
  ctx.lineTo(cx - 5, cardTop + 106);
  ctx.lineTo(cx + 20, cardTop + 80);
  ctx.stroke();

  // Headline + amount
  ctx.textAlign = "center";
  ctx.fillStyle = SOFT;
  ctx.font = `400 32px ${sans}`;
  ctx.fillText(fit(ctx, data.headline, W - PAD * 4), cx, cardTop + 178);
  ctx.fillStyle = INK;
  ctx.font = `500 84px ${serif}`;
  ctx.fillText(fit(ctx, data.amount, W - PAD * 4), cx, cardTop + 262);
  ctx.textAlign = "left";

  // Rows
  const left = PAD + 48;
  const right = W - PAD - 48;
  let y = cardTop + 340;
  for (const row of data.rows) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();

    const mid = y + ROW_H / 2;
    ctx.fillStyle = SOFT;
    ctx.font = `400 30px ${sans}`;
    ctx.fillText(row.label, left, mid);
    const labelW = ctx.measureText(row.label).width;

    const status = row.label === "Status";
    ctx.fillStyle = status ? POSITIVE : INK;
    ctx.font = `600 30px ${sans}`;
    ctx.textAlign = "right";
    ctx.fillText(fit(ctx, row.value, right - left - labelW - 40), right, mid);
    ctx.textAlign = "left";
    y += ROW_H;
  }

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = FAINT;
  ctx.font = `400 26px ${sans}`;
  ctx.fillText(
    "GRID • PAY · a student project, not a licensed bank",
    cx,
    H - 84,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
}
