import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  screenshot(tab: Browser.tabs.Tab): string;
  areaScreenshot(image: string): boolean;
  confirmScreenshot(image: string): boolean;
}
export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>({
    logger: console,
  });
