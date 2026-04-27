import * as Settings from "../../settings";
const KEY = Settings.default.projectName + "Pagestate";
import { useAppStore } from '@/stores';

// 保存页面当前状态
export function setPagestate(_key, _value) {
  let _pageState = window.localStorage.getItem(KEY);
  if (_pageState != undefined) {
    _pageState = JSON.parse(_pageState);
    _pageState[_key] = _value;
  } else {
    _pageState = {};
    _pageState[_key] = _value;
  }
  window.localStorage.setItem(KEY, JSON.stringify(_pageState));
  const store = useAppStore();
  store.pageState = _pageState
}
// 获取页面当前状态
export function getPagestate() {
  let _pageState = window.localStorage.getItem(KEY);
  if (_pageState != undefined && _pageState != null) {
    _pageState = JSON.parse(_pageState);
  } else {
    _pageState = null;
  }
  const store = useAppStore();
  store.pageState = _pageState
  return _pageState;
}
