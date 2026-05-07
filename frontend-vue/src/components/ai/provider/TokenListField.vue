<template>
  <div class="ai-array-field">
    <div v-for="(token, index) in modelValue" :key="index" class="ai-array-field__row">
      <el-input
        :model-value="token"
        show-password
        @update:model-value="updateToken(index, $event)"
      />
      <el-button text type="danger" @click="removeToken(index)">删除</el-button>
    </div>
    <el-button @click="addToken">新增 Token</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

function addToken() {
  emit('update:modelValue', [...props.modelValue, ''])
}

function removeToken(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, currentIndex) => currentIndex !== index)
  )
}

function updateToken(index, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((token, currentIndex) =>
      currentIndex === index ? value : token
    )
  )
}
</script>