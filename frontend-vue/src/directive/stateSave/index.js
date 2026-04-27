import autoSavePageState from "./autoSavePageState";
import { getPagestate } from '@/directive/stateSave/autoSavePageStateFun.js'
const install = function (Vue) {
  getPagestate()
  Vue.directive("tc-auto-save", autoSavePageState);
};
autoSavePageState.install = install;
export default autoSavePageState;
