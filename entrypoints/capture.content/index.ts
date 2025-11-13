import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  runAt: "document_end",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "wxt-crop-screen",
      position: "inline",
      anchor: "html",
      onMount: async (container) => {
        const app = createApp(App);
        app.mount(container);
        return app;
      },
    });
    ui.mount();
  },
});
