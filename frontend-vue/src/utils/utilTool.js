import { ElMessage } from "element-plus";
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()

/**
 * 校验请求响应结果的Code值，做出统一的异常提示
 * @param response
 */
export function checkResponseCode(response) {
  if (response.code != 20000 && response.code != 0 && response.code != 10000) {
    ElMessage({
      message: (response.msg || response.message) + " " + response.data,
      type: "error",
      duration: 3 * 1000,
    });
    return null;
  } else {
    let _data = response.data;
    if ('total' in response) {
      _data = response
    }

    return _data;
  }
}


export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}


/**
 * 自定义排序方法
 */
export function customSortMethod(column, dataList) {
  const prop = column.prop;
  let numberList = [];
  let stringList = [];
  let chineseList = [];
  let blankList = [];
  let temp;
  //数据只有0或1条，则直接返回
  if (dataList.length <= 1) return dataList;
  for (let i = 0; i < dataList.length; i++) {
    if (/^[-]?[0-9]+$/.test(dataList[i][prop])) {
      numberList.push(dataList[i]);
    } else if (dataList[i][prop] == null || dataList[i][prop] === "") {
      blankList.push(dataList[i]);
    } else if (
      /^[-]?[0-9]/.test(dataList[i][prop][0]) ||
      /^[A-Za-z]/.test(dataList[i][prop][0])
    ) {
      stringList.push(dataList[i]);
    } else {
      chineseList.push(dataList[i]);
    }
  }
  if (column.order === "ascending" || column.order == null) {
    for (let i = 1; i < numberList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (parseInt(numberList[j][prop]) < parseInt(numberList[j - 1][prop])) {
          temp = numberList[j];
          numberList[j] = numberList[j - 1];
          numberList[j - 1] = temp;
        } else break;
      }
    }
    for (let i = 1; i < stringList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (
          stringList[j][prop].spell("low") <
          stringList[j - 1][prop].spell("low")
        ) {
          temp = stringList[j];
          stringList[j] = stringList[j - 1];
          stringList[j - 1] = temp;
        } else break;
      }
    }
    for (let i = 1; i < chineseList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (
          chineseList[j][prop].spell("low") <
          chineseList[j - 1][prop].spell("low")
        ) {
          temp = chineseList[j];
          chineseList[j] = chineseList[j - 1];
          chineseList[j - 1] = temp;
        } else break;
      }
    }
    dataList = [];
    dataList = dataList.concat(numberList, stringList, chineseList, blankList);
  } else if (column.order === "descending") {
    for (let i = 1; i < numberList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (parseInt(numberList[j][prop]) > parseInt(numberList[j - 1][prop])) {
          temp = numberList[j];
          numberList[j] = numberList[j - 1];
          numberList[j - 1] = temp;
        } else break;
      }
    }
    for (let i = 1; i < stringList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (
          stringList[j][prop].spell("low") >
          stringList[j - 1][prop].spell("low")
        ) {
          temp = stringList[j];
          stringList[j] = stringList[j - 1];
          stringList[j - 1] = temp;
        } else break;
      }
    }
    for (let i = 1; i < chineseList.length; i++) {
      for (let j = i; j > 0; j--) {
        if (
          chineseList[j][prop].spell("low") >
          chineseList[j - 1][prop].spell("low")
        ) {
          temp = chineseList[j];
          chineseList[j] = chineseList[j - 1];
          chineseList[j - 1] = temp;
        } else break;
      }
    }
    dataList = [];
    dataList = dataList.concat(chineseList, stringList, numberList, blankList);
  }
  return dataList;
}

// 复制到剪贴板的通用方法
export const copyToClipboard = (text) => {
  toClipboard(text).then(
    () => {
      ElMessage.success('复制成功')
    },
    (err) => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败，请手动复制')
    }
  )
}
