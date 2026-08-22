import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
});
