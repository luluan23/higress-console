<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建服务提供者' : '编辑服务提供者' }}</template>
    <div class="ai-drawer-body">
      <el-form label-position="top">
        <el-form-item label="Provider 名称">
          <el-input
            :model-value="localModel.name"
            :disabled="mode === 'edit'"
            @update:model-value="updateField('name', $event)"
          />
        </el-form-item>
        <el-form-item label="Provider 类型">
          <el-select
            :model-value="localModel.type"
            @update:model-value="updateField('type', $event)"
          >
            <el-option label="Qwen" value="qwen" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="Claude" value="claude" />
          </el-select>
        </el-form-item>
        <el-form-item label="协议">
          <el-select
            :model-value="localModel.protocol"
            @update:model-value="updateField('protocol', $event)"
          >
            <el-option label="openai/v1" value="openai/v1" />
            <el-option label="original" value="original" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理名称">
          <el-input
            :model-value="localModel.proxyName"
            @update:model-value="updateField('proxyName', $event)"
          />
        </el-form-item>
        <el-form-item label="Tokens">
          <TokenListField
            :model-value="localModel.tokens"
            @update:model-value="updateField('tokens', $event)"
          />
        </el-form-item>
        <el-form-item label="启用 Token Failover">
          <el-switch
            :model-value="localModel.failoverEnabled"
            @update:model-value="updateField('failoverEnabled', $event)"
          />
        </el-form-item>
        <template v-if="showAdvancedFailover">
          <el-form-item label="失败阈值">
            <el-input-number
              :model-value="localModel.failureThreshold"
              :min="1"
              @update:model-value="updateField('failureThreshold', $event)"
            />
          </el-form-item>
          <el-form-item label="成功阈值">
            <el-input-number
              :model-value="localModel.successThreshold"
              :min="1"
              @update:model-value="updateField('successThreshold', $event)"
            />
          </el-form-item>
          <el-form-item label="健康检查间隔(秒)">
            <el-input-number
              :model-value="localModel.healthCheckInterval"
              :min="1"
              @update:model-value="updateField('healthCheckInterval', $event)"
            />
          </el-form-item>
          <el-form-item label="健康检查超时(秒)">
            <el-input-number
              :model-value="localModel.healthCheckTimeout"
              :min="1"
              @update:model-value="updateField('healthCheckTimeout', $event)"
            />
          </el-form-item>
          <el-form-item label="健康检查模型">
            <el-input
              :model-value="localModel.healthCheckModel"
              @update:model-value="updateField('healthCheckModel', $event)"
            />
          </el-form-item>
        </template>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('submit', localModel)">
        保存
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TokenListField from '@/components/ai/provider/TokenListField.vue'

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

const showAdvancedFailover = computed(
  () => localModel.value.type === 'qwen' && localModel.value.failoverEnabled
)

function updateField(field, value) {
  localModel.value = {
    ...localModel.value,
    [field]: value,
  }
}
</script>