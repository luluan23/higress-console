/**
 * create by sxf on 2019/3/7.
 * 功能:
 */
import axios from "axios";
import * as Settings from "./../settings";
// 创建axios实例
const service = axios.create({
  baseURL: window.__MICRO_APP_ENVIRONMENT__  ?  window.location.protocol + "//"+window.location.host : "", // api 的 base_url
  timeout: 0, // 请求超时时间
  withCredentials: true, // send cookies when cross-domain requests
  headers: {
    "Content-Type": "application/json",
  },
});
let loadingInstance = null;
var CancelToken = axios.CancelToken;
let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识

// request拦截器
service.interceptors.request.use(
  (config) => {
    config.cancelToken = new CancelToken((c) => {
      // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
      pending.push({ u: config.url + "&" + config.method, f: c });
    });
    return config;
  },
  (error) => {
    if (loadingInstance != null) {
      loadingInstance.close();
    }
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    if (response.data.code === -210000 || response.data.code === 10008) {
      let _redirecturl;

      if (Settings.default.isDevelopMode) {
        // 开发使用
        _redirecturl =
          response.data.data.redirect +
          "?service=" +
          encodeURIComponent(
            Settings.default.developVerifyTicketUrl +
              "?from=" +
              encodeURIComponent(window.location.href)
          );
      } else {

        // 处理qa环境ticket路径异常
        if (response.data.data.service==="https://tc-qa.seasungame.com/verifyTicket" ){
          response.data.data.service = "https://tc-qa.seasungame.com/tech/verifyTicket"
        }
        if (response.data.data.service==="https://tech-dev.seasungame.com/verifyTicket" ){
          response.data.data.service = "https://tech-dev.seasungame.com/tech/verifyTicket"
        }
          if (response.data.data.service==="https://tech.seasungame.com/verifyTicket" ){
          response.data.data.service = "https://tech.seasungame.com/tech/verifyTicket"
        }

        // 部署使用
        _redirecturl =
          response.data.data.redirect +
          "?service=" +
          encodeURIComponent(
            response.data.data.service +
              "?from=" +
              encodeURIComponent(window.location.href)
          );
      }
      var isChrome = window.navigator.userAgent.indexOf("Chrome");
      if (isChrome === -1) {
        top.location.href = "./remind.html";
      } else {
        top.location.href = _redirecturl;
      }
    } else {
      return response.data;
    }
  },
  (error) => {
    console.log("err" + error); // for debug
    //console.log(error.response.status);
    if (error && error.response) {
      console.log(error.response.status);
    }
    return { code: 500, msg: error, data: [] };
  }
);

export default service;
