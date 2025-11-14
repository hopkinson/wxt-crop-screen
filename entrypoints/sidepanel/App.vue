<template>
  <div class="crop-container">
    屏幕预览：
    <div class="crop-container__preivew">
      <img :src="screenshotData" v-if="screenshotData" />
    </div>
    <button @click="getScreenStream" class="crop-container__operation">
      屏幕截屏
    </button>
  </div>
</template>
<script lang="ts" setup>
import { onMessage, sendMessage } from "@/messaging";

import { useMediaScreen } from "../sidepanel/hooks/useMediaScreen";

const { getScreenStream, screenshotData } = useMediaScreen();

const cropperImg = ref("");

const removeListener = onMessage("confirmScreenshot", async ({ data }) => {
  cropperImg.value = data;
  return true;
});

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function handleCropArea() {
  const tab = await getCurrentTab();
  const image = await sendMessage("screenshot", tab);
  const { id = 0 } = tab;
  await sendMessage("areaScreenshot", image, { tabId: id });
}

onUnmounted(() => {
  removeListener();
});
</script>
<style lang="css" scoped>
.crop-container__preivew {
  width: 100%;
  height: 40vh;
  border: 1px dashed #eaeaea;
  overflow: hidden;
}
.crop-container__preivew img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.crop-container__operation {
  margin-top: 6px;
  appearance: none;
  border: 1px solid #999;
  color: #222;
  background-color: white;
  display: inline-block;
  margin-right: 8px;
}

hr {
  margin: 10px 0;
  color: #eaaeae;
}
</style>
