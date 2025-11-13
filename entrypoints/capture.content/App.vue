<template>
  <CropperScreen
    v-if="screenshotDataUrl"
    v-model:url="screenshotDataUrl"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  ></CropperScreen>
</template>

<script lang="ts" setup>
import { onMessage, sendMessage } from '@/messaging'
import CropperScreen from './components/CropperScreen.vue'
const screenshotDataUrl = ref('')

onMessage('areaScreenshot', async ({ data }) => {
  if (screenshotDataUrl.value) return false
  screenshotDataUrl.value = data
  return true
})

function handleCancel() {
  screenshotDataUrl.value = ''
}

async function handleConfirm(data: string) {
  await sendMessage('confirmScreenshot', data)
  handleCancel()
}

onMounted(() => {
  window.addEventListener('resize', handleCancel)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleCancel)
})
</script>
