/**
 * A stable, human-friendly reference for a transfer, derived from its id.
 * Deterministic (same id → same reference), no extra column needed.
 * Example: "GRD-7K3F-9QX2"
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // no I/L/O/U — avoids confusion

export function transferReference(id: string): string {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33) ^ id.charCodeAt(i);
  }
  let n = hash >>> 0;
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length) + id.charCodeAt(i % id.length);
  }
  return `GRD-${out.slice(0, 4)}-${out.slice(4, 8)}`;
}
