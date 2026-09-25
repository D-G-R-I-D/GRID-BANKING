/**
 * A random v4 UUID for idempotency keys, in any browser context.
 *
 * `crypto.randomUUID()` only exists on secure pages (https or localhost), so
 * it's undefined when the app is opened from a phone over the laptop's plain
 * http LAN address. `crypto.getRandomValues()` works everywhere, so build the
 * same RFC 4122 v4 shape from it.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40; // version 4
  b[8] = (b[8]! & 0x3f) | 0x80; // RFC 4122 variant
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
