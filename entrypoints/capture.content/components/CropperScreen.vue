<template>
  <div
    class="screen-cropper--container"
    :class="{
      'is-selectioned': isSelectioned,
    }"
  >
    <img ref="imageRef" :src="url" />
    <!-- 宽高 -->
    <div
      v-if="isSelectionedRange"
      v-show="isSelectioned"
      class="screen-cropper__size"
      :style="{
        transform: `translate(${selection.x}px,${selection.y}px)`,
      }"
    >
      {{ selection.width }} &times {{ selection.height }}
    </div>
    <!-- 操作菜单 -->
    <div
      v-show="isOperated"
      v-if="isSelectionedRange"
      ref="operationRef"
      class="screen-cropper__operation"
      :style="{
        transform: `translate(${operation.x}px,${operation.y}px)`,
      }"
    >
      <div
        class="screen-cropper__operation--container"
        @click="handleCancel"
        title="取消截图"
      >
        <img :src="iconCancel" alt="operation-cancel" />
      </div>
      <div
        class="screen-cropper__operation--container"
        @click="handleConfirm"
        title="确认截图"
      >
        <img :src="iconConfirm" alt="operation-confirm" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { throttle } from "ts-debounce-throttle";

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (event: "cancel"): void;
  (event: "confirm", data: string): void;
}>();

const TIP_SIZE = { width: 80, height: 24 };
const OPERATION_SIZE = { width: 72, height: 34 };
const SAFE_MARIN = 4;
const url = defineModel("url", { default: "" });
const imageRef = ref<HTMLImageElement>();
const operationRef = ref<HTMLElement>();

const isOperated = ref(false);
const isSelectioned = ref(false);

const selection = reactive({ width: 0, height: 0, x: 0, y: 0 });
const operation = reactive({ x: 0, y: 0 });

const iconConfirm = browser.runtime.getURL("/images/MingcuteCheckLine.png");
const iconCancel = browser.runtime.getURL("/images/MingcuteCloseLine.png");

let cropper: Cropper | null = null;

const isSelectionedRange = computed(
  () => selection.width >= SAFE_MARIN || +selection.height >= SAFE_MARIN
);

onMounted(() => {
  if (imageRef.value) {
    cropper = new Cropper(imageRef.value, {
      viewMode: 1,
      autoCropArea: 0,
      background: false,
      guides: false,
      rotatable: false,
      movable: false,
      autoCrop: false,
      scalable: false,
      zoomable: false,
      zoomOnTouch: false,
      zoomOnWheel: false,
      highlight: false,
      minCropBoxWidth: SAFE_MARIN,
      toggleDragModeOnDblclick: false,
      minCropBoxHeight: SAFE_MARIN,
      cropstart: () => {
        isSelectioned.value = true;
      },
      cropend: () => {
        const cropBoxDataResult = cropper?.getCropBoxData();
        isSelectioned.value = !!Object.keys(cropBoxDataResult!).length;
        isOperated.value = true;
      },
      cropmove: () => {
        isOperated.value = false;
      },
      crop: throttle(() => {
        const cropBoxDataResult = cropper?.getCropBoxData();
        if (cropBoxDataResult) {
          const { width, height, left, top } = cropBoxDataResult;
          // 更新选择框信息
          selection.height = Math.round(height);
          selection.width = Math.round(width);
          selection.x = left;
          selection.y =
            top < TIP_SIZE.height
              ? top + height + SAFE_MARIN
              : top - TIP_SIZE.height - SAFE_MARIN;
          // 操作菜单位置信息
          operation.x = left + width - OPERATION_SIZE.width;
          const defaultBottom = top + height + SAFE_MARIN;
          const isCoveredByCropBox =
            window.innerHeight - (top + height) <
            OPERATION_SIZE.height + SAFE_MARIN;
          if (isCoveredByCropBox) {
            operation.y = top - OPERATION_SIZE.height - SAFE_MARIN;
          } else {
            operation.y = defaultBottom;
          }
        }
      }, 20),
    });
  }
});

function resetStatus() {
  isOperated.value = false;
  isSelectioned.value = false;
}

// 裁剪图片
const handleConfirm = () => {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas();
  const croppedImageDataURL = canvas.toDataURL("image/png");
  emit("confirm", croppedImageDataURL);
  resetStatus();
};

function handleCancel() {
  cropper?.destroy();
  isOperated.value = false;
  resetStatus();
  emit("cancel");
}

onBeforeUnmount(() => {
  handleCancel();
});

const handleKeyDown = async (e: KeyboardEvent) => {
  console.log(e);
  if (e.key === "Escape") {
    handleCancel();
  }
  if (e.key === "Enter") {
    await handleConfirm();
  }
};

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});
</script>
