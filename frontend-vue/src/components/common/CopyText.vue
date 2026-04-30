<template>
  <span class="copy-text" :class="{ 'is-mono': monospace }">
    <span class="copy-text__label">{{ label || text }}</span>
    <t-button
      variant="text"
      size="small"
      class="copy-text__btn"
      @click="doCopy"
    >
      <template #icon><span>⎘</span></template>
    </t-button>
  </span>
</template>

<script>
import { MessagePlugin } from 'tdesign-vue-next'

export default {
  name: 'CopyText',
  props: {
    text: { type: String, required: true },
    label: { type: String, default: '' },
    monospace: { type: Boolean, default: false },
  },
  methods: {
    async doCopy() {
      try {
        await navigator.clipboard.writeText(this.text)
        MessagePlugin.success('已复制')
      } catch {
        MessagePlugin.error('复制失败')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.copy-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.is-mono .copy-text__label {
    font-family: monospace;
  }

  &__label {
    color: var(--text-primary, #1a1f2e);
    font-size: 13px;
  }

  &__btn {
    padding: 0 4px;
    color: var(--text-muted, #8896a9);
    cursor: pointer;
    &:hover { color: var(--color-blue, #0052d9); }
  }
}
</style>
