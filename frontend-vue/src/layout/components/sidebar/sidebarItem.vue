<template>
    <div
            v-if="!item.hidden && haveprivileges"
            class="menu-wrapper">
        <template
                v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow ">
            <app-link
                    v-if="onlyOneChild.meta &&
       (item.children === undefined ||
            (item.children !== undefined && item.children.length > 0))"
                    :to="resolvePath(onlyOneChild.path)"
            >
                <el-menu-item
                        :index="resolvePath(onlyOneChild.path)"
                        :class="{ 'submenu-title-noDropdown': !isNest }"
                >
                    <i  v-if="onlyOneChild.meta.icon && onlyOneChild.meta.icon.indexOf('tcicon') > -1  " class="svg-icon">
                        <component
                                :is="onlyOneChild.meta.icon"
                                theme="multi-color"
                                style="margin-right: 3px;    vertical-align: middle;"
                                size="14"
                                :fill="['#333' ,'#409EFF' ,'#FFF' ,'#43CCF8']"
                                :strokeWidth="2"
                                strokeLinejoin="bevel"/>
                    </i>
                    <i
                            v-if="(onlyOneChild.meta.icon && onlyOneChild.meta.icon.indexOf('tcicon')  === -1) ||
                        (item.meta && item.meta.icon &&  item.meta.icon.indexOf('tcicon')  === -1)"
                            :class="getIcon(onlyOneChild, item)"
                            :title="onlyOneChild.meta.title"
                            style="margin-right: 5px"/>
                    <template #title>
                        <span>{{ onlyOneChild.meta.title }}</span>
                    </template>
                </el-menu-item>
            </app-link>
        </template>

        <el-sub-menu
                v-else-if="item.children.length > 0"
                ref="subMenu"
                :index="resolvePath(item.path, item.meta.openflag)"
                popper-append-to-body
        >
            <template #title>
                <i  v-if="item.meta && item.meta.icon && item.meta.icon.indexOf('tcicon') > -1" class="svg-icon">
                    <component
                            :is="item.meta.icon"
                            theme="multi-color"
                            style="vertical-align: text-bottom;margin-right: 3px"
                            size="14"
                            :fill="['#333' ,'#409EFF' ,'#FFF' ,'#43CCF8']"
                            :strokeWidth="2"
                            strokeLinejoin="bevel"/>
                </i>
                <i v-if="item.meta && item.meta.icon  && item.meta.icon.indexOf('tcicon') === -1"
                   :class="getIcon(item, item)"
                   :title="item.meta.title"
                   style="margin-right: 5px"
                />
                <span>{{ item.meta.title }}</span>
            </template>
            <sidebar-item
                    v-for="child in item.children"
                    :key="child.path"
                    :is-nest="true"
                    :item="child"
                    :base-path="resolvePath(child.path)"
                    class="nest-menu"
            />
        </el-sub-menu>
    </div>
</template>

<script>
  import { isExternal } from "../../../utils/utilTool";
  import AppLink from "./appLink.vue";
  import { useTechStore } from '@/stores'
  import { mapState } from 'pinia'
  import { checkPermission } from '@/utils/auth'
  export default {
    name: "SidebarItem",
    components: { AppLink },
    props: {
      // route object
      item: {
        type: Object,
        required: true,
      },
      isNest: {
        type: Boolean,
        default: false,
      },
      basePath: {
        type: String,
        default: "",
      },
    },
    data() {
      // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
      // TODO: refactor with render function
      this.onlyOneChild = null;
      return {};
    },
    computed: {
      ...mapState(useTechStore, ['authoritylist','techAuthoritylist','nowAppid']),
      haveprivileges: function() {
        // `this` 指向 vm 实例
        if (!this.item.hidden) {
          let rt = false;
          if (this.item.meta !== undefined) {
            if (this.item.meta.resCode === undefined || this.item.meta.authoritytype === 'show') {
              rt = true;
            } else {
              /* for (var i = 0; i < this.authoritylist.length; i++) {
                let obj = this.authoritylist[i];
                // obj.resCode → web:application:GET
                // 可以有多重权限共同控制一个菜单
                let routeRes = this.item.meta.resCode.split(':')
                let pRes = obj.resCode.split(':')
                if (
                  this.item.meta.sysCode === obj.sysCode &&
                  (pRes[1] === routeRes[1] || pRes[1] === '*') &&
                  (pRes[2] === routeRes[2] || pRes[2] === '*')
                  // (this.item.meta.resCode.indexOf(obj.resCode) > -1 || this.item.meta.resCode=== 'all' )
                ) {
                  rt = true;
                }
              } */
              if (checkPermission(this.item.meta.sysCode, this.item.meta.resCode)) {
                rt = true;
              }
              // 这个判断主要是项目无关的权限只要是有就都需要显示出来
              for (let i = 0; i < this.techAuthoritylist.length; i++) {
                let techauthoritylistlist = this.techAuthoritylist[i].privileges;
                for (let j = 0; j < techauthoritylistlist.length; j++) {
                  let obj = techauthoritylistlist[j];
                  if (this.item.meta.resCode.indexOf(obj.resCode) > -1 && this.item.meta.sysCode === obj.sysCode) {
                    rt = true;
                  }
                }
              }
            }
          } else {
            rt = true;
          }
          return rt;
        } else {
          return false;
        }
      }
    },
    methods: {
      hasOneShowingChild(children = [], parent) {
        const showingChildren = children.filter((item) => {
          if (item.hidden) {
            return false;
          } else {
            // Temp set(will be used if only has one showing child)
            this.onlyOneChild = item;
            return true;
          }
        });

        // When there is only one child router, the child router is displayed by default
        if (showingChildren.length === 1) {
          return true;
        }

        // Show parent if there are no child router to display
        if (showingChildren.length === 0) {
          this.onlyOneChild = {
            ...parent,
            path: "",
            noShowingChildren: true,
          };
          return true;
        }

        return false;
      },
      resolvePath(routePath, openflag) {
        if (isExternal(routePath)) {
          return routePath;
        }
        if (isExternal(this.basePath)) {
          return this.basePath;
        }
        let _index = this.basePath  + "/" +  routePath;
        if (openflag == "true") {
          // this.$store.dispatch("changeopenmenu", _index);
        }
        return _index;
      },
      getIcon(onlyOneChild, item) {
        let icon = onlyOneChild.meta.icon || (item.meta && item.meta.icon);
        let spaniconclass = "svg-icon  iconfont " + icon + " ";
        return spaniconclass;
      },
    },
  };
</script>
