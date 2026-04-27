import { defineStore } from 'pinia'
import { checkResponseCode } from "../../utils/utilTool";
import {
  addPermissionData,
  deletePermissionData,
  getPermissionDataPage,
  getPermissionData,
  updatePermissionData,
  getPageResource,
  addResource,
  getResource,
  updateResource,
  deleteResource,
} from "../../api/dataApi";
export const useDataStore = defineStore('dataStore', {
  state: () => ({
    userInfo: {},
    authoritylist: [], // 项目相关权限
    techAuthoritylist: [], // 项目不相关权限
    projectEnvList: [], // 项目&环境列表
    nowProjectId: null,
    nowProjectAppName: "",
    nowProjectAppShortName: "", // 项目简称
    nowAppid: 0
  }),
  getter: {

  },
  actions: {
    moduleUpdatePermissionData(data) {
      return new Promise((resolve, reject) => {
        updatePermissionData(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleGetPermissionData(data) {
      return new Promise((resolve, reject) => {
        getPermissionData(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleGetPermissionDataPage(data) {
      return new Promise((resolve, reject) => {
        getPermissionDataPage(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleAddPermissionData(data) {
      return new Promise((resolve, reject) => {
        addPermissionData(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleDeletePermissionData(data) {
      return new Promise((resolve, reject) => {
        deletePermissionData(data)
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
    *
    *
    */
    moduleGetPageResource(data) {
      return new Promise((resolve, reject) => {
        getPageResource(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleAddResource(data) {
      return new Promise((resolve, reject) => {
        addResource(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleGetResource(data) {
      return new Promise((resolve, reject) => {
        getResource(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleUpdateResource(data) {
      return new Promise((resolve, reject) => {
        updateResource(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    moduleDeleteResource(data) {
      return new Promise((resolve, reject) => {
        deleteResource(data)
          .then((response) => {
            let _data = checkResponseCode(response);
            resolve(_data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  }
})
