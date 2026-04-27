<template>
  <div class="container">
    <div class="container-content">
      <div class="tips-container">
        <span class="tips-title">抱歉，您无权访问此页面</span>
      </div>
      <img src="../../assets/image/403.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: "index",
};
</script>

<style scoped>
.container {
  background: #ffffff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  /*background: red;*/
}
.container-content {
}
.tips-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 450px;
  right: 540px;
}
.tips-title {
  color: #9f9f9f;
}
.tips-button {
  width: 80px;
  margin-top: 10px;
}
</style>
