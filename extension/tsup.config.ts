import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "background/service-worker": "background/service-worker.ts",
    "content/linkedin": "content/linkedin.ts",
  },
  format: ["esm"],
  outDir: "dist",
  clean: true,
  minify: true,
  target: "chrome120",
});
