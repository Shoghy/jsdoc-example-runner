import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  minifyWhitespace: true,
  noExternal: ["./package.json"],
});
