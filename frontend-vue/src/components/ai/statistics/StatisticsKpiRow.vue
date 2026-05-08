<template>
  <div class="ai-statistics-kpi-row">
    <div v-for="item in items" :key="item.key" class="ai-statistics-kpi-card">
      <p class="ai-statistics-kpi-card__label">{{ item.label }}</p>
      <strong class="ai-statistics-kpi-card__value">{{ item.value }}</strong>
      <span class="ai-statistics-kpi-card__delta">{{ item.deltaLabel }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
})
</script>