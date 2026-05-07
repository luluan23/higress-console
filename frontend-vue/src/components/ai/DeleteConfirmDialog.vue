<template>
  <el-dialog :model-value="visible" width="480px" @close="$emit('cancel')">
    <template #header>
      <div class="ai-confirm-title">{{ title }}</div>
    </template>
    <p class="ai-confirm-message">{{ message }}</p>
    <template #footer>
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="danger" @click="$emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
})

defineEmits(['cancel', 'confirm'])
</script>