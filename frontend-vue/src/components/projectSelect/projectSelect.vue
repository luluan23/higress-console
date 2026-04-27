<template>
  <div class="tooporjectselect">
        <span style="margin-left:20px">
            <tcicon-application-one  theme="multi-color" size="14" :fill="['#c1c6c8' ,'#2F88FF' ,'#fff' ,'#fff']" :strokeWidth="3" />
        </span>
    <span class="topbarlabelcss">项目</span>

    <el-select
      v-model="nowProjectId"
      filterable
      style="width: 240px"
      popper-class="project-selector"
      :filter-method="filter"
      @visible-change="filterClear"
      v-tc-auto-save:selectproject="nowProjectId"
      @change="nowprojectchange"
      :reserve-keyword="false"
      placeholder="请选择">
      <el-option
        v-for="item in showProjectList"
        :key="item.appId"
        :label="item.appName"
        :value="item.appId"
      >
      </el-option>
    </el-select>
    <tcicon-more-app v-if="showEnv" style="margin-left:20px" theme="multi-color" size="14" :fill="['#fff' ,'#2F88FF' ,'#FFF' ,'#43CCF8']" :strokeWidth="3"/>
    <span v-if="showEnv" class="topbarlabelcss">环境</span>
    <el-select
      v-if="showEnv"
      v-model="nowEnvId"
      style="width: 240px"
      filterable
      v-tc-auto-save:selectenv="nowEnvId"
      @change="nowEnvChange"
      placeholder="请选择">
      <el-option
        v-for="item in envList"
        :key="item.appId"
        :label="item.appName"
        :value="item.appId"
      >
      </el-option>
    </el-select>
  </div>
</template>
<script>
import { customSortMethod } from './../../utils/utilTool';
import { useTechStore,useAppStore } from '@/stores';
import { mapActions,mapWritableState  } from 'pinia';
import cnchar from 'cnchar';
export default {
  data() {
    return {
      privilegesList: [],
      showProjectList: [],
      allProjectList: [],
      nowEnvId: null,
      envList: [],
      intervalTime:0
    };
  },
  computed: {
    // ...mapWritableState(['pageState', 'topbarselector','nowprojectapp']),
    ...mapWritableState(useTechStore,["authoritylist"
      ,"techAuthoritylist"
      ,"projectEnvList"
      ,"nowProjectId"
      ,"nowProjectAppName"
      ,"nowProjectAppShortName"
      ,"nowAppid"]),
    ...mapWritableState(useAppStore,["pageState"]),
    showEnv() {
      return (
        this.envList.length > 0
      );
    }
  },
  methods: {
    ...mapActions(useTechStore, ['moduleGetPrivileges','moduleGetProjectAndEnv']),
    nowEnvChange(val) {
      if (this.envList.length > 0) {
        for (let i = 0; i < this.envList.length; i++) {
          var obj = this.envList[i];
          if (obj.appId === val) {
            for (let i = 0; i < this.privilegesList.length; i++) {
              let privilegesItem = this.privilegesList[i];
              if (privilegesItem.appId === val) {
                this.nowAppid = val
              }
            }
          }
        }
      }
    },
    mergePrivileges(appPrivileges,_envList) {
      let rt = [];
      for (let i = 0; i < _envList.length; i++) {
        const _envItem = _envList[i];
        rt.push(..._envItem.privileges);
      }

      if(appPrivileges !== undefined && appPrivileges != null){
        rt.push(...appPrivileges);
      }
      return rt;
    },
    nowprojectchange(val, _type) {
      this.envList = [];
      this.nowEnvId = null;
      if (this.privilegesList.length > 0) {
        if (this.showProjectList.length > 0) {
          for (let i = 0; i < this.showProjectList.length; i++) {
            let obj = this.showProjectList[i];
            if (obj.appId === val) {
              this.nowAppid =  val;
              this.nowProjectAppName = obj.appName;
              this.nowProjectAppShortName = obj.shortName;
              if (
                obj.childes === undefined ||
                obj.childes === null
              ) {
                for (
                  let i = 0;
                  i < this.privilegesList.length;
                  i++
                ) {
                  let privilegesItem = this.privilegesList[i];
                  if (privilegesItem.appId === val) {
                    this.authoritylist =  privilegesItem.privileges;
                  }
                }
              } else {
                this.authoritylist = [];
                this.nowAppid = 0;
                if (obj.childes.length > 0) {
                  this.envList = obj.childes;
                  if (_type != undefined && _type === 'env') {
                    this.nowEnvId = this.initEnvByRouter(
                      this.envList
                    );
                  } else {
                    this.nowEnvId = this.initEnvBySave(
                      this.envList
                    );
                  }
                  this.nowEnvChange(this.nowEnvId);
                  this.authoritylist =  this.mergePrivileges(obj.privileges,this.envList)
                }
              }
            }
          }
        }
      } else {
        this.$router.push('/noAuth');
      }
    },
    initList() {
      this.showProjectList = [];
      this.allProjectList = [];
      this.projectEnvList = [];
      let _data = {
        app_id: 0,
        sys_code: '',
        types: ['0', '1']
      };
      const p1 = this.moduleGetPrivileges().then(rsdata => {        
        if (rsdata.length > 0) {
          for (let rsdataitem of rsdata) {
            if (rsdataitem.appId != -99) {
              this.privilegesList.push(rsdataitem);
            } else {
              this.techAuthoritylist = [rsdataitem];
            }
          }
        }
      });
      const p2 = this.moduleGetProjectAndEnv(_data).then(rsdata => {
        if (rsdata.length > 0) {
          this.projectEnvList = rsdata;
          for (let rsdataitem of rsdata) {
            if (rsdataitem.appId != -99) {
              this.showProjectList.push(rsdataitem);
            }
          }
          this.showProjectList = customSortMethod(
            { prop: 'appName' },
            this.showProjectList
          );
          this.allProjectList = this.showProjectList;
        }
      });
      Promise.allSettled([p1,p2]).then(() => {
        if (this.showProjectList.length > 0) {
          this.$nextTick(this.initSelected);
        } else {
          this.$router.push('/noAuth');
        }
      });
    },
    initEnvByRouter(_envList) {
      let _envId =
        this.$route.query.project || this.$route.query.nowprojectapp;
      for (let i = 0; i < _envList.length; i++) {
        const _env = _envList[i];
        if (_env.appId == _envId) {
          return _env.appId;
        }
      }
      return this.envList[0].appId;
    },
    initEnvBySave(_envList) {
      let saveEnvId = 0;
      if (
        this.pageState != null &&
        this.pageState.selectenv != undefined
      ) {
        saveEnvId = this.pageState.selectenv;
      }

      for (let i = 0; i < _envList.length; i++) {
        const _env = _envList[i];
        if (_env.appId == saveEnvId) {
          return Number(saveEnvId);
        }
      }
      return this.envList[0].appId;
    },


    initSelected() {
      let _selectFirst = true;
      if (
        this.pageState != null &&
        this.pageState.selectproject != undefined
      ) {
        this.nowProjectId = this.pageState.selectproject;
      }
      if (this.nowProjectId > 0) {
        _selectFirst = false;
      }
      let _envOrProject = this.initByRouter();
      if (_selectFirst && _envOrProject === '') {
        let item = this.showProjectList[0];
        this.nowProjectId = item.appId;
      }
      this.nowprojectchange(this.nowProjectId, _envOrProject);
    },
    initByRouter() {
      let _envOrProject = "";
      let _nowprojectapp = this.$route.query.project || this.$route.query.nowprojectapp;
      if (_nowprojectapp != undefined) {
        _envOrProject = this.getEnvOrProject(_nowprojectapp);
        if (_envOrProject === null || _envOrProject.length === 0) {
          // 该用户没有此项目的权限
          this.$message.warning('您没有这个项目的查看权限，如有需要请联系蒙龙开通');
          this.nowProjectId = null;
        } else {
          this.nowProjectId = _nowprojectapp;
        }
      }
      return _envOrProject;
    },
    getEnvOrProject(_id) {
      let type = null;
      for (let i = 0; i < this.showProjectList.length; i++) {
        const _projectItem = this.showProjectList[i];
        if (_projectItem.appId == _id) {
          type = 'project';
        }
        if (_projectItem.childes != undefined) {
          let envList = _projectItem.childes;
          for (let j = 0; j < envList.length; j++) {
            const envItem = envList[j];
            if (envItem.appId == _id) {
              type = 'env';
            }
          }
        }
      }
      return type;
    },
    filter(v) {
      if (v) {
        this.showProjectList = this.allProjectList.filter(item => {
          //如果直接包含输入值直接返回true
          if (item.appName.toLowerCase().includes(v.toLowerCase())) {
            return true;
          } else {
            const appNameSpell = item.appName.spell('low');
            if (appNameSpell.includes(v.spell('low'))) {
              return true;
            } else {
              return false;
            }
          }
        });
      } else {
        this.showProjectList = this.allProjectList;
      }
    },
    filterClear() {
      this.showProjectList = this.allProjectList;
    }
  },
  mounted() {
    this.initList();
  }
};
</script>

<style lang="scss" scoped>
.tooporjectselect {
  position: absolute;
}



.tooporjectselect  :deep(.el-select__wrapper) {
  background-color: transparent;
  background-image: none;
  box-shadow: 0 0 0 0;
  &:hover{
    box-shadow: 0 0 0 0 !important;
  }
  &:active{
    box-shadow: 0 0 0 0 !important;
  }
  &:focus{
    box-shadow: 0 0 0 0 !important;
  }
}

.tooporjectselect  :deep(.el-select .el-input.is-focus .el-select__wrapper) {
  box-shadow: 0 0 0 0 !important;
}

.tooporjectselect  :deep( .el-select .el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 0 !important;
}

.tooporjectselect  :deep(.el-select__suffix) {
  display: inline-block;
  font-size: 14px;
  line-height: 43px !important;
}

.tooporjectselect  :deep(.el-select__placeholder) {
  color: #fff;
}

.tooporjectselect :deep(.el-select__input){
  color: #ffffff;
}


.tooporjectselect :deep( .el-divider--vertical){
  background-color: #409EFF !important;
  width: 1px !important;
  height: 20px !important;
  border: 0 !important;
  margin-top: -2px !important;

}
.topbarlabelcss {
  font-size: 12px;
  color: #c1c6c8;//#676776;
  margin-left: 5px;
}



</style>
