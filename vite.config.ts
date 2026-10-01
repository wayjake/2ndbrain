import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// CodePress Live Dev Server preview HMR (managed)
const previewBasePath = process.env.CODEPRESS_BASE_PATH || "/";
const previewBase =
  previewBasePath === "/"
    ? "/"
    : `/${previewBasePath.replace(/^\/+|\/+$/g, "")}/`;
const hmrClientPort = process.env.CODEPRESS_HMR_CLIENT_PORT
  ? Number(process.env.CODEPRESS_HMR_CLIENT_PORT)
  : undefined;
const configuredHmrProtocol = process.env.CODEPRESS_HMR_PROTOCOL;
const hmrProtocol =
  configuredHmrProtocol === "ws" || configuredHmrProtocol === "wss"
    ? configuredHmrProtocol
    : undefined;

export default defineConfig({
  base: previewBase,
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    allowedHosts: true,
    hmr: {
      ...(hmrClientPort ? { clientPort: hmrClientPort } : {}),
      ...(hmrProtocol ? { protocol: hmrProtocol } : {}),
    },
  },
});
