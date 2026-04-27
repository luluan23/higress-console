import { defineStore } from 'pinia'
import { checkResponseCode } from "../../utils/utilTool";
import * as TechApi from "../../api/techApi";
import { getUserPermissionsApi } from "../../api/dataApi"
export const useTechStore = defineStore('techStore', {
  state:() => ({
    userInfo: {},
    authoritylist: [], // 项目相关权限
    techAuthoritylist: [], // 项目不相关权限
    projectEnvList:[], // 项目&环境列表
    nowProjectId:null,
    nowProjectAppName:"",
    nowProjectAppShortName:"", // 项目简称
    nowAppid:0,
    permissionLoaded: false,  // gop_permission权限是否已加载
    permissionLoading: false  // gop_permission权限是否正在加载
  }),
  getter: {

  },
  actions:{
    moduleGetUserinfo(){
      return new Promise((resolve, reject) => {
        TechApi.getUserInfo()
          .then((response) => {
            let _data = checkResponseCode(response);
            this.userInfo = _data
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleGetPrivileges(){
      return new Promise((resolve, reject) => {
        TechApi.getPrivileges()
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleGetProjectAndEnv(_data){
      return new Promise((resolve, reject) => {
        TechApi.getProjectAndEnv(_data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /*
    * 从gop_permission获取用户权限
    */
    moduleGetUserPermission(data) {
      return new Promise((resolve, reject) => {
        if (this.permissionLoading) return // 防止重复请求
        this.permissionLoading = true

        getUserPermissionsApi (data)
          .then((response) => {
            let _data = checkResponseCode(response)
            let authObj = {appId: -1}
            let pList = []
            _data.string.forEach((v) => {
              let [s1, ...rest] = v.split(':')
              let s2 = rest.join(':')
              pList.push({sysCode: s1, resCode: s2})
            })
            authObj.privileges = pList
            this.techAuthoritylist = [(authObj)]
            this.permissionLoaded = true
            this.permissionLoading = false
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  }
})


