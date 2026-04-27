import moment from 'moment/moment';
import Settings from "../../settings";
import { useTechStore } from '@/stores';
import request from '../../utils/request.js';
import { storeToRefs } from 'pinia'


function uploadlog(data) {
    let _url = Settings.logsServerUrl;
    return request({
        url: _url,
        method: 'post',
        data
    });
}

export function Buried(pageName, actionName, content,cost) {
    try {
        const techStore = useTechStore()
        const { userInfo,nowProjectAppName } = storeToRefs(techStore)
        let _logdata = {};
        _logdata.log_name = Settings.logsTableName;
        _logdata.log_ts = moment().format('YYYY-MM-DD HH:mm:ss');
        _logdata.pageName = pageName;
        _logdata.actionName = actionName;
        _logdata.microapp = 'bigDataSystem';

        if (content) {
            _logdata.content = content;
        }
        if (cost) {
            _logdata.cost = cost;
        }
        if (userInfo != null && userInfo.value != null) {
            _logdata.userId = userInfo.value.userId;
            _logdata.projectname = nowProjectAppName.value;
            uploadlog(_logdata).then(() => {
                console.log('上报成功');
            });
        } else {
            useTechStore.moduleGetUserinfo()
              .then(() => {
                  _logdata.userId = userInfo.value.userId;
                  _logdata.projectname = nowProjectAppName.value;
                  uploadlog(_logdata).then(() => {
                      console.log('上报成功');
                  });
              })
              .catch(error => {
                  console.log('上报失败', error);
              });
        }
    }catch (e){
        console.error(e)
    }

}
