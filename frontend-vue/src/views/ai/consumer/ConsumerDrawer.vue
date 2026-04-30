<template>
  <t-drawer
    :visible="visible"
    :header="mode === 'create' ? '添加消费者' : '编辑消费者'"
    :footer="true"
    size="480px"
    @close="$emit('update:visible', false)"
  >
    <t-form ref="formRef" :data="form" :rules="rules" label-align="top">
      <t-form-item label="消费者名称" name="name">
        <t-input v-model="form.name" :disabled="mode === 'edit'" placeholder="例如：my-app" />
      </t-form-item>

      <t-form-item label="Credentials">
        <div class="cred-list">
          <div
            v-for="(cred, idx) in form.credentials"
            :key="idx"
            class="cred-list__card"
          >
            <div class="cred-list__row">
              <t-input value="key-auth" label="类型" disabled style="flex: 1" />
              <t-select v-model="cred.source" placeholder="来源" style="flex: 1">
                <t-option value="BEARER" label="BEARER" />
                <t-option value="HEADER" label="HEADER" />
                <t-option value="QUERY" label="QUERY" />
              </t-select>
              <t-button
                variant="text"
                theme="danger"
                :disabled="form.credentials.length === 1"
                @click="removeCred(idx)"
              >删除</t-button>
            </div>
            <div class="cred-list__row">
              <t-input v-model="cred.key" type="password" placeholder="Key 值" label="Key" style="flex: 1" />
            </div>
            <div class="cred-list__row">
              <div style="flex: 1">
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px">Values</div>
                <t-tag-input v-model="cred.values" placeholder="输入 value 后按 Enter" />
              </div>
            </div>
          </div>
          <t-button variant="outline" size="small" @click="addCred">+ 添加 Credential</t-button>
        </div>
      </t-form-item>
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
  name: 'ConsumerDrawer',
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
        name: [{ required: true, message: '消费者名称不能为空', trigger: 'blur' }],
      },
    }
  },
  watch: {
    visible(val) {
      if (val) this.form = this.buildForm(this.initialData)
    },
  },
  methods: {
    buildForm(data) {
      return {
        name: data?.name || '',
        credentials: data?.credentials?.length
          ? data.credentials.map((c) => ({ ...c, values: c.values || [] }))
          : [{ type: 'key-auth', source: 'BEARER', key: '', values: [] }],
      }
    },
    addCred() {
      this.form.credentials.push({ type: 'key-auth', source: 'BEARER', key: '', values: [] })
    },
    removeCred(idx) {
      this.form.credentials.splice(idx, 1)
    },
    async submit() {
      const result = await this.$refs.formRef.validate()
      if (result !== true) return
      // Validate credentials
      for (const c of this.form.credentials) {
        if (!c.key) return
      }
      const aiStore = useAiStore()
      const payload = {
        name: this.form.name,
        credentials: this.form.credentials.map((c) => ({
          type: 'key-auth',
          source: c.source,
          key: c.key,
          values: c.values,
        })),
      }
      this.saving = true
      try {
        if (this.mode === 'create') {
          await aiStore.createConsumer(payload)
        } else {
          await aiStore.updateConsumer(this.form.name, payload)
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
.cred-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__card {
    border: 1px solid var(--bg-border, #dde1ea);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-2, #eef0f6);
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
