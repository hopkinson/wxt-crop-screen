import { onMessage } from "@/messaging";

export default defineBackground(() => {
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  onMessage("screenshot", async ({ data: tab }) => {
    const { windowId } = tab;
    const image = await browser.tabs.captureVisibleTab(windowId, {
      format: "png",
    });
    return image;
  });
});
