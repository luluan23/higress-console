<template>
  <div class="ai-statistics-empty-state">
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <el-button v-if="linkUrl" type="primary" tag="a" :href="linkUrl" target="_blank">查看原始监控</el-button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  linkUrl: { type: String, default: '' },
})
</script>