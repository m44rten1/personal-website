import { defineConfig } from "vite";
import { readdirSync, existsSync } from "fs";
import { resolve } from "path";

function getBlogInputs(): Record<string, string> {
  const blogDir = resolve(__dirname, "blog");
  if (!existsSync(blogDir)) {
    return {};
  }

  const inputs: Record<string, string> = {};
  const files = readdirSync(blogDir).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const name = file.replace(".html", "");
    inputs[`blog/${name}`] = resolve(blogDir, file);
  }

  return inputs;
}

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...getBlogInputs(),
      },
    },
  },
});
