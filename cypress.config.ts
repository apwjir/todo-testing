import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    setupNodeEvents(on, config) {
      config.env = config.env || {};
      config.env.FRONTEND_URL =
        process.env.FRONTEND_URL || "http://localhost:5173";
      return config;
    },
  },
});
