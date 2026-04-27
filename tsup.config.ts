import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    validate: "src/validate.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  target: "es2022",
  external: ["react"],
});
