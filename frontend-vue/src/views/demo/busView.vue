<template>
  <div>
    <el-main>
      <div class="wrap">
        <div class="title">
          介绍： 演示总线事件机制如何使用。
          通过点击发送事件，将输入的文字通过总线发送，并在其他组件中监听。
        </div>
        <el-row style="margin-top: 30px">
          <el-col :span="24">
            <div style="text-align: center">
              <el-input
                  style="width: 500px"
                  v-model="input1"
                  placeholder="请输入内容"
              ></el-input>
              <el-button
                  style="margin-left: 10px"
                  type="primary"
                  @click="say"
              >发送事件</el-button
              >
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>
<script setup>
import { ref,getCurrentInstance,onMounted } from "vue";
import { ElNotification } from 'element-plus'
const input1 = ref("");
const internalInstance = getCurrentInstance();
const bus = internalInstance.appContext.config.globalProperties.bus;


const say = () => {
  bus.emit("DEMOSAY", input1.value);
}

const onSay = (msg) => {
  ElNotification({
    title: '你说了',
    message: msg,
    type: 'success',
  })
}

onMounted(() => {
  bus.on("DEMOSAY",onSay);
})
</script>
