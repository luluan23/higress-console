<template>
  <div class="container">
    <img alt="TC logo" src="../../../assets/image/logomini.png" />
    <h1>{{ msg }}</h1>
    <p>
      本框架集成了基础插件和功能，建立完整的项目目录结构，支持微前端集成<br />
      <br />
      辅助开发者快速规范的进行业务开发<br />
    </p>

    <h3>基础功能</h3>
    <ul>
      <li class="text">网络访问</li>
      <li class="text">动态路由（静态路由）</li>
      <li class="text">布局（横向菜单，纵向菜单，无菜单）</li>
      <li class="text">动态路由（静态路由）</li>
      <li class="text">代码校验美化</li>
      <li class="text">事件总线机制</li>
      <li class="text">统一状态管理结构</li>
      <li class="text">统一样式规范</li>
      <li class="text">Iconfont,IconPark图标库</li>
      <li class="text">dayjs时间格式化工具</li>
      <li class="text">element-plus组件库</li>
      <li class="text">loadsh 工具库</li>
    </ul>
    <h3>特色功能</h3>
    <ul>
      <li class="text">数据埋点上报</li>
      <li class="text">操作习惯记忆</li>
      <li class="text">统一登录授权</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
/*@import "../../../styles/variables.scss";*/
.container {
  text-align: center;
  margin-top: 50px;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.text {
  color: #333333;
  font-size: 14px;
}
</style>
