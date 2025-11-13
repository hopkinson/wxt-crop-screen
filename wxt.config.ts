import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    host_permissions: ["<all_urls>"],
    permissions: ["tabs", "activeTab"],
    web_accessible_resources: [
      {
        resources: ["images/*.png"],
        matches: ["<all_urls>"],
      },
    ],
    action: {},
  },
});
