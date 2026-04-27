<template>
    <universal-crud :config='config' />
</template>

<script setup>
import UniversalCrud from './UniversalCrud.vue'
import { computed } from "vue"
import { useRoute } from "vue-router"
import rule from "./schema/rules"
import resource from './schema/resource'

let route = useRoute()

let configs = [
    rule,
    resource,
]
const config = computed(() => {    
    return configs.find(v => v.check(route.name))
})
</script>

<style>
.permission .el-select__wrapper,
.permission .el-input__wrapper {
    border-radius: 0;
}
</style>
<style scoped>
.linkcls {
    color: #409eff;
}
</style>