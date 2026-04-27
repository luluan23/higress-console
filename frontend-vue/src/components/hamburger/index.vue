<template>
    <div style="padding: 0 15px" @click="toggleClick">
        <svg class="hamburger"  width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10.5H40" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 19.5H40" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 28.5H40" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 37.5H40" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 19L8 24L16 29V19Z" fill="#2F88FF" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>

    </div>
</template>

<script>
  export default {
    name: "Hamburger",
    props: {
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      toggleClick() {
        this.$emit("toggleClick");
      },
    },
  };
</script>

<style scoped>
    .hamburger {
        display: inline-block;
        vertical-align: middle;

    }

    .hamburger.is-active {
        transform: rotate(180deg);
    }
</style>
