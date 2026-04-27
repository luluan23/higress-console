import { useTechStore } from '@/stores'
var Actions = {
  actions: {},
  setActions(actions) {
    this.actions = actions;
    this.actions.addGlobalDataListener((state) => {
      console.log("子项目", state);
      const store = useTechStore();
      store.authoritylist = state.authoritylist;
      store.userInfo = state.userInfo;
      // store.projectEnvList = state.AppStore.storeprojectlist;
      // store.nowProjectIsGame = state.nowProjectIsGame;
      store.subEnv = state.subEnv;
      store.timeZone = state.timeZone;
      store.nowProjectId = state.nowprojectID;
      store.nowProjectAppName = state.nowProjectAppName;
      store.nowProjectShortName = state.nowProjectShortName;
      store.nowAppid = state.nowprojectapp;

      store.logsearchtableheight = state.logsearchtableheight;
      store.jumpCenterData = state.jumpCenterData;      

   },true);
  }
};

export default Actions;
