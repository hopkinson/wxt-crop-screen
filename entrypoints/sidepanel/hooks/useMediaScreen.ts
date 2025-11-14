export function useMediaScreen() {
  const mediaStream = ref<MediaStream | null>(null);
  const screenshotData = ref<string | null>(null);

  // 停止屏幕共享的通用函数
  function stopScreenShare() {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStream.value = null;
    }
  }

  // 获取屏幕流并自动截图
  async function getScreenStream() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("您的浏览器不支持屏幕共享功能。");
      }
      mediaStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      mediaStream.value.getTracks().forEach((track) => {
        track.onended = () => {
          stopScreenShare();
        };
      });
      await captureScreenFromStream();
    } catch (error) {
      stopScreenShare();
    }
  }

  // 从视频流截取图片并自动停止分享
  async function captureScreenFromStream() {
    if (!mediaStream.value) {
      throw new Error("没有可用的屏幕流");
    }
    try {
      const video = document.createElement("video");
      video.srcObject = mediaStream.value;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = reject;
        setTimeout(() => reject(new Error("视频加载超时")), 5000);
      });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("无法获取Canvas上下文");
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      screenshotData.value = canvas.toDataURL("image/png", 1);
      stopScreenShare();
      video.srcObject = null;
      return Promise.resolve(screenshotData.value);
    } catch (error) {
      throw new Error(
        `截图处理失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 手动触发重新截图（如果需要）
  async function retakeScreenshot() {
    screenshotData.value = null;
    await getScreenStream();
  }

  return {
    mediaStream,
    screenshotData,
    getScreenStream,
    captureScreenFromStream,
    stopScreenShare,
    retakeScreenshot,
  };
}
