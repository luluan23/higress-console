<template>
  <div>
    <el-main>
      <div class="wrap">
        <div class="title">
          介绍：
          本文演示如何获取到当前用户的权限资源点，并使用auth指令配合资源点控制功能权限，同时本应有
        </div>
        <el-row style="margin-top: 30px">
          <el-col :span="24">
            当前拥有的资源点ResCode
          </el-col>
          <div style="margin-top: 20px">
            <el-tag style="margin-left: 5px" :key="key" v-for="(item, key) in _authorityList">{{item.resCode }}</el-tag>
          </div>
        </el-row>
        <el-row style="margin-top: 30px">
          <el-col :span="24">
            <div>
              控制按钮是否显示:
              <el-input style="width: 250px;" v-model="rescode1" placeholder="输入rescode可以控制按钮" />
              <el-button  style="margin-left: 10px"  v-tc-auth:show="rescode1" type="primary">该按钮的资源点{{rescode1}}</el-button>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 30px">
          <el-col :span="24">
            <div>
              控制按钮是否可用:
              <el-input style="width: 250px;" v-model="rescode1" placeholder="输入rescode可以控制按钮" />
              <el-button  style="margin-left: 10px"  v-tc-auth:disabled="rescode1" type="primary">该按钮的资源点{{rescode1}}</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>
<script setup>
import { ref,watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTechStore } from '@/stores'
const techStore = useTechStore()
const { authoritylist } = storeToRefs(techStore)

const _authorityList = ref([])
const rescode1 = ref("")
watch(authoritylist,(newValue) => {
  _authorityList.value = newValue
  if(_authorityList.value.length > 0){
    rescode1.value = _authorityList.value[0].resCode
  }
})


</script>
