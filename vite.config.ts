import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: { port: 3000 },
  preview: { port: 3000 },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
    rolldownOptions: {
      external: ["cloudflare:workers"],
    },
  },
});
