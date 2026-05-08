<template>
  <div class="ai-statistics-panel">
    <div class="ai-statistics-panel__header">
      <div>
        <h3>异常洞察</h3>
        <span>经营异常与治理提示</span>
      </div>
    </div>

    <p v-if="!items.length" class="ai-statistics-panel__placeholder">当前窗口没有额外洞察。</p>

    <ul v-else class="ai-statistics-insights">
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
})
</script>