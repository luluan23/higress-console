<template>
  <t-drawer
    :visible="visible"
    :header="mode === 'create' ? '添加路由' : '编辑路由'"
    :footer="true"
    size="520px"
    @close="$emit('update:visible', false)"
  >
    <t-form ref="formRef" :data="form" :rules="rules" label-align="top">
      <!-- Route name -->
      <t-form-item label="路由名称" name="name">
        <t-input v-model="form.name" :disabled="mode === 'edit'" placeholder="例如：my-ai-route" />
      </t-form-item>

      <!-- Domains -->
      <t-form-item label="域名列表" name="domains">
        <t-tag-input v-model="form.domains" placeholder="输入域名后按 Enter" />
      </t-form-item>

      <!-- Upstreams -->
      <t-form-item label="上游配置">
        <div class="upstream-list">
          <div v-for="(u, idx) in form.upstreams" :key="idx" class="upstream-list__row">
            <t-select v-model="u.provider" placeholder="Provider" style="flex: 2">
              <t-option
                v-for="p in aiStore.providers"
                :key="p.name"
                :value="p.name"
                :label="p.name"
              />
            </t-select>
            <t-input-number v-model="u.weight" :min="1" :max="100" style="width: 80px" placeholder="权重" />
            <t-textarea v-model="u.modelMapping" placeholder="模型映射 (可选)" :rows="1" style="flex: 3" />
            <t-button
              variant="text"
              theme="danger"
              :disabled="form.upstreams.length === 1"
              @click="removeUpstream(idx)"
            >删除</t-button>
          </div>
          <t-button variant="outline" size="small" @click="addUpstream">+ 添加上游</t-button>
        </div>
      </t-form-item>

      <!-- Auth -->
      <t-form-item label="鉴权">
        <t-switch v-model="form.authEnabled" />
        <span class="switch-label">{{ form.authEnabled ? '已启用' : '关闭' }}</span>
      </t-form-item>
      <t-form-item v-if="form.authEnabled" label="允许的消费者">
        <t-select
          v-model="form.allowedConsumers"
          multiple
          placeholder="选择消费者"
        >
          <t-option
            v-for="c in aiStore.consumers"
            :key="c.name"
            :value="c.name"
            :label="c.name"
          />
        </t-select>
      </t-form-item>

      <!-- Fallback -->
      <t-form-item label="Fallback">
        <t-switch v-model="form.fallbackEnabled" />
        <span class="switch-label">{{ form.fallbackEnabled ? '已启用' : '关闭' }}</span>
      </t-form-item>
      <template v-if="form.fallbackEnabled">
        <t-form-item label="Fallback Provider">
          <t-select v-model="form.fallbackProvider" placeholder="选择 Provider">
            <t-option
              v-for="p in aiStore.providers"
              :key="p.name"
              :value="p.name"
              :label="p.name"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="Fallback 策略">
          <t-select v-model="form.fallbackPolicy">
            <t-option value="RAND" label="RAND（随机）" />
            <t-option value="SEQ" label="SEQ（顺序）" />
          </t-select>
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
  name: 'RouteDrawer',
  props: {
    visible: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    initialData: { type: Object, default: null },
  },
  emits: ['update:visible', 'saved'],
  data() {
    return {
      saving: false,
      form: this.buildForm(this.initialData),
      rules: {
        name: [{ required: true, message: '路由名称不能为空', trigger: 'blur' }],
        domains: [{ required: true, message: '至少填写一个域名', trigger: 'change' }],
      },
    }
  },
  computed: {
    aiStore() { return useAiStore() },
  },
  watch: {
    visible(val) {
      if (val) {
        this.form = this.buildForm(this.initialData)
        this.aiStore.fetchConsumers()
      }
    },
  },
  methods: {
    buildForm(data) {
      return {
        name: data?.name || '',
        domains: data?.domains || [],
        upstreams: data?.upstreams?.length
          ? data.upstreams.map((u) => ({ ...u }))
          : [{ provider: '', weight: 1, modelMapping: '' }],
        authEnabled: data?.authConfig?.enabled || false,
        allowedConsumers: data?.authConfig?.allowedConsumers || [],
        fallbackEnabled: data?.fallbackConfig?.enabled || false,
        fallbackProvider: data?.fallbackConfig?.provider || '',
        fallbackPolicy: data?.fallbackConfig?.policy || 'RAND',
      }
    },
    addUpstream() {
      this.form.upstreams.push({ provider: '', weight: 1, modelMapping: '' })
    },
    removeUpstream(idx) {
      this.form.upstreams.splice(idx, 1)
    },
    async submit() {
      const result = await this.$refs.formRef.validate()
      if (result !== true) return
      if (!this.form.upstreams.length) return
      const aiStore = useAiStore()
      const payload = {
        name: this.form.name,
        domains: this.form.domains,
        upstreams: this.form.upstreams.filter((u) => u.provider),
        authConfig: {
          enabled: this.form.authEnabled,
          allowedConsumers: this.form.allowedConsumers,
        },
        fallbackConfig: {
          enabled: this.form.fallbackEnabled,
          provider: this.form.fallbackProvider,
          policy: this.form.fallbackPolicy,
        },
      }
      this.saving = true
      try {
        if (this.mode === 'create') {
          await aiStore.createRoute(payload)
        } else {
          await aiStore.updateRoute(this.form.name, payload)
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
.upstream-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.switch-label {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary, #4a5568);
}
</style>
