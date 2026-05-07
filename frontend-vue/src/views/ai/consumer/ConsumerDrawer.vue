<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建消费者' : '编辑消费者' }}</template>
    <el-form label-position="top">
      <el-form-item label="消费者名称">
        <el-input
          :model-value="localModel.name"
          :disabled="mode === 'edit'"
          @update:model-value="updateField('name', $event)"
        />
      </el-form-item>
      <el-form-item label="认证凭证">
        <CredentialListField
          :model-value="localModel.credentials"
          @update:model-value="updateField('credentials', $event)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('submit', localModel)">
        保存
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import CredentialListField from '@/components/ai/consumer/CredentialListField.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    localModel.value = { ...value }
  },
  { deep: true, immediate: true }
)

function updateField(field, value) {
  localModel.value = {
    ...localModel.value,
    [field]: value,
  }
}
</script>