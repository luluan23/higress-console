<template>
    <div v-if=this.localhideNavBar class="navbar">
        <hamburger
                id="hamburger-container"
                :is-active="sidebar.opened"
                class="hamburger-container"
                @toggleClick="toggleSideBar"/>
        <projectSelect style="margin-left: 50px"></projectSelect>
        <div class="loginMain fr">
            <div v-if="userInfo">
                <el-dropdown class="el-dropdown" :show-timeout="0">
                    <span :title="userInfo.name" class="el-dropdown-link" style="cursor:pointer;">
                        <el-avatar
                                class="avatar"
                                :size="40"
                                :src="userInfo.head"
                                fit="cover"
                        >
                                <i class="iconfont icon-avatar"></i>
                        </el-avatar>
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                            <span style="display:block;" @click="logout">
                              <i class="iconfont icon-tuichudenglu" style="font-size:13px;"></i><span style="margin-left:2px">退出登录</span>
                            </span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>


    </div>
</template>

<script>
  import { mapState ,mapActions} from 'pinia'
  import { useAppStore,useTechStore } from '@/stores'
  import * as Settings from "./../../settings";
  import { getServiceurl, removeToken } from "../../utils/auth";
  import Hamburger from "./../../components/hamburger/index.vue";
  import projectSelect from './../../components/projectSelect/projectSelect.vue';
  export default {
    components: {
      Hamburger,
      projectSelect
    },
    computed: {
      ...mapState(useAppStore, ['sidebar']),
      ...mapState(useTechStore, ['userInfo']),
    },
    methods: {
      ...mapActions(useAppStore, ['moduleToggleSideBar']),
      ...mapActions(useTechStore, ['moduleGetUserinfo']),
      getUserInfo() {
        if(Settings.default.isDevelopMode){
          return
        }
        this.moduleGetUserinfo();
      },
      toggleSideBar() {
        this.moduleToggleSideBar();
      },
      logout() {
        removeToken();
        location.replace(
          Settings.default.ssoServerUrl +
          "/sso/logout?service=" +
          encodeURIComponent(getServiceurl())
        );
      },
      demoSay(_str) {
        this.$notify({
          title: "你说了",
          message: _str,
          offset: 34,
        });
      },
    },
    mounted() {
      // this.getUserInfo();
      const microAppData = window.microApp?.getData();
      if (microAppData && 'hideNavBar' in microAppData) {
            this.localhideNavBar = microAppData.hideNavBar;
        }else{
            this.localhideNavBar = false;
        }
        console.log("是否隐藏导航",this.localhideNavBar);
    },
  };
</script>

<style lang="scss" scoped>
    /*@import '../../styles/variables.scss';*/
    .navbar {
        height: 50px;
        position: relative;
        background: $mainColor1;
        .hamburger-container {
            line-height: 46px;
            height: 100%;
            float: left;
            cursor: pointer;
            transition: background 0.3s;
            -webkit-tap-highlight-color: transparent;
            &:hover {
                background: $mainColor2;
            }
        }
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

        }
    }


    .avatar {
        position: relative;
        top: 5px;
        right: 10px;
        border-radius: 5px;
        & :deep(img) {
            width: 100%;
        }
    }
    .loginMain {
        color: #fff;
        height: 50px;
        line-height: 50px;
    }
</style>
