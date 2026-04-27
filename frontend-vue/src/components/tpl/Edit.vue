<template>
    <dynamic-form v-loading='loading' :fields="formFields" :form-data="currentForm" :rules="formRules" :isAdd='isAdd'
        @submit="handleSubmit" @cancel="dialogVisible = false">
    </dynamic-form>
</template>

<script setup>
import DynamicForm from './DynamicForm.vue'
import { ref, reactive, computed, watchEffect } from 'vue'
import rule from "./schema/rules"
import { ElMessage } from 'element-plus'
import { useRoute } from "vue-router"

let route = useRoute()


let configs = [
    rule
]
const config = computed(() => {
    return configs.find(v => v.check(route.name))
})
const store = computed(() => config.value?.store())
const loading = ref(false)
const dialogVisible = ref(false)
const currentForm = reactive({})

const dataId = computed(() => {
    return route.params.id
})
const isAdd = computed(() => {
    return dataId.value === "add"
})
async function loadData() {
    if (isAdd.value) {
        return
    }
    loading.value = true
    let data = await store.value[config.value.api.detail]({
        id: dataId.value
    })
    Object.assign(currentForm, data)
    loading.value = false
}

watchEffect(() => {
    loadData()
})
const formFields = computed(() =>
    config.value.fields.filter(f => !f.form?.hidden)
)

const formRules = computed(() =>
    config.value.fields.reduce((rules, field) => {
        if (field.form?.rules) rules[field.key] = field.form.rules
        return rules
    }, {})
)
const handleSubmit = async (formData) => {
    try {
        const method = isAdd.value ? 'create' : 'update'        
        await store.value[config.value.api[method]](formData)
        ElMessage.success('操作成功')
        dialogVisible.value = false
        if (isAdd.value) {
            history.back()
        }
    } catch (error) {
        console.log(error)
        ElMessage.error('操作失败')
    }
}
</script>