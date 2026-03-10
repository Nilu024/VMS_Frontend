import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// api url from .env file (must use VITE_ prefix)

export default defineConfig(({ mode }) => {
  // load all env variables for current mode
  const env = loadEnv(mode, process.cwd(), "");
  let backendUrl = env.VITE_BACKEND_URL;

  // if we're building for production, always use relative paths
  if (mode === 'production') {
    if (backendUrl) {
      console.warn(
        `Production build ignoring VITE_BACKEND_URL="${backendUrl}". ` +
        'API requests will use relative `/api` path.'
      );
    }
    backendUrl = ''; // force relative
  }

  // log backend URL for debugging
  console.log("VITE_BACKEND_URL=", backendUrl || '(relative)');
  if (mode !== 'production' && !backendUrl) {
    console.warn(
      "No backend URL defined; API proxy will not work. Check your .env file and restart vite."
    );
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
