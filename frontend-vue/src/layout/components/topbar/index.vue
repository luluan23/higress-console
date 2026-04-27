<template>
    <div class="topbar sssdsd">
        <el-row>
            <el-col :span="4"><logo /></el-col>
            <el-col :span="16">
                <div style="text-align: right">
                    <el-menu
                            :default-active="activeMenu"
                            :unique-opened="false"
                            :default-openeds="openmenu"
                            :active-text-color="variables.menuActiveText"
                            mode="horizontal"
                    >
                        <topbar-item
                                style="display: inline-block"
                                v-for="route in permission_routes"
                                :key="route.path"
                                :item="route"
                                :base-path="route.path"
                        />
                    </el-menu>
                </div>
            </el-col>
            <el-col :span="4">
                <div class="right-menu">
                    <el-dropdown
                            class="avatar-container right-menu-item hover-effect"
                            trigger="click"
                    >
                        <div class="avatar-wrapper">
              <span class="avatar-wrapper-span">
                <span class="el-icon-s-custom"></span>
                <i class="el-icon-caret-bottom" />
              </span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item divided>
                                    <span style="display: block" @click="logout">退出登录</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div></el-col
            >
        </el-row>
    </div>
</template>

<script>
  import * as Settings from ".././../../settings";
  import { getServiceurl, removeToken } from "../../../utils/auth";
  import Logo from "./logo.vue";
  import TopbarItem from "./topbarItem.vue";
  import variables from "../../../styles/variables.scss";
  export default {
    data() {
      return {
        openmenu: [],
      };
    },
    components: { Logo, TopbarItem },
    computed: {
      activeMenu() {
        const route = this.$route;
        const { meta, path } = route;
        if (meta.activeMenu) {
          return meta.activeMenu;
        }
        return path;
      },
      variables() {
        return variables;
      },
    },
    watch: {
      openMenuIndex() {
        this.openmenu = [];
        this.openmenu.push(...this.openMenuIndex);
      },
      permission_routes: {
        handler: function (newdata, olddata) {
          console.log(newdata);
          console.log(olddata);
        },
        immediate: true,
      },
    },
    methods: {
      logout() {
        removeToken();
        location.replace(
          Settings.default.ssoServerUrl +
          "/sso/logout?service=" +
          encodeURIComponent(getServiceurl())
        );
      },
    },
  };
</script>

<style lang="scss" scoped>
    .topbar {
        height: 50px;
        position: relative;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        border-bottom: 1px solid #efefef;

        .right-menu {
            float: right;
            height: 100%;
            line-height: 50px;
            position: relative;
            margin-right: 10px;
            &:focus {
                outline: none;
            }

            .right-menu-item {
                display: inline-block;
                padding: 0 8px;
                height: 100%;
                font-size: 18px;
                color: #5a5e66;
                vertical-align: text-bottom;

                &.hover-effect {
                    cursor: pointer;
                    transition: background 0.3s;

                    &:hover {
                        background: rgba(0, 0, 0, 0.025);
                    }
                }
            }

            .avatar-container {
                margin-right: 30px;

                .avatar-wrapper {
                    margin-top: 10px;
                    position: relative;

                    .el-icon-caret-bottom {
                        cursor: pointer;
                        font-size: 12px;
                    }
                }
            }
        }
    }

    .avatar-wrapper-span {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 1.6em;
        color: #333333;
        cursor: pointer;
        &:hover {
            color: darkgoldenrod;
        }
    }

    .sssdsd :deep(.el-menu--horizontal) {
        height: 50px;
        justify-content: right;
    }

    .sssdsd :deep(.el-menu-item) {
        height: 48px !important;
        line-height: 48px !important;
    }
    .sssdsd :deep(.el-sub-menu__title) {
        height: 48px !important;
        line-height: 48px !important;
    }

    .sssdsd :deep(.el-sub-menu__icon-arrow) {
        right: 2px;
    }
</style>
