import { useTechStore } from '@/stores'
import { ElMessage, ElLoading } from 'element-plus'
import { checkResponseCode } from "@/utils/utilTool";
import { checkPermission } from "@/utils/auth"
import { getUserPermissionsApi } from "@/api/dataApi"

// 白名单路由（不需要权限验证的路由）
const whiteList = ['/mainpage', '']

// 权限验证函数
function hasPermission(route, permissions) {
  if (!route.meta) return true
  
  const { sysCode, resCode } = route.meta
  
  // 如果没有配置权限要求，则允许访问
  if (!sysCode || !resCode) return true
  
  // 检查用户是否有对应权限
  /* return permissions.some(p => {

    console.debug("route", resCode) //web:application:GET
    console.debug("permission", p.resCode) //web:application:*

    // return true

    let routeRes = resCode.split(':')
    let pRes = p.resCode.split(':')
    return p.sysCode === sysCode && 
            (pRes[1] === routeRes[1] || pRes[1] === '*') &&
            (pRes[2] === routeRes[2] || pRes[2] === '*')
  }) */
  return checkPermission(sysCode, resCode)
}

// 过滤有权限的路由
function filterAsyncRoutes(routes, permissions) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(tmp, permissions)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })
  
  return res
}

// 获取用户权限
function moduleGetUserPermission(data) {
  const techStore = useTechStore()
  return new Promise((resolve, reject) => {
    if (techStore.permissionLoading) return // 防止重复请求
    techStore.permissionLoading = true

    getUserPermissionsApi (data)
      .then((response) => {
        let _data = checkResponseCode(response)
        let authObj = {appId: -1}
        let pList = []
        _data.permissions.forEach((v) => {
          pList.push({
            sysCode: v.app_code,
            resCode: v.res_type + ':' + v.res + ':' + v.action
          })
        })
        authObj.privileges = pList
        techStore.techAuthoritylist = [(authObj)]
        techStore.authoritylist = pList
        techStore.permissionLoaded = true
        techStore.permissionLoading = false
        resolve(_data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 初始化路由守卫
function setupPermission(routerInstance) {
  routerInstance.beforeEach(async (to, from, next) => {
    const techStore = useTechStore()
    // console.log({
    //   to: to,
    //   from: from,
    //   next: next
    // })
    try {
      // 白名单直接放行
      if (whiteList.includes(to.path)) {
        next()
        return
      }
      
      // 获取用户权限（如果还没有获取）
      // if (!techStore.techAuthoritylist || techStore.techAuthoritylist.length === 0) {
        // 这里可以调用获取权限的方法
        // await techStore.getUserPermissions()
      // }

      // ++++
      // 如果权限还没加载，先加载权限
      if (!techStore.permissionLoaded && !techStore.permissionLoading) {
        try {
          await moduleGetUserPermission({
            str: true,
          })
        } catch (error) {
          console.error('权限加载失败:', error)
          ElMessage.error('权限加载失败，请重新登录')
          next({name: '404'})
          return
        }
      }
      
      // 如果权限正在加载中，等待加载完成
      if (techStore.permissionLoading) {
        // 可以显示加载提示
        const loadingInstance = ElLoading.service({
          lock: true,
          text: '正在加载权限信息...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        // 轮询等待权限加载完成
        const checkPermissionLoaded = () => {
          return new Promise((resolve) => {
            const timer = setInterval(() => {
              if (!techStore.permissionLoading) {
                clearInterval(timer)
                loadingInstance.close()
                resolve()
              }
            }, 100)
          })
        }
        
        await checkPermissionLoaded()
      }
      // ++++
      
      // 扁平化权限列表
      const userPermissions = []
      techStore.techAuthoritylist.forEach(app => {
        if (app.privileges) {
          userPermissions.push(...app.privileges)
        }
      })
      
      // 检查当前路由权限
      if (hasPermission(to, userPermissions)) {
        next()
      } else {
        // 无权限，跳转到40x页面
        // ElMessage.error('您没有访问该页面的权限')
        // next({name: 'userPersonal'})
        next({name: '401'})
      }
      
    } catch (error) {
      console.error('权限验证失败:', error)
      // ElMessage.error('权限验证失败')
      next({name: '401'})
    }
  })
}

export { setupPermission, hasPermission, filterAsyncRoutes }
