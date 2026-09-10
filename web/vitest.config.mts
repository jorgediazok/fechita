import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resuelve el alias "@/..." del tsconfig sin plugin extra.
    tsconfigPaths: true,
  },
  test: {
    // Toda la lógica bajo test es pura (sin DOM ni DB) — entorno node, rápido.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
