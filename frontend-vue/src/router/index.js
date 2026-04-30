import { createRouter, createWebHashHistory } from "vue-router";
// 这个是布局组件，如果我们项目不需要使用内置布局则可以删除掉
import Layout from "./../layout/layoutIndex.vue";
import errorPages from "./modules/errorPages";
import aiRoutes from "./modules/aiRoutes";

export const constantRoutes = [
  {
    path: "/",
    redirect: "/ai/dashboard",
  },
  {
    path: "/main",
    name: "mainpage",
    component: Layout,
    children: [
      {
        path: "mainpageindex",
        name: "mainpageindex",
        component: () => import("./../views/mainPage.vue"),
      },
    ],
  },
  aiRoutes,
  errorPages,
];

// 动态路由， 根据获取到的用户权限或者配置改变的路由
export const asyncRoutes = [

];


const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
});

export default router;
