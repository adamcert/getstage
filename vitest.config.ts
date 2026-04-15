import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // stub out Next.js server-only guard so tests can import server modules
      "server-only": path.resolve(__dirname, "lib/__mocks__/server-only.ts"),
    },
  },
});
