<template>
  <span :class="formatted.class" :style="formatted.style">
    {{ formatted.text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  value: [String, Number, Date, Boolean, Array],
  options: Array,
  field: {
    type: Object,
    default: () => ({})
  }
})

// 主格式化逻辑
const formatted = computed(() => {
  let { type, formatter } = props.field

  // 优先使用自定义格式化函数
  if (typeof formatter === 'function') {
    return formatter(props.value)
  }
  const typeMap = {
    varchar: 'el-input',
    text: 'el-input',
    int: 'el-input-number',
    tinyint: 'el-switch',
    datetime: 'el-date-picker',
    select: 'el-select'
  }

  type = typeMap[type] || 'el-input'
  if (props.field?.form?.component) {
    type = props.field.form.component.type
  }
  // 默认类型处理
  switch (type) {
    case 'el-date-picker':
      return {
        text: dayjs(props.value).format('YYYY-MM-DD HH:mm'),
        class: 'time-text',
        style: { color: '#666' }
      }

    case 'el-switch':
      return {
        text: props.value
          ? props.field.form.component.props['active-text'] || '是'
          : props.field.form.component.props['inactive-text'] || '否',
        class: 'boolean-text',
        style: { color: props.value == 0 ? '#F56C6C' : '#67C23A' }
      }

    case 'el-input-number':
      return {
        text: Number(props.value).toFixed(2),
        class: 'number-text',
        style: { fontFamily: 'monospace' }
      }

    case 'el-select':
      return selectFormatter(props.value)

    default:
      return { text: props.value || '-', class: '', style: {} }
  }
})

// 状态格式化示例
const statusFormatter = (value) => {
  const map = {
    0: { text: '禁用', color: '#909399' },
    1: { text: '启用', color: '#67C23A' },
    2: { text: '审核中', color: '#E6A23C' }
  }
  return {
    text: map[value]?.text || '未知',
    style: { color: map[value]?.color }
  }
}

// 选择类型格式化示例
const selectFormatter = (value) => {
  const options = props.options || []
  const match = options.find(
    (opt) => opt[props.field.form.component.props.optionValue || 'value'] === value
  )
  if (!match) {
    return {
      text: value,
      style: {}
    }
  }
  return {
    text: match[props.field.form.component.props.optionLabel] || match['label'] || value,
    style: { color: match?.color }
  }
}
</script>

<style scoped>
.time-text {
  font-size: 0.9em;
}

.boolean-text {
  font-weight: 500;
}

.number-text {
  letter-spacing: 0.5px;
}
</style>