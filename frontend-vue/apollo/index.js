'use strict';
const urllib = require('urllib');
const fs = require('fs');
const crypto = require('crypto')


/*========================== 改这些就好了，其它不要动 ==========================*/
let apollo = {
    appId: 'gopcmdb-ui',
    clusterName: 'GZSX',
    namespaces: ['application', 'omms-tech-common'],
    secret: process.env.KS_APOLLO_KEY || '3c9eda00358e48859181e63665e6e3be'
};

let configFile = './src/apollo-config.js';

/*========================== 改这些就好了，其它不要动 ==========================*/

let configs = {};

let configServerUrl =
    process.env.KS_ZH_APOLLO ||
    'http://10.11.66.160:8080';

console.log('同步apollo 配置数据');


let sign = {
    apollo: apollo,
    genAuthHeaders(reqUrl, secret) {
        const Timestamp = Date.now()
        const Authorization = this.genSignature(reqUrl, Timestamp, secret)
        return secret
            ? {
                Authorization,
                Timestamp
            }
            : {}
    },
    genSignature(url, timestamp, secret) {
        const hmac = crypto.createHmac('sha1', secret)
        const signature = hmac
            .update(`${timestamp}\n${this.url2PathWithQuery(url)}`)
            .digest()
            .toString('base64')
        return `Apollo ${this.apollo.appId}:${signature}`
    },
    url2PathWithQuery(urlString) {
        const url = new URL(urlString)
        const path = url.pathname
        const query = url.search
        let pathWithQuery = path
        if (query && query.length > 0) pathWithQuery += query
        return pathWithQuery
    }
}

let run = async () => {
    let uris = apollo.namespaces.map(v => {
        return `${configServerUrl}/configs/${apollo.appId}/${apollo.clusterName}/${v}`;
    });
    const bundle = await Promise.all(
        uris.map(uri => urllib.request(uri, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                ...sign.genAuthHeaders(uri, apollo.secret)
            },
            contentType: 'json',
            dataType: 'json'
        }))
    );
    bundle.forEach((v, i) => {
        if (v.status !== 200) {
            throw `${apollo.namespaces[i]}配置获取失败`;
        }
        configs[v.data.namespaceName] = v.data.configurations;
    });
    configs['cmdb-front'] = configs['omms-cmdb-front']
    configs['tech-common'] = configs['omms-tech-common']
    let configStr = JSON.stringify(configs);
    fs.writeFileSync(
        configFile,
        `/* eslint-disable */
    export default ${configStr}`,
        err => {
            if (err) {
                console.error(err);
                return;
            }
        }
    );
    console.log('apollo 配置数据同步完成');
};
run();
