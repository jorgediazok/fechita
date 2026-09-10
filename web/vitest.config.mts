import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resuelve el alias "@/..." del tsconfig sin plugin extra.
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        resolve: { tsconfigPaths: true },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        resolve: { tsconfigPaths: true },
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.integration.test.ts"],
          setupFiles: ["./test/setup-integration.ts"],
          // La primera corrida baja el binario de mongod (~mongodb-memory-server).
          hookTimeout: 120_000,
          // Mongoose + un único servidor en memoria compartido: sin paralelismo entre archivos.
          fileParallelism: false,
        },
      },
    ],
  },
});
