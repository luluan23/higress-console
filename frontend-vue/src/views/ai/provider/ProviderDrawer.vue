<template>
  <t-drawer
    :visible="visible"
    :header="mode === 'create' ? '添加模型' : '编辑模型'"
    :footer="true"
    size="480px"
    @close="$emit('update:visible', false)"
  >
    <t-form
      ref="formRef"
      :data="form"
      :rules="rules"
      label-align="top"
    >
      <t-form-item label="Provider 名称" name="name">
        <t-input v-model="form.name" :disabled="mode === 'edit'" placeholder="例如：my-openai" />
      </t-form-item>
      <t-form-item label="Provider 类型" name="type">
        <t-select v-model="form.type" placeholder="选择类型">
          <t-option value="openai" label="OpenAI" />
          <t-option value="azure" label="Azure OpenAI" />
          <t-option value="qwen" label="通义千问 (Qwen)" />
          <t-option value="gemini" label="Google Gemini" />
          <t-option value="claude" label="Anthropic Claude" />
          <t-option value="moonshot" label="Moonshot" />
          <t-option value="deepseek" label="DeepSeek" />
        </t-select>
      </t-form-item>
      <t-form-item label="协议" name="protocol">
        <t-select v-model="form.protocol" placeholder="选择协议">
          <t-option value="openai" label="OpenAI 兼容" />
          <t-option value="azure" label="Azure" />
          <t-option value="native" label="原生协议" />
        </t-select>
      </t-form-item>

      <!-- Token list -->
      <t-form-item label="Token 列表">
        <div class="token-list">
          <div v-for="(token, idx) in form.tokens" :key="idx" class="token-list__row">
            <t-input
              v-model="form.tokens[idx]"
              type="password"
              placeholder="API Key / Token"
              style="flex: 1"
            />
            <t-button
              variant="text"
              theme="danger"
              :disabled="form.tokens.length === 1"
              @click="removeToken(idx)"
            >删除</t-button>
          </div>
          <t-button variant="outline" size="small" @click="addToken">+ 添加 Token</t-button>
          <div class="token-list__hint">多 Token 将启用轮询负载均衡</div>
        </div>
      </t-form-item>

      <!-- Failover -->
      <t-form-item label="Failover">
        <t-switch v-model="form.failoverEnabled" />
        <span class="switch-label">{{ form.failoverEnabled ? '已启用' : '关闭' }}</span>
      </t-form-item>
      <template v-if="form.failoverEnabled">
        <t-form-item label="失败阈值（次）">
          <t-input-number v-model="form.failoverThreshold" :min="1" :max="100" />
        </t-form-item>
        <t-form-item label="冷却时间（秒）">
          <t-input-number v-model="form.failoverCooldown" :min="1" :max="3600" />
        </t-form-item>
      </template>
    </t-form>

    <template #footer>
      <t-space>
        <t-button variant="outline" @click="$emit('update:visible', false)">取消</t-button>
        <t-button theme="primary" :loading="saving" @click="submit">确认</t-button>
      </t-space>
    </template>
  </t-drawer>
</template>

<script>
import { useAiStore } from '@/stores/modules/aiStore'

export default {
  name: 'ProviderDrawer',
  props: {
    visible: { type: Boolean, default: false },
    mode: { type: String, default: 'create' }, // 'create' | 'edit'
    initialData: { type: Object, default: null },
  },
  emits: ['update:visible', 'saved'],
  data() {
    return {
      saving: false,
      form: this.buildForm(this.initialData),
      rules: {
        name: [{ required: true, message: 'Provider 名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '请选择 Provider 类型', trigger: 'change' }],
      },
    }
  },
  watch: {
    initialData(val) {
      this.form = this.buildForm(val)
    },
    visible(val) {
      if (val) {
        this.form = this.buildForm(this.initialData)
      }
    },
  },
  methods: {
    buildForm(data) {
      return {
        name: data?.name || '',
        type: data?.type || '',
        protocol: data?.protocol || 'openai',
        tokens: data?.tokens?.length ? [...data.tokens] : [''],
        failoverEnabled: data?.failoverConfig?.enabled || false,
        failoverThreshold: data?.failoverConfig?.failureThreshold || 3,
        failoverCooldown: data?.failoverConfig?.cooldownPeriod || 30,
      }
    },
    addToken() {
      this.form.tokens.push('')
    },
    removeToken(idx) {
      this.form.tokens.splice(idx, 1)
    },
    async submit() {
      const result = await this.$refs.formRef.validate()
      if (result !== true) return
      const aiStore = useAiStore()
      const payload = {
        name: this.form.name,
        type: this.form.type,
        protocol: this.form.protocol,
        tokens: this.form.tokens.filter(Boolean),
        failoverConfig: {
          enabled: this.form.failoverEnabled,
          failureThreshold: this.form.failoverThreshold,
          cooldownPeriod: this.form.failoverCooldown,
        },
      }
      this.saving = true
      try {
        if (this.mode === 'create') {
          await aiStore.createProvider(payload)
        } else {
          await aiStore.updateProvider(this.form.name, payload)
        }
        this.$emit('saved')
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.token-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__hint {
    font-size: 11px;
    color: var(--text-muted, #8896a9);
  }
}

.switch-label {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary, #4a5568);
}
</style>
