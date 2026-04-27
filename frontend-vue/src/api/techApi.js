/**
 * 从权限系统中获取应用权限
 */
import request from "./../utils/request";

export function getUserInfo() {
  return request({
    url: "/api/getuserinfo",
    method: "get",
  });
}

// 获取用户权限
export function getPrivileges() {
  return request({
    url: "/tech/privileges?sysCode=TA",
    method: "get",
  });
}

// 获取项目和环境列表
export function getProjectAndEnv(data) {
  let _url = '/tech/api/v2/admin/privileges';
  return request({
    url: _url,
    method: 'post',
    data
  });
}
