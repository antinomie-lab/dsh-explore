<script setup>
// 每篇文章的标识图形：tree = 插件树，dialogue = 引号
defineProps({ motif: { type: String, default: 'tree' } })
</script>

<template>
  <svg v-if="motif === 'tree'" class="glyph" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="2" width="6" height="6" rx="1.5" />
    <rect x="2" y="16" width="6" height="6" rx="1.5" />
    <rect x="16" y="16" width="6" height="6" rx="1.5" />
    <path class="bond" d="M12 8v4M12 12H5v4M12 12h7v4" />
  </svg>
  <svg v-else class="glyph" viewBox="0 0 24 24" aria-hidden="true">
    <!-- 烧瓶：对照实验，液体填充 -->
    <path
      class="liquid"
      d="M8 14 H16 L18.4 18.4 A2.2 2.2 0 0 1 16.4 20.8 H7.6 A2.2 2.2 0 0 1 5.6 18.4 Z"
    />
    <path class="bond" d="M9.5 3h5M10.8 3v5.4l-5.6 10.4A2 2 0 0 0 7 21.2h10a2 2 0 0 0 1.8-2.4L13.2 8.4V3" />
  </svg>
</template>

<style scoped>
.glyph {
  width: 15px;
  height: 15px;
  flex: none;
}

.glyph rect {
  fill: var(--blue);
}

.glyph .bond {
  fill: none;
  stroke: var(--blue);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.glyph .liquid {
  fill: var(--blue);
  opacity: 0.28;
}
</style>
