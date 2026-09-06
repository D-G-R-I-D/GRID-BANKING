import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "components/**"],
      thresholds: {
        // Keep the money and validation code honest.
        "lib/money.ts": { statements: 90, branches: 80, functions: 90 },
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
