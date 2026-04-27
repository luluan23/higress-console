import apolloConfig from './apollo-config';
let {
  application,
  'tech-common': techCommon
} = apolloConfig;
let typeMap = {}
if (application.typeMap) {
  try {
    typeMap = JSON.parse(application.typeMap)
  } catch (e) {
    console.log('typeMap 解析失败')
  }
}
export default {
  /**
* 项目名称
*/
  projectTitle: "权限管理",
  /**
   * 项目名称
   */
  projectName: "goppermission-ui",
  /**
   * 当前的系统模式是否是开发模式
   * 影响请求权限校验机制*/
  isDevelopMode: application.isDevelopMode === "true",
  /**
   * 开发模式下的请求校验服务地址
   */
  developVerifyTicketUrl: application.developVerifyTicketUrl,

  /**
   * 布局模式 horizontal（菜单栏在上部） vertical （菜单栏在左边） none（不用默认布局）
   */
  layoutMode: application.layoutMode,
  /**
   * SSO服务地址*/
  ssoServerUrl: techCommon.ssoServerUrl,
  /**
   * main服务地址
   */
  mainServerUrl: application.url,
  /**
   * 当前用户权限 'admin' 'user' 'developer' (这个权限可以控制菜单，一般如果要控制用户权限，需要修改Permission.js 从服务端获取权限)
   */
  userRole: JSON.parse(application.userRole),

  /**
   * 是否启用事件总线（因为事件总线往往不是必须的，且容易影响性能所以不在必须的情况下不启动）
   */
  useBus: application.userRole === 'true',
  /**
   * 埋点数据上报的地址 (需要联系技术中心 获取地址)
   */
  logsServerUrl: application.logsServerUrl,
  /**
   *  埋点上传的表名
   */
  logsTableName: application.logsTableName,

  /**
   *  是否使用mock
   */
  useMock: application.useMock === 'true',

  /**
   *  是否启用菜单权限控制
   */
  userPrivileges: application.userPrivileges === 'true',

  typeId: application.typeId,
  projectId: application.projectId,
  typeMap
};
