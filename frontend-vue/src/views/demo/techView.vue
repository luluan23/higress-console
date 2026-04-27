<template>
    <div>
        <el-main>
            <div class="wrap">
                <div class="title">
                    介绍：
                    演示如何从公共变量中获取已选项目，权限资源点，用户信息等
                </div>
                <el-descriptions
                        title="当前用户信息和选中的项目权限资源点"
                        direction="vertical"
                        :column="4"
                        :size="size"
                        border
                >
                    <el-descriptions-item label="用户名">{{ userInfo.name }}</el-descriptions-item>
                    <el-descriptions-item label="项目ID & 名称">{{ nowProjectId + "("+nowProjectAppName+")"}}</el-descriptions-item>
                    <el-descriptions-item label="当前选中的appID(用来做数据查询或者操作，可能是项目ID或者环境ID)" :span="2">
                      {{ nowAppid }}</el-descriptions-item>
                    <el-descriptions-item label="权限资源点列表">
                       {{JSON.stringify(authoritylist)}}
                    </el-descriptions-item>

                </el-descriptions>
            </div>
        </el-main>
    </div>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useTechStore } from '@/stores'
const techStore = useTechStore()
const { userInfo,nowProjectId,nowProjectAppName,nowAppid,authoritylist } = storeToRefs(techStore)


</script>
