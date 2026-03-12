import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.tsx",
      "tests/components/**/*.test.tsx"
    ],
    exclude: ["tests/e2e/**"],
    css: true,
    coverage: {
      reporter: ["text", "html"],
      exclude: ["tests/**"]
    }
  }
});
