/**
 * 模块化配置路由的示例
 */
import Layout from "./../../layout/layoutIndex.vue";

const errorPagesRouter = {
  path: "/error",
  component: Layout,
  meta: { title: "错误页面", icon: "tcicon-bug" },
  hidden: true,
  children: [
    {
      path: "401",
      name: "401",
      meta: { title: "401",icon: "tcicon-bug" , auth: "developer" },
      component: () => import("./../../views/error/401.vue"),
    },
    {
      path: "403",
      name: "403",
      meta: { title: "403",icon: "tcicon-bug" , auth: "developer" },
      component: () => import("./../../views/error/403.vue"),
    },
    {
      path: "404",
      name: "404",
      meta: { title: "404",icon: "tcicon-bug"  },
      component: () => import("./../../views/error/404.vue"),
    },
  ],
};

export default errorPagesRouter;
