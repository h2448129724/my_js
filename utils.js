const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

function getDate() {
  // 创建一个Date对象以获取当前时间
  var now = new Date();

  // 获取年份
  var year = now.getFullYear();

  // 获取月份（注意：月份是从0开始的，所以要+1）
  var month = now.getMonth() + 1;
  // 确保月份是两位数（如果小于10，前面补0）
  month = month < 10 ? "0" + month : month;

  // 获取日期
  var date = now.getDate();
  // 确保日期是两位数（如果小于10，前面补0）
  date = date < 10 ? "0" + date : date;

  // 使用模板字符串拼接日期
  var formattedDate = `${year}-${month}-${date}`;

  // 返回格式化后的日期字符串
  return formattedDate;
}

function getJsonFileInfo(fileName) {
  return new Promise((resolve, reject) => {
    // 获取当前日期，并格式化为 yyyy-MM-dd
    const filePath = path.join(__dirname, fileName); // 确保文件路径正确
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      // 文件存在，读取并更新数据
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          reject(`文件${fileName}读取失败`);
          return;
        }

        try {
          // 解析JSON数据
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          reject(`文件${fileName}读取失败,格式化json异常`);
        }
      });
    } else {
      console.log(`文件${fileName}不存在,开始创建文件`);
      // 文件不存在，创建文件并写入数据
      fs.writeFile(filePath, JSON.stringify([]), "utf8", (err) => {
        if (err) {
          console.log(`文件${fileName}创建失败`);
          reject(`文件${fileName}创建失败`);
          return;
        }
        console.log(`文件${fileName}创建成功`);
        resolve([]);
      });
    }
  });
}

function getJsonObjFileInfo(fileName) {
  return new Promise((resolve, reject) => {
    // 获取当前日期，并格式化为 yyyy-MM-dd
    const filePath = path.join(__dirname, fileName); // 确保文件路径正确
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      // 文件存在，读取并更新数据
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          reject(`文件${fileName}读取失败`);
          return;
        }

        try {
          // 解析JSON数据
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          reject(`文件${fileName}读取失败,格式化json异常`);
        }
      });
    } else {
      console.log(`文件${fileName}不存在,开始创建文件`);
      // 文件不存在，创建文件并写入数据
      fs.writeFile(filePath, JSON.stringify([]), "utf8", (err) => {
        if (err) {
          console.log(`文件${fileName}创建失败`);
          reject(`文件${fileName}创建失败`);
          return;
        }
        console.log(`文件${fileName}创建成功`);
        resolve({});
      });
    }
  });
}

function writeJsonToFile(fileName, jsonData) {
  return new Promise((resolve, reject) => {
    // 获取当前日期，并格式化为 yyyy-MM-dd
    const filePath = path.join(__dirname, fileName); // 确保文件路径正确
    // 检查文件是否存在
    try {
      // 将更新后的数据写回文件
      fs.writeFile(filePath, JSON.stringify(jsonData), "utf8", (err) => {
        if (err) throw err;
        resolve(`文件${fileName}写入成功`);
      });
    } catch (e) {
      reject(`文件${fileName}写入失败`);
    }
  });
}

function getJsonFromExcel(fileName) {
  try {
    // 构造完整的文件路径
    const fullPath = path.resolve(__dirname, fileName);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      throw new Error(`文件不存在: ${fullPath}`);
    }

    // 读取文件内容
    const fileBuffer = fs.readFileSync(fullPath);

    // 解析文件为工作簿
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // 假设我们只关心第一个工作表
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // 将工作表转换为JSON对象数组
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 假设第一行是标题行
    if (jsonData && jsonData.length > 0) {
      const titleList = jsonData[0];
      const titleCount = titleList.length;
      const dataList = jsonData.slice(1);
      const newJsonData = [];
      dataList.forEach((element) => {
        if (element.length > 0) {
          const newJsonObj = {};
          for (let index = 0; index < titleCount; index++) {
            const value = element[index];
            const key = titleList[index];
            const newKey = getKey(key);
            if (newKey === "address") {
              if (value) {
                const addressList = value.split(":");
                if (addressList.length === 4) {
                  newJsonObj.host = addressList[0];
                  newJsonObj.port = addressList[1];
                  newJsonObj.proxyUserName = addressList[2];
                  newJsonObj.proxyPassword = addressList[3];
                } else {
                  newJsonObj[`${newKey}`] = value;
                }
              }
            } else {
              newJsonObj[`${newKey}`] = value;
            }
          }
          newJsonData.push(newJsonObj);
        }
      });
      return newJsonData;
    } else {
      return [];
    }
  } catch (e) {
    console.log("文件读取失败", e);
    return [];
  }
}


function getKey(keyText) {
  switch (keyText) {
    case "账号":
      return "userName";
    case "密码":
      return "password";
    case "辅助邮箱":
      return "remark";
    case "socks5":
      return "address";
    case "号码":
      return "phone";
    case "内容":
      return "message"
  }
}

module.exports = {getDate, getJsonFileInfo, writeJsonToFile, getJsonFromExcel,getJsonObjFileInfo};
