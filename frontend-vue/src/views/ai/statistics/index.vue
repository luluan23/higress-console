<template>
  <div class="ai-console-page ai-console-page--table">
    <PageToolbar title="统计看板" description="AI 统计看板页面骨架已注册，后续任务会补齐图表与筛选交互。" />
  </div>
</template>

<script setup>
defineOptions({
  name: 'AiStatisticsPage',
})

import PageToolbar from '@/components/ai/PageToolbar.vue'
</script>