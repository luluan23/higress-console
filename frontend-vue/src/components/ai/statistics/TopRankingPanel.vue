<template>
  <div class="ai-statistics-panel">
    <div class="ai-statistics-panel__header">
      <div>
        <h3>{{ title }}</h3>
        <span>{{ subtitle }}</span>
      </div>
    </div>

    <p v-if="!rows.length" class="ai-statistics-panel__placeholder">暂无数据</p>

    <button
      v-for="row in rows"
      :key="row.dimension"
      class="ai-statistics-ranking-item"
      type="button"
      @click="$emit('select', row.dimension)"
    >
      <span>{{ row.dimension }}</span>
      <strong>{{ row.value }}</strong>
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  rows: { type: Array, required: true },
})

defineEmits(['select'])
</script>