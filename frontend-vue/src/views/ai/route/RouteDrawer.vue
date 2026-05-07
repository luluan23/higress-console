<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建 AI 路由' : '编辑 AI 路由' }}</template>
    <el-form label-position="top">
      <el-form-item label="路由名称">
        <el-input
          :model-value="localModel.name"
          :disabled="mode === 'edit'"
          @update:model-value="updateField('name', $event)"
        />
      </el-form-item>
      <el-form-item label="域名">
        <el-select
          :model-value="localModel.domains"
          multiple
          allow-create
          filterable
          default-first-option
          @update:model-value="updateField('domains', $event)"
        />
      </el-form-item>
      <el-form-item label="路径匹配值">
        <el-input
          :model-value="localModel.pathPredicate.matchValue"
          @update:model-value="updatePathPredicate('matchValue', $event)"
        />
      </el-form-item>
      <el-form-item label="上游 Provider">
        <UpstreamListField
          :model-value="localModel.upstreams"
          :provider-options="providerOptions"
          @update:model-value="updateField('upstreams', $event)"
        />
      </el-form-item>
      <el-form-item label="启用鉴权">
        <el-switch
          :model-value="localModel.authEnabled"
          @update:model-value="updateField('authEnabled', $event)"
        />
      </el-form-item>
      <el-form-item v-if="localModel.authEnabled" label="允许访问的消费者">
        <el-select
          :model-value="localModel.allowedConsumers"
          multiple
          @update:model-value="updateField('allowedConsumers', $event)"
        >
          <el-option
            v-for="option in consumerOptions"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用 Fallback">
        <el-switch
          :model-value="localModel.fallbackEnabled"
          @update:model-value="updateField('fallbackEnabled', $event)"
        />
      </el-form-item>
      <template v-if="localModel.fallbackEnabled">
        <el-form-item label="Fallback 策略">
          <el-select
            :model-value="localModel.fallbackStrategy"
            @update:model-value="updateField('fallbackStrategy', $event)"
          >
            <el-option label="RAND" value="RAND" />
            <el-option label="SEQ" value="SEQ" />
          </el-select>
        </el-form-item>
        <el-form-item label="Fallback Upstreams">
          <el-select
            :model-value="localModel.fallbackUpstreams"
            multiple
            @update:model-value="updateField('fallbackUpstreams', $event)"
          >
            <el-option
              v-for="option in providerOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Fallback 响应码">
          <el-select
            :model-value="localModel.fallbackResponseCodes"
            multiple
            allow-create
            filterable
            default-first-option
            @update:model-value="updateField('fallbackResponseCodes', $event)"
          />
        </el-form-item>
      </template>
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
import UpstreamListField from '@/components/ai/route/UpstreamListField.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, required: true },
  consumerOptions: { type: Array, default: () => [] },
  providerOptions: { type: Array, default: () => [] },
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

function updatePathPredicate(field, value) {
  localModel.value = {
    ...localModel.value,
    pathPredicate: {
      ...localModel.value.pathPredicate,
      [field]: value,
    },
  }
}
</script>