<template>
  <span :class="['ai-status-tag', `is-${tone}`]">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: 'default' },
})
</script>