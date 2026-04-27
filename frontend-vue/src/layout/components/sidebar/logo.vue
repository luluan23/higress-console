<template>
    <div class="sidebar-logo-container" :class="{ collapse: collapse }">
        <transition name="sidebarLogoFade">
            <div v-if="collapse" key="collapse" class="sidebar-logo-link">
                <img src="../../../assets/image/logomini.png" class="sidebar-logo" />
            </div>
            <div v-else key="expand" class="sidebar-logo-link">
                <img
                        src="../../../assets/image/logo.png"
                        style="width: 182px"
                        class="sidebar-logo"
                />
            </div>
        </transition>
    </div>
</template>

<script>
  export default {
    name: "SidebarLogo",
    props: {
      collapse: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        title: "Vue Element Admin",
        logo: "https://wpimg.wallstcn.com/69a1c46c-eb1c-4b46-8bd4-e9e686ef5251.png",
      };
    },
  };
</script>

<style lang="scss" scoped>
    /*@import "./../../../styles/variables.scss";*/
    .sidebarLogoFade-enter-active {
        transition: opacity 1.5s;
    }

    .sidebarLogoFade-enter,
    .sidebarLogoFade-leave-to {
        opacity: 0;
    }

    .sidebar-logo-container {
        position: relative;
        width: 100%;
        height: 50px;
        line-height: 50px;
        background: $mainColor1;
        text-align: center;
        overflow: hidden;

        & .sidebar-logo-link {
            height: 100%;
            width: 100%;

            & .sidebar-logo {
                width: 32px;
                height: 32px;
                vertical-align: middle;
                margin-right: 12px;
            }
        }

        &.collapse {
            background: #E8EBF2;
            .sidebar-logo {
                margin-right: 0px;
            }
        }
    }
</style>
