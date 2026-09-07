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
      include: ["lib/money.ts", "lib/phone.ts"],
      thresholds: {
        // Keep the pure money/phone helpers honest.
        "lib/money.ts": { statements: 85, functions: 100 },
        "lib/phone.ts": { statements: 85, functions: 100 },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // `server-only` throws when imported outside an RSC build; stub it in tests.
      "server-only": resolve(__dirname, "test/server-only-stub.ts"),
    },
  },
});
