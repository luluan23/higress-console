import Cookies from "js-cookie";
import * as Settings from "./../settings";
import settings from './../settings'
import { useTechStore } from '@/stores'
const TokenKey = Settings.default.projectName + "Admin-Token";
const ServiceurlKey = Settings.default.projectName + "Key";
export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
export function setServiceurl(service) {
  return Cookies.set(ServiceurlKey, service);
}

export function getServiceurl() {
  return Settings.default.mainServerUrl;
}

// 检查用户是否拥有目标资源
export function checkPermission(requiredSyscode, requiredResCode) {
  const store = useTechStore();
  
  // 如果权限列表为空，返回false（安全默认值）
  if (!store.authoritylist || store.authoritylist.length === 0) {
    return false;
  } 
  
  // 空权限要求视为有权限
  if (requiredResCode === "") {
    return true;
  }
  
  // 检查用户权限列表中是否有匹配的权限
  for (const p of store.authoritylist) {
    const userResCode = p.resCode;

    // 检查系统代码是否匹配
    if (requiredSyscode !== "" &&requiredSyscode !== p.sysCode) {
      continue; // 系统代码不匹配，检查下一个权限
    }
    
    // 精确匹配
    if (requiredResCode === userResCode) {
      return true;
    }
    
    // 分割权限代码（格式如：web:application:GET）
    const requiredParts = requiredResCode.split(':');
    const userParts = userResCode.split(':');
    
    // 确保两部分都有相同的段数
    if (requiredParts.length !== userParts.length) {
      continue; // 段数不同，检查下一个权限
    }
    
    let isMatch = true;
    
    // 逐段比较，支持通配符"*"
    // 正确的逻辑：用户权限应该覆盖所需权限
    for (let i = 0; i < requiredParts.length; i++) {
      // 用户权限段为通配符，或者与所需权限段匹配
      if (userParts[i] === '*' || requiredParts[i] === userParts[i]) {
        continue; // 当前段匹配
      }
      isMatch = false;
      break;
    }
    
    if (isMatch) {
      return true;
    }
  }
  
  // 没有找到匹配的权限
  return false;
}
