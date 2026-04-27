/**
 * 从权限系统中获取应用权限
 */
import request from "../utils/request";
let basePath = "/api/cmdb_permission/v1"
export function getPermissionDataPage(params) {
    return request({
        url: `${basePath}/rules/get_page`,
        method: "GET",
        params
    });
}

// 获取用户权限
export function deletePermissionData(params) {
    return request({
        url: `${basePath}/rules/${params.ids}`,
        method: "DELETE",
    });
}

// 获取项目和环境列表
export function addPermissionData(data) {
    return request({
        url: `${basePath}/rules`,
        method: 'POST',
        data
    });
}

// 获取项目和环境列表
export function getPermissionData(data) {
    return request({
        url: `${basePath}/rules/${data.id}`,
        method: 'GET'
    });
}

// 获取项目和环境列表
export function updatePermissionData(data) {
    return request({
        url: `${basePath}/rules/${data.id}`,
        method: 'PUT',
        data
    });
}

//应用实例
//获取应用实例列表
export function getPageApp(params) {
    return request({
        url: `${basePath}/apps/get_page`,
        method: "GET",
        params
    });
}

export function addApp(data) {
    return request({
        url: `${basePath}/apps`,
        method: "POST",
        data
    });
}

export function updateApp(data) {
    return request({
        url: `${basePath}/apps/${data.id}`,
        method: 'PUT',
        data
    });
}

export function deleteApp(params) {
    return request({
        url: `${basePath}/apps/${params.ids}`,
        method: "DELETE",
    });
}

//资源类型
//获取资源类型列表
export function getPageResourceTypeData(params) {
    return request({
        url: `${basePath}/resource_types/get_page`,
        method: "GET",
        params
    });
}

// 创建资源类型
export function addResourceType(data) {
    return request({
        url: `${basePath}/resource_types`,
        method: 'POST',
        data
    });
}

// 删除资源类型
export function deleteResourceType(params) {
    return request({
        url: `${basePath}/resource_types/${params.id}`,
        method: "DELETE",
    });
}

// 更新资源类型
export function updateResourceType(data) {
    return request({
        url: `${basePath}/resource_types/${data.id}`,
        method: 'PUT',
        data
    });
}

// 获取资源类型实例详情
export function getResourceType(params) {
    return request({
        url: `${basePath}/resource_types/${params.id}`,
        method: 'GET'
    });
}


//资源类型权限
//获取资源类型权限列表
export function getPagePermission(params) {
    return request({
        url: `${basePath}/permission/get_page`,
        method: 'GET',
        params
    });
}

// 创建资源类型权限
export function addPermission(data) {
    return request({
        url: `${basePath}/permission`,
        method: 'POST',
        data
    });
}

// 删除资源类型权限
export function deletePermission(params) {
    return request({
        url: `${basePath}/permission/${params.ids}`,
        method: "DELETE",
    });
}

// 更新资源类型权限
export function updatePermission(data) {
    return request({
        url: `${basePath}/permission/${data.id}`,
        method: 'PUT',
        data
    });
}

//资源实例
//获取资源实例列表
export function getPageResource(params) {
    return request({
        url: `${basePath}/resource/get_page`,
        method: "GET",
        params
    });
}

// 删除资源实例
export function deleteResource(params) {
    return request({
        url: `${basePath}/resource/${params.ids}`,
        method: "DELETE",
    });
}

// 添加资源实例
export function addResource(data) {
    return request({
        url: `${basePath}/resource`,
        method: 'POST',
        data
    });
}

// 获取资源实例
export function getResource(data) {
    return request({
        url: `${basePath}/resource/${data.id}`,
        method: 'GET'
    });
}

// 更新资源实例
export function updateResource(data) {
    return request({
        url: `${basePath}/resource/${data.id}`,
        method: 'PUT',
        data
    });
}

// 资源授权列表
export function getResourceRolePermissionsApi(params) {
    return request({
        url: `${basePath}/resource/${params.id}/role_permissions`,
        method: 'GET',
    });
}

// 为资源实例授权角色
export function grantResourceToRoleApi(data) {
    return request({
        url: `${basePath}/resource/grant_to_roles`,
        method: 'POST',
        data
    });
}

// 获取资源实例关联的角色列表
export function getResourceRolesApi(params) {
    return request({
        url: `${basePath}/resource/${params.id}/get_resource_roles`,
        method: 'GET',
    });
}

// 从角色中撤销资源授权
export function revokeResourceFromRoleApi(data) {
    return request({
        url: `${basePath}/resource/revoke_from_role`,
        method: 'POST',
        data
    });
}



//角色管理
//获取角色列表
export function getPageRoleApi(params) {
    return request({
        url: `${basePath}/roles/get_page`,
        method: "GET",
        params
    });
}

// 添加角色
export function addRoleApi(data) {
    return request({
        url: `${basePath}/roles`,
        method: 'POST',
        data
    });
}

// 删除角色
export function deleteRoleApi(params) {
    return request({
        url: `${basePath}/roles/${params.ids}`,
        method: "DELETE",
    });
}

// 更新角色
export function updateRoleApi(data) {
    return request({
        url: `${basePath}/roles/${data.id}`,
        method: 'PUT',
        data
    });
}

// 获取角色详情
export function getRoleApi(params) {
    return request({
        url: `${basePath}/roles/${params.id}`,
        method: 'GET'
    });
}

// 更新（绑定）角色关联关系
export function updateRoleRelationApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/roles`,
        method: 'POST',
        data
    });
}

// 授权角色权限
export function grantRolePermissionApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/resource/${data.resource_id}/grant`,
        method: 'POST',
        data
    });
}

// 取消角色权限
export function revokeRolePermissionApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/resource/${data.resource_id}/revoke`,
        method: 'POST',
        data
    });
}

// 绑定角色用户
export function addRoleUsersApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/users`,
        method: 'POST',
        data
    });
}

// 解绑角色用户
export function deleteRoleUsersApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/users`,
        method: "DELETE",
        data
    });
}

/* 
获取角色绑定的用户列表（casbin）
request
app_id = 1
role_id" = 20

response
[
    {
        "id": 4,
        "uid": "test_user_1",
    }
]
*/
export function getCasbinRoleUsersApi(params) {
    return request({
        url: `${basePath}/roles/get_users`,
        method: 'GET',
        params
    });
}

/* 
更新角色绑定的用户列表（casbin）
request
{
    "app_id": 1,
    "role_id": 20,
    "user_ids": [
        "tset_user_1"
    ]
}
 */
export function updateCasbinRoleUsersApi(data) {
    return request({
        url: `${basePath}/roles/${data.role_id}/update_users`,
        method: 'POST',
        data
    });
}

//用户
//获取用户权限
export function getUserPermissionsApi(params) {
    return request({
        url: `${basePath}/users/permissions`,
        method: "GET",
        params
    });
}

//获取用户列表
export function getPageUserApi(params) {
    return request({
        url: `${basePath}/users/get_page`,
        method: "GET",
        params
    });
}

//同步koa用户
export function syncKoaGroupUsersApi(data) {
    return request({
        url: `${basePath}/users/sync_koa_group_users`,
        method: "POST",
        data
    });
}

//获取koa用户详情
export function getKoaUserInfoApi(params) {
    return request({
        url: `${basePath}/users/koa_user_info`,
        method: 'GET',
        params
    });
}

//获取用户详情
export function getUserApi(params) {
    return request({
        url: `${basePath}/users/${params.id}`,
        method: 'GET'
    });
}

// 批量更新用户-项目关系
export function replaceUserProjectsApi(data) {
    return request({
        url: `${basePath}/users/${data.user_id}/projects/replace`,
        method: 'POST',
        data
    });
}

// 更新用户项目权限
export function updateUserProjectsPermissionApi(data) {
    return request({
        url: `${basePath}/users/update_project_permissions`,
        method: 'POST',
        data
    });
}

// 获取用户权限总览
export function getUserPermissionsOverviewApi(params) {
    return request({
        url: `${basePath}/users/${params.user_id}/overview_permissions`,
        method: 'GET',
        params
    });
}

// 获取登录用户信息
export function getLoginUserInfoApi() {
    return request({
        url: `${basePath}/users/me`,
        method: 'GET',
    });
}

// 获取用户应用角色
export function getUserAppRolesApi(params) {
    return request({
        url: `${basePath}/users/${params.user_id}/get_app_roles`,
        method: 'GET',
        params
    });
}

// 更新用户绑定应用角色
export function updateUserAppRolesApi(data) {
    return request({
        url: `${basePath}/users/${data.user_id}/update_app_roles`,
        method: 'POST',
        data
    });
}

//项目
//获取项目列表
export function getPageProjectApi(params) {
    return request({
        url: `${basePath}/project/get_page`,
        method: "GET",
        params
    });
}

// 获取项目详情
export function getProjectApi(params) {
    return request({
        url: `${basePath}/project/${params.project_id}`,
        method: "GET",
    });
}

// 同步tc项目信息
export function syncTcProjectApi(data) {
    return request({
        url: `${basePath}/project/sync`,
        method: 'POST',
        data
    });
}

export function grantProjectUsersApi(data) {
    return request({
        url: `${basePath}/project/${data.project_id}/users`,
        method: data.method,
        data
    });
}

//获取下拉列表数据（无分页）
//
export function getSelectionApi(params) {
    return request({
        url: `${basePath}/selection/${params.type}`,
        method: 'GET',
    });
}


//ServiceToken
//获取ServiceToken列表
export function getPageServiceTokenApi(params) {
    return request({
        url: `${basePath}/service_token/get_page`,
        method: "GET",
        params
    });
}

//创建ServiceToken
export function createServiceTokenApi(data) {
    return request({
        url: `${basePath}/service_token`,
        method: 'POST',
        data
    });
}

//删除ServiceToken
export function deleteServiceTokenApi(params) {
    return request({
        url: `${basePath}/service_token/${params.ids}`,
        method: "DELETE",
    });
}

//获取ServiceToken详情
export function getServiceTokenApi(params) {
    return request({
        url: `${basePath}/service_token/${params.id}`,
        method: 'GET',
    });
}

//更新ServiceToken
export function updateServiceTokenApi(data) {
    return request({
        url: `${basePath}/service_token/${data.id}`,
        method: 'PUT',
        data
    });
}

//禁用、启用serviceToken
export function updateActionServiceTokenApi(data) {
    return request({
        url: `${basePath}/service_token/${data.id}/${data.action}`,
        method: 'PATCH',
    });
}

//获取ServiceToken已绑定角色列表
export function getCasbinAppRolesApi(params) {
    return request({
        url: `${basePath}/service_token/${params.user_id}/get_app_roles`,
        method: 'GET',
        params
    });
}

//ServiceToken绑定角色
export function updateCasbinAppRolesApi(data) {
    return request({
        url: `${basePath}/service_token/${data.user_id}/update_app_roles`,
        method: 'POST',
        data
    });
}

// Api
// 获取API列表
export function getPageApiApi(params) {
    return request({
        url: `${basePath}/api/get_page`,
        method: "GET",
        params
    });
}

// 添加API
export function addApiApi(data) {
    return request({
        url: `${basePath}/api`,
        method: "POST",
        data
    });
}

// 更新API信息
export function updateApiApi(data) {
    return request({
        url: `${basePath}/api/${data.id}`,
        method: 'PUT',
        data
    });
}

// 删除API
export function deleteApiByIdsApi(params) {
    return request({
        url: `${basePath}/api/${params.ids}`,
        method: "DELETE",
    });
}

// excel导入api信息
// app_id string
// file file
export function importApiExcelApi(data) {
    return request({        
        url: `${basePath}/api/import_excel`,
        method: "POST",
        data,
        headers: {
            'Content-Type': "multipart/form-data", // 或者直接删除该字段
        },
    });
}

// 获取API分组
export function getApiGroupsApi(params) {
    return request({
        url: `${basePath}/api/groups/${params.app_id}`,
        method: "GET",
    });
}

// 获取App的API列表
export function getAllApiByAppApi(params) {
    return request({
        url: `${basePath}/api/app/${params.app_id}`,
        method: "GET",
    });
}

// 获取角色已授权API 
export function getApiRoleGrantedApi(params) {
    return request({
        url: `${basePath}/api/role/get_granted`,
        method: "GET",
        params
    });
}

// 授权API到角色
export function grantApiToRoleApi(data) {
    return request({
        url: `${basePath}/api/role/grant`,
        method: "POST",
        data
    });
}

// casbin
// 刷新Casbin缓存 
export function refreshApiCasbinCacheApi(data) {
    return request({
        url: `${basePath}/casbin/refresh_cache`,
        method: "POST",
        data
    });
}
