<template>
  <div class="ai-page-toolbar">
    <div>
      <h1 class="ai-page-toolbar__title">{{ title }}</h1>
      <p v-if="description" class="ai-page-toolbar__description">{{ description }}</p>
    </div>
    <div class="ai-page-toolbar__actions">
      <slot name="filters" />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>