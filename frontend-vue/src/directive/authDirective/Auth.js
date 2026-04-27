import { useTechStore } from '@/stores'
const actions = {
  show: (el, vnode, has) => {
    if (el.style.display === "" && has === false) {
      el.style.display = "none";
    } else if (el.style.display === "none" && has === true) {
      el.style.display = "";
    }
    // el.style.display = has ? undefined : "none";
  },
  hide: (el, vnode, has) => {
    el.style.display = has ? "none" : undefined;
  },
  disabled: (el, vnode, has) => {
    if (
      vnode.props.class.includes("el-button") ||
      vnode.props.class.includes("el-select")
    ) {
      vnode.ref.i.props.disabled = !has;
    } else if (vnode.props.class.includes("el-input")) {
      vnode.dirs[0].instance.$.props.disabled = !has;
    } else if (vnode.props.class.includes("el-switch")) {
      vnode.children[0].ref.i.props.disabled = !has;
    }
  },
  editShow:(el, vnode, has) => {
    if (has === false) {
      el.style.display = "";
    } else if (has === true) {
      el.style.display = "none";
    }
  },
  editHide:(el, vnode, has) => {
    if (has === false) {
      el.style.display = "none";
    } else if (has === true) {
      el.style.display = "";
    }
  },
};

import { checkPermission } from '@/utils/auth'
function handler(el, vnode, arg, value) {
  const store = useTechStore();
  if (store.authoritylist.length > 0) {
    /* for (const p of store.authoritylist) {
      if (value === "" || hasPermission(value, p.resCode)) {
        actions[arg](el, vnode, true);
        return;
      }
    } */
    if (checkPermission("", value)) {
      actions[arg](el, vnode, true);
      return;
    }
    // console.debug({ ...vnode });
    actions[arg](el, vnode, false);
  }else{
    if(value === ""){
      actions[arg](el, vnode, true);
    }else{
      actions[arg](el, vnode, false);
    }

  }
}

// 权限匹配函数，支持通配符"*"
function hasPermission(requiredResCode, userResCode) {
  if (requiredResCode === "" || requiredResCode === userResCode) {
    return true;
  }
  
  // 分割权限代码（格式如：web:application:GET）
  const requiredParts = requiredResCode.split(':');
  const userParts = userResCode.split(':');
  
  // 确保两部分都有相同的段数
  if (requiredParts.length !== userParts.length) {
    return false;
  }
  
  // 逐段比较，支持通配符"*"
  for (let i = 0; i < requiredParts.length; i++) {
    if (userParts[i] !== '*' && requiredParts[i] !== userParts[i]) {
      return false;
    }
  }
  
  return true;
}

const autoFocus = {
  mounted(el, { arg, value }, vnode) {
    // 首次显示
    handler(el, vnode, arg, value);
  },
  updated(el, { arg, value }, vnode) {
    // 后续显示
    handler(el, vnode, arg, value);
  },
  install(Vue) {
    Vue.directive("tc-auth", autoFocus);
  },
};
export default autoFocus;
