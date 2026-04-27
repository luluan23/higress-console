<template>
    <el-form ref="formRef" :model="formModel" :rules="formRules" :label-position="labelPosition" label-width="auto"
        style="margin: 30px;" size="small">
        <el-row :gutter="gutter">
            <template v-for="field in visibleFields" :key="field.key">
                <el-col :span="fieldSpan(field)">
                    <el-form-item :label="field.label" :prop="field.key" :rules="fieldRules(field)"
                        @mouseenter="enter(field)" @mouseleave="leave(field)">
                        <!--非编辑模式-->
                        <template v-if="!isAdd">
                            <template v-if="!field.editMode">
                                <format-display :value="formData[field.key]" :field="field"
                                    :options='remoteOptions[field.key]' />
                            </template>
                            <!--显示编辑、复制图标-->
                            <div class="iconCls" v-if="field.showIcon && !field.editMode">
                                <el-icon>
                                    <EditPen @click="edit(field)" />
                                </el-icon>
                                <el-icon style='margin-left: 2px;'>
                                    <DocumentCopy @click="copy(field)" />
                                </el-icon>
                            </div>
                        </template>

                        <!--编辑模式-->
                        <template v-if="field.editMode || isAdd">
                            <div style="display: flex; width:100%;">
                                <div style="width: 80%">
                                    <component :is="resolveComponent(field)" v-model="formModel[field.key]"
                                        v-bind="componentProps(field)" v-on="componentEvents(field)"
                                        :loading="remoteLoading[field.key]" :disabled="field.form?.disabled" clearable>
                                        <!-- 下拉选项渲染 -->
                                        <template v-if="field.form.component.type === 'el-select'">
                                            <el-option v-for="opt in remoteOptions[field.key]"
                                                :key="opt[optionValue(field)]" :label="opt[optionLabel(field)]"
                                                :value="opt[optionValue(field)]" />
                                        </template>
                                    </component>
                                </div>
                                <div style="margin-left: 10px;width: 100px;" v-if="!isAdd">
                                    <el-button @click="save(field)" style="width: 24px;" icon="Check"></el-button>
                                    <el-button @click="cancel(field)" type="danger"
                                        style="width: 24px; margin-left: 5px;" icon="Close"></el-button>
                                </div>
                            </div>
                        </template>

                        <!-- <el-form-item :label="field.label" :prop="field.key" :rules="fieldRules(field)">                        
                        <component :is="resolveComponent(field)" v-model="formModel[field.key]"
                            v-bind="componentProps(field)" v-on="componentEvents(field)"
                            :loading="remoteLoading[field.key]" :disabled="field.form?.disabled" clearable>                        
                            <template v-if="field.component === 'select'">
                                <el-option v-for="opt in remoteOptions[field.key]" :key="opt[optionValue(field)]"
                                    :label="opt[optionLabel(field)]" :value="opt[optionValue(field)]" />
                            </template>
                        </component>
                    </el-form-item> -->
                    </el-form-item>
                </el-col>
            </template>
        </el-row>
        <el-form-item label-width="60">
            <el-button type="primary" v-if="isAdd" @click="onSubmit">添加</el-button>
            <el-button @click="back">返回</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
import FormatDisplay from './FormatDisplay.vue'

const props = defineProps({
    fields: { type: Array, required: true },
    formData: { type: Object, required: true },
    labelPosition: { type: String, default: 'right' },
    labelWidth: { type: String, default: '100px' },
    gutter: { type: Number, default: 20 },
    isAdd: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

let editBeforeValue = ref()

let formModel = reactive({ ...props.formData })
watch(props, () => {
    formModel = props.formData
}, {
    immediate: true
})
// 响应式状态
const formRef = ref(null)
const remoteOptions = reactive({})
const remoteLoading = reactive({})
const optionCache = new Map()

// 计算可见字段
const visibleFields = reactive((() => {
    return props.fields.map(v => {
        v.showIcon = false
        v.editMode = false
        return v
    })
})())

function enter(field) {
    field.showIcon = true
}
function leave(field) {
    field.showIcon = false
}
// 解析字段组件
const resolveComponent = (field) => {
    if (field.form.component) {
        return field.form.component.type
    }
    const typeMap = {
        varchar: 'el-input',
        text: 'el-input',
        int: 'el-input-number',
        tinyint: 'el-switch',
        datetime: 'el-date-picker',
        select: 'el-select'
    }
    return typeMap[field.type] || 'el-input'
}

// 组件属性
const componentProps = (field) => {
    let baseProps = {
        placeholder: `请输入${field.label}`,
        style: { width: '100%' }
    }
    if (field.form.component && field.form.component.props) {
        baseProps = Object.assign(baseProps, field.form.component.props)
    }

    switch (resolveComponent(field)) {
        case 'el-date-picker':
            return {
                ...baseProps,
                type: 'datetime',
                format: 'YYYY-MM-DD HH:mm:ss',
                valueFormat: 'YYYY-MM-DD HH:mm:ss'
            }
        case 'el-input':
            return {
                ...baseProps,
                type: field.type === 'text' ? 'textarea' : 'text',
                rows: field.form?.rows || 4
            }
        case 'el-select':
            var selectProps = {
                ...baseProps,
                remote: !!field.form.component.remote,
                reserveKeyword: true
            }

            console.log("selectProps:\t", selectProps)
            if (field.form.component.remote) {
                selectProps['remote-method'] = _.debounce((query) => {
                    loadRemoteOptions(field, query)
                }, 500)
            }

            return selectProps
        default:
            return baseProps
    }
}
function onSubmit() {
    formRef.value.validate(valid => {
        if (valid) {
            emit("submit", formModel)
        }
    })
}
function back() {
    history.back()
}
async function save(fieldInfo) {
    fieldInfo.editMode = false
    emit("submit", {
        id: formModel.id,
        [fieldInfo.key]: formModel[fieldInfo.key]
    })
}
function cancel(fieldInfo) {
    fieldInfo.editMode = false
    formModel[fieldInfo.key] = editBeforeValue.value
}

function edit(fieldInfo) {
    visibleFields.forEach(v => {
        v.editMode = false
    })
    fieldInfo.editMode = true
    editBeforeValue.value = formModel[fieldInfo.key]
}
function copyTxt(source) {
    const textArea = document.createElement('textarea');
    textArea.value = source;
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

function copy(fieldInfo) {
    copyTxt(formModel[fieldInfo.key])
    this.$message.success("复制成功")
}

// 组件事件
const componentEvents = (field) => {
    const events = {}
    return events
}

// 加载远程选项
const loadRemoteOptions = async (field, query = '') => {

    try {
        remoteLoading[field.key] = true
        // 检查缓存
        const cacheKey = `${field.key}_${query}`
        if (field.cache && optionCache.has(cacheKey)) {
            remoteOptions[field.key] = optionCache.get(cacheKey)
            return
        }
        // 构造请求参数
        const params = typeof field.form.component.remote.params === 'function'
            ? field.form.component.remote.params(query, formModel)
            : { ...field.form.component.remote.params, search: query }

        const queryString = new URLSearchParams(params).toString();

        const res = await fetch(`${field.form.component.remote.url}?${queryString}`, {
            method: field.form.component.remote.method || 'get',
            params
        }).then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })

        // 处理响应数据
        const data = field.form.component.remote.transform
            ? field.form.component.remote.transform(res.data)
            : res.data

        // 更新缓存
        if (field.cache) {
            optionCache.set(cacheKey, data)
        }

        remoteOptions[field.key] = data
        field.options = data
    } catch (error) {
        ElMessage.error(`${field.label}选项加载失败`)
        console.error('Remote load error:', error)
    } finally {
        remoteLoading[field.key] = false
    }
}

// 初始化加载远程数据
watch(() => props.fields, (newFields) => {
    newFields.forEach(field => {
        if (field.form.component?.remote && !field.options) {
            loadRemoteOptions(field)
        } else if (field.options) {
            remoteOptions[field.key] = field.options
        }
    })
}, { immediate: true })

// 表单验证规则
const fieldRules = (field) => {
    const rules = []

    // 必填规则
    if (!field.nullable) {
        rules.push({
            required: true,
            message: `${field.label}不能为空`,
            trigger: field.type === 'select' ? 'change' : 'blur'
        })
    }

    // 自定义规则
    if (field.rules) {
        rules.push(...field.rules.map(rule => ({
            ...rule,
            trigger: field.type === 'select' ? 'change' : 'blur'
        })))
    }

    return rules
}

// 布局跨度
const fieldSpan = (field) => {
    return field.form?.span || 24
}

// 选项值映射
const optionValue = (field) =>
    field.form.component.props.optionValue || 'value'

const optionLabel = (field) =>
    field.form.component.props.optionLabel || 'label'

// 暴露验证方法
defineExpose({
    validate: () => formRef.value.validate()
})
</script>

<style scoped>
.el-form-item {
    margin-bottom: 22px;
}

.iconCls {
    color: #409eff;
    font-size: 18px;
    margin-left: 10px;
}

.iconCls i:hover {
    opacity: .6;
    font-weight: bold;
}
</style>