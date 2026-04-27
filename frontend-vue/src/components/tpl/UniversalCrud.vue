<template>
    <div class="universal-crud">

        <!-- 表格区域 -->
        <el-card class="table-box">
            <!-- <div class="table-actions">
                <el-button type="primary" @click="handleCreate">新增</el-button>
                <el-button @click="exportData">导出</el-button>
            </div> -->
            <div style="display: flex; padding: 20px;justify-content: space-between;" class="permission">
                <div>
                    <el-button size="small" type="primary"><router-link
                            :to="`/permissions/data/add`">新建</router-link></el-button>
                    <el-popconfirm title="确定要删除选中的数据吗?" confirm-button-text='确定' cancel-button-text='取消'
                        confirm-button-type='danger' @confirm='removeRowSelected'>
                        <template #reference>
                            <el-button size="small" type="danger" :disabled='selectedIds.length === 0'>
                                删除
                            </el-button>
                        </template>
                    </el-popconfirm>
                </div>

                <div>
                    <el-select v-model="searchValue.field" size="small" style="width:100px;">
                        <el-option v-for="f in searchFields" :key='f.key' :label="f.label" :value="f.key"></el-option>
                    </el-select>
                    <el-input v-model="searchValue.value" size="small" style="width: 300px;" />
                    <el-icon style="margin-left: 5px; position: relative; top: 3px">
                        <Setting />
                    </el-icon>
                </div>
            </div>

            <el-table :data="tableData" v-loading="loading" style=" border: 1px solid #EBEEF5;"
                @selection-change='change'>
                <el-table-column type="selection" width="55" />
                <template v-for="field in visibleTableFields" :key="field.key">
                    <el-table-column :prop="field.key" :label="field.label" :width="field.table?.width"
                        :min-width="field.table?.minWidth" :align="field.table?.align"
                        :sortable="field.table?.sortable ? 'custom' : false">
                        <template #default="{ row, column }">
                            <template v-if="column.property == 'id'">
                                <router-link class='linkcls' :to="`/permissions/data/${row[field.key]}`">{{
                                    row[field.key]
                                    }}</router-link>
                            </template>
                            <template v-else><format-display :value="row[field.key]" :field="field" /></template>

                        </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default='{ row }'>
                        <el-popconfirm :title="`确定要删除【${row.name}】吗?`" confirm-button-text='确定' cancel-button-text='取消'
                            confirm-button-type='danger' @confirm='handleDelete(row.id)'>
                            <template #reference>
                                <el-button size="small" type="danger" link>
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>


            <el-pagination style="margin-top: 20px;" size="small" background layout="prev, pager, next"
                v-model:current-page="pagination.current" :page-size="pagination.size" @change="changeUrl"
                :total="pagination.total" />

        </el-card>

        <!-- 表单对话框 -->
        <el-dialog :title="formTitle" v-model="dialogVisible" width="600px">
            <dynamic-form :fields="formFields" :form-data="currentForm" :rules="formRules" @submit="handleSubmit"
                @cancel="dialogVisible = false" />
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect, resolveComponent } from 'vue'
import { ElMessage } from 'element-plus'
import DynamicForm from './DynamicForm.vue'
import FormatDisplay from './FormatDisplay.vue'
import { useRoute, useRouter } from 'vue-router'

let route = useRoute()
let router = useRouter()

const props = defineProps({
    config: {
        type: Object,
        required: true
    }
})
const store = computed(() => props.config?.store())

// const getSearchComponent = (field) => {
//     // 1. 优先使用自定义搜索组件
//     if (field.search?.component) {
//         return resolveComponent(field.search.component)
//     }
// }
let selectedIds = ref([])
let searchValue = reactive({
    field: "project",
    value: ""
},)
// 数据状态
const tableData = ref([])
const searchForm = reactive({})
console.log(JSON.stringify(route.query, null, 4))
const pagination = reactive({
    current: parseInt(route.query.page || 1),
    size: parseInt(route.query.size || 20),
    total: 0
})
const loading = ref(false)
const dialogVisible = ref(false)
const currentForm = reactive({})
const formTitle = ref('')

// 计算属性
const searchFields = computed(() =>
    props.config.fields.filter(f => !f.table?.hidden)
)

const visibleTableFields = computed(() =>
    props.config.fields.filter(f => !f.table?.hidden)
)

const formFields = computed(() =>
    props.config.fields.filter(f => !f.form?.hidden)
)

const formRules = computed(() =>
    props.config.fields.reduce((rules, field) => {
        if (field.form?.rules) rules[field.key] = field.form.rules
        return rules
    }, {})
)

// 方法
const loadData = async () => {
    
    try {
        loading.value = true
        const params = {
            ...searchForm,
            page: pagination.current,
            page_size: pagination.size
        }
        const res = await store.value[props.config.api.list](params)
        tableData.value = res.data
        pagination.total = res.total
    } finally {
        loading.value = false
    }
}

const handleCreate = () => {
    formTitle.value = '新增记录'
    Object.keys(currentForm).forEach(key => delete currentForm[key])
    dialogVisible.value = true
}

const handleEdit = (row) => {
    formTitle.value = '编辑记录'
    Object.assign(currentForm, row)
    dialogVisible.value = true
}

const handleSubmit = async (formData) => {
    try {
        const isEdit = !!currentForm.id
        const method = isEdit ? 'update' : 'create'

        await store.value[props.config.api[method]](formData)
        ElMessage.success('操作成功')
        dialogVisible.value = false
        loadData()
    } catch (error) {
        ElMessage.error('操作失败')
    }
}
function change(v) {
    selectedIds.value = v.map(v => v.id)
    console.log(selectedIds.value)
}
function removeRowSelected() {
    handleDelete(selectedIds.value)
}
const handleDelete = async (id) => {
    try {
        await store.value[props.config.api.delete]({ ids: id })
        ElMessage.success('删除成功')
        loadData()
    } catch (error) {
        ElMessage.error('删除失败')
    }
}

function changeUrl() {
    let newQuery = {
        ...route.query
    }
    newQuery.page = pagination.current
    newQuery.size = pagination.size
    console.log(route, newQuery)
    router.push({
        path: route.path,
        query: newQuery
    })
}
// 初始化加载
watchEffect(loadData)
</script>

<style scoped>
.table-actions {
    margin-bottom: 15px;
}

.linkcls {
    color: #409eff;
}
</style>