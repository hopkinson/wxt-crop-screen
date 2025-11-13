<template>
  <div class="crop-container">
    截图预览：
    <div class="crop-container__preivew">
      <img :src="cropperImg" v-if="cropperImg" />
    </div>
    <button @click="handleCropArea" class="crop-container__operation">
      区域截屏
    </button>
  </div>
</template>
<script lang="ts" setup>
import { onMessage, sendMessage } from "@/messaging";

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
  height: 400px;
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
}
</style>
