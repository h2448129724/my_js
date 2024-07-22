
const {
  openBrowser,
  closeBrowser,
  getGroupList,
  getBrowserList,
} = require("./request");
const puppeteer = require("puppeteer");
const {getDate, getJsonFileInfo, writeJsonToFile, getJsonFromExcel, getJsonObjFileInfo} = require("./utils");
const {loginToGV, getVisibleElement} = require("./register");
const {delayed} = require("selenium-webdriver/lib/promise");
const chrome = require("selenium-webdriver/chrome");
const webdriver = require("selenium-webdriver");
const {sendMessage, testSendMessage} = require("./sendmsg");
const path = require("path");
const fs = require("fs");
// 主程序
// main1();


main1();

async function main2() {
  const openRes = await openWindow('701b43dfc65144a6b5a32f4e65389a4f')
  if (openRes.success) {
    const driver = getDriver(openRes)
    const isSuccess = await loginToGV(driver, 'wurthkinnett@gmail.com', 'pzgsgkrpko', 'pyramidellidaeknonascendancy7726@outlook.com')
    if (isSuccess) {
      console.log('gv注册成功')
      await testSendMessage(driver)
    } else {
      console.log('gv注册失败')
    }
    const service = chrome.getDefaultService()
    if (service) {
      await service.kill()
      await delayed(2000)
    }
  }
}

async function waitUntilGetOneElement(driver, identity, timeout) {
  let curDateTimestamp = new Date().getTime()
  while (new Date().getTime() - curDateTimestamp < timeout) {
    try {
      for (let i = 0; i < identity.length; i++) {
        const element = await getVisibleElement(driver, identity[i], 2000)
        if (element) {
          return i
        }
      }
    } catch (e) {
      console.log('未获取到元素', e)
    }
  }
}

async function openWindow(windowId) {
  const openRes = await openBrowser({
    id: windowId,
    args: [],
    loadExtensions: false,
    extractIp: false
  })
  return openRes
}

function getDriver(windowInfo) {
  let options = new chrome.Options()
  options.options_['debuggerAddress'] = windowInfo.data.http
  // options.options_['prefs'] = { 'profile.default_content_setting_values': { images: 2 } }

  let driverPath = windowInfo.data.driver
  service = new chrome.ServiceBuilder(driverPath).build()
  chrome.setDefaultService(service)

  driver = new webdriver.Builder()
      .setChromeOptions(options)
      .withCapabilities(webdriver.Capabilities.chrome())
      .forBrowser('chrome')
      .build()
  return driver
}

async function updateLocalInfo(curGroupWindowInfoList, preWindowInfoList, curGroupWindowListFile, preWindowListFile) {
  for (let i = 0; i < curGroupWindowInfoList.length; i++) {
    let accountInfo = curGroupWindowInfoList[i]
    let elementIndex = preWindowInfoList.findIndex(item => item.id === accountInfo.id)
    preWindowInfoList[elementIndex] = accountInfo;
  }
  await writeJsonToFile(curGroupWindowListFile, curGroupWindowInfoList);
  await writeJsonToFile(preWindowListFile, preWindowInfoList)
}

async function main1() {
  if (process.argv.length === 3) {
    console.log('开始运行发送短信脚本，配置文件为:', process.argv[2])
  } else {
    console.log('运行发送短信脚本失败，未指定配置文件')
    return
  }
  const configFileName = process.argv[2]
  //1:添加窗口
  //1.1获取窗口信息json文件
  const dateStr = getDate();
  const settingInfo = await getSendMsgConfigInfo(configFileName);
  if (!settingInfo || !settingInfo.groupName || !settingInfo.messageFileName) {
    console.log(`发送消息配置文件读取失败，请检查配置文件./file/setting/${configFileName}.json是否配置正确,groupName应该配置为账号分组名称,messageFileName应该配置为消息文件名称`)
    return
  }
  const messageFileName = `./file/message_excel_info/${settingInfo.messageFileName}.xlsx`;
  const filePath = path.join(__dirname, messageFileName); // 确保文件路径正确
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log(`消息数据文件${messageFileName}不存在，请先添加消息数据文件`)
    return
  }

  const groupName = settingInfo.groupName;
  const groupId = await checkGroupExist(groupName);
  if (!groupId) {
    console.log(`分组不存在,请检查配置文件./file/setting/${configFileName}.json中的groupName是否正确`)
    return
  }

  const curGroupWindowListFile = `./file/window_info/${groupName}.json`;
  const preWindowListFile = `./file/window_info/all.json`;


  const browserListResp = await getBrowserList({page: 0, pageSize: 100, groupId: groupId});
  if (browserListResp && browserListResp.success) {
    console.log(`获取${groupName}分组窗口信息成功,共有${browserListResp.data.totalNum}个窗口`)
    const windowList = browserListResp.data.list
    if (windowList && windowList.length > 0) {
      //1.2.1 获取当前已有窗口信息
      const curGroupWindowInfoList = await getJsonFileInfo(curGroupWindowListFile);
      //1.2.2 获取既往已有窗口信息
      const preWindowInfoList = await getJsonFileInfo(preWindowListFile);
      for (let i = 0; i < windowList.length; i++) {
        const curWindow = windowList[i]
        if (!curGroupWindowInfoList.find(item => item.id === curWindow.id)) {
          console.log(`窗口${curWindow.seq}不存在本地文件记录中(直接再比特浏览器中添加而非通过脚本添加会出现这种情况)，向本地文件记录中添加此窗口`)
          curGroupWindowInfoList.push(curWindow)
          if (!preWindowInfoList.find(item => item.id === curWindow.id)) {
            preWindowInfoList.push(curWindow)
          }
        }
      }
      await writeJsonToFile(curGroupWindowListFile, curGroupWindowInfoList)
      await writeJsonToFile(preWindowListFile, preWindowInfoList);


      const messageList = await getJsonFromExcel(messageFileName)
      if (messageList.length > 0) {
        let messageIndex = 0
        let sendTimes = 1
        const messageRecord = await readMessageRecord(groupName)
        if (messageRecord.messageIndex) {
          messageIndex = messageRecord.messageIndex
        }
        console.log(`开始第${sendTimes}轮发送,从${messageIndex}条消息开始发送`)
        let sendResult = await startSendMessage(configFileName,groupName, curGroupWindowInfoList, messageIndex, messageList)
        await updateLocalInfo(curGroupWindowInfoList, preWindowInfoList, curGroupWindowListFile, preWindowListFile);
        console.log(`第${sendTimes}轮发送完成,共操作${curGroupWindowInfoList.length}个窗口,其中打开失败${sendResult.openFailedCount}个,登录失败${sendResult.loginFailedCount}个,发送失败${sendResult.sendMsgFailedCount}个`)
        if (sendResult.unreadMsgWindowId.length > 0) {
          console.log(`窗口${sendResult.unreadMsgWindowId}有未读消息未查看，请及时查看！！！！！！！！！`)
        }
        while (sendResult.status !== 'hasNoMoreMsg') {
          //只要消息没发完，就一直发消息
          let isRunning = await checkIsRunning(configFileName)
          if (!isRunning) {
            console.log("用户停止程序")
            break
          }
          await delayed(300000)
          isRunning = await checkIsRunning(configFileName)
          if (!isRunning) {
            console.log("用户停止程序")
            break
          }
          sendTimes = sendTimes + 1
          messageIndex = sendResult.messageIndex + 1
          console.log(`开始第${sendTimes}轮发送,从${messageIndex}条消息开始发送`)
          sendResult = await startSendMessage(configFileName,groupName, curGroupWindowInfoList, messageIndex, messageList)
          console.log(`第${sendTimes}轮发送完成,共操作${curGroupWindowInfoList.length}个窗口,其中打开失败${sendResult.openFailedCount}个,登录失败${sendResult.loginFailedCount}个,发送失败${sendResult.sendMsgFailedCount}个`)
          if (sendResult.unreadMsgWindowId.length > 0) {
            console.log(`窗口${sendResult.unreadMsgWindowId}有未读消息未查看，请及时查看！！！！！！！！！`)
          }
          console.log()
        }
        await updateLocalInfo(curGroupWindowInfoList, preWindowInfoList, curGroupWindowListFile, preWindowListFile);
      } else {
        console.log('没有获取到消息列表数据')
      }

    } else {
      console.log(`${groupName}分组下没有已添加的窗口，请先添加窗口并注册`)
    }
  } else {
    console.log(`获取${groupName}分组窗口信息失败，退出！！`)
    return
  }


  // const browserList = await getBrowserList({page: 0, pageSize: 100});
  // console.log(browserList.data.list);

  //打开浏览器窗口
  // const browserInfo = await openBrowser({
  //   id: "5249f290a4ed4db6988855d19a9714c3",
  //   args: [],
  //   loadExtensions: false,
  //   extractIp: false,
  // });
  // if (browserInfo.success) {
  //   console.log("打开窗口成功");
  //   browserInfo.data
  // } else {
  //   console.log("获取窗口列表失败", browserInfo.msg);
  // }
}

async function closeService() {
  try {
    const service = chrome.getDefaultService()
    if (service) {
      await service.kill()
      await delayed(2000)
    }
  } catch (e) {
    console.log(e)
  }
}

async function startSendMessage(configFileName,groupName, windowsList, messageIndex, messageList) {
  let sendResult = {
    message: {},
    messageIndex: messageIndex,
    status: '',
    window: {},
    openFailedCount: 0,
    loginFailedCount: 0,
    sendMsgFailedCount: 0,
    unreadMsgWindowId: []
  }
  let dateStr = getDate();
  //开始循环遍历创建的窗口，打开窗口
  for (let i = 0; i < windowsList.length; i++) {
    let isRunning = await checkIsRunning(configFileName)
    if (!isRunning) {
      console.log("用户停止程序")
      return sendResult
    }
    const currentWindow = windowsList[i]
    if (!currentWindow.failedInfo) {
      currentWindow.failedInfo = []
    }
    const todayFailedInfo = currentWindow.failedInfo.find(item => item.date === dateStr)
    if (todayFailedInfo && todayFailedInfo.count > 3) {
      console.log(`今日失败次数超过3次,不再操作窗口${currentWindow.seq}`)
      continue
    }
    console.log(`开始操作窗口${currentWindow.seq},窗口信息:${currentWindow}`)
    if (currentWindow.isRegisterSuccess === false) {
      console.log('该窗口注册GV失败,跳过发送短信')
      continue
    }
    const openRes = await openWindow(currentWindow.id)
    if (openRes.success) {
      console.log('打开窗口成功')
      currentWindow.isOpenSuccess = true;
      const driver = getDriver(openRes)
      // await toGVTab(driver)

      let isSuccess;
      if (currentWindow.isRegisterSuccess === true) {
        console.log('该窗口已注册GV成功,直接发送短信')
        driver.get('https://voice.google.com/')
        isSuccess = true
      } else {
        console.log('该窗口尚未注册GV,注册GV并发送短信')
        driver.get('https://voice.google.com/')
        isSuccess = await loginToGV(driver, currentWindow.userName, currentWindow.password, currentWindow.remark)
      }
      if (isSuccess) {
        console.log('gv注册成功,窗口id:', currentWindow.seq)
        currentWindow.isRegisterSuccess = true
        if (messageList.length > messageIndex) {
          const curMessage = messageList[messageIndex]
          console.log('开始发送消息', curMessage)
          const recordMsg = {
            messageIndex: messageIndex,
            message: curMessage
          }
          //记录当前发送的消息
          await recordMessageInfo(groupName, recordMsg)
          const sendStatus = await sendMessage(driver, curMessage)
          if (sendStatus === 'hadUnreadMsg') {
            //有未读消息
            currentWindow.hasUnreadMsg = true
            currentWindow.sendSuccess = false
            sendResult.unreadMsgWindowId.push(currentWindow.seq)
          } else if (sendStatus === 'sendSuccess') {
            //发送成功
            currentWindow.sendSuccess = true
            currentWindow.hasUnreadMsg = false
            sendResult.message = curMessage
            sendResult.messageIndex = messageIndex
            messageIndex = messageIndex + 1
            let recordMsg
            if (messageList.length > messageIndex) {
              recordMsg = {
                messageIndex: messageIndex,
                message: messageList[messageIndex]
              }
            } else {
              recordMsg = {
                messageIndex: 0,
                message: messageList[0]
              }
            }
            //记录当前发送的消息
            await recordMessageInfo(groupName, recordMsg)
          } else {
            //发送失败
            currentWindow.sendSuccess = false
            currentWindow.hasUnreadMsg = false
            if (todayFailedInfo) {
              todayFailedInfo.count = todayFailedInfo.count + 1
            } else {
              currentWindow.failedInfo.push({
                date: dateStr, count: 1
              })
            }
            sendResult.sendMsgFailedCount = sendResult.sendMsgFailedCount + 1
          }
        } else {
          //消息发送完了
          console.log('消息发送完了!!!!')
          sendResult.status = 'hasNoMoreMsg'
        }
      } else {
        console.log('gv注册失败,窗口id:', currentWindow.seq)
        currentWindow.isRegisterSuccess = false
        sendResult.loginFailedCount = sendResult.loginFailedCount + 1
      }
      if (!currentWindow.hasUnreadMsg) {
        await delayed(2000)
        await closeAllTab(driver)
        await closeBrowser(currentWindow.id)
      }
    } else {
      console.log('打开窗口失败')
      currentWindow.isOpenSuccess = false;
      sendResult.openFailedCount = sendResult.openFailedCount + 1
    }
    sendResult.window = currentWindow
    await closeService();
    isRunning = await checkIsRunning(configFileName)
    if (!isRunning) {
      console.log('用户停止程序')
      return sendResult
    }
  }
  return sendResult
}

async function getSendMsgConfigInfo(configFileName) {
  const gvSettingFileName = `./file/setting/${configFileName}.json`
  return await getJsonObjFileInfo(gvSettingFileName)
}

async function closeAllTab(driver) {
  console.log('关闭所有标签')
  let allHandles = await driver.getAllWindowHandles();
  for (let i = allHandles.length - 1; i >= allHandles.length; i--) {
    await driver.switchTo().window(allHandles[i]);
    await driver.sleep(1000)
    await driver.close()
  }
}

async function checkGroupExist(groupName) {
  const groupListResp = await getGroupList(0, 1000);
  if (groupListResp.success) {
    const groupItem = groupListResp.data.list.find((item) => {
      return item.groupName === groupName;
    });
    if (groupItem) {
      console.log("已存在分组");
      return groupItem.id;
    } else {
      console.log("分组不存在")
    }
  } else {
    console.log("获取分组列表失败", groupListResp);
  }
}

async function checkIsRunning(configFileName) {
  const gvSettingFileName = `./file/setting/${configFileName}.json`
  const jsonInfo = await getJsonObjFileInfo(gvSettingFileName)
  return jsonInfo.isRunning
}

async function recordMessageInfo(dateStr, messageInfo) {
  const messageRecordFilePath = `./file/message_info/${dateStr}.json`;
  await writeJsonToFile(messageRecordFilePath, messageInfo)
}

async function readMessageRecord(dateStr) {
  const messageRecordFilePath = `./file/message_info/${dateStr}.json`;
  return await getJsonObjFileInfo(messageRecordFilePath)
}

async function toGVTab(driver) {
  let allHandles = await driver.getAllWindowHandles();
  let gvHandle;
  for (let i = 0; i < allHandles.length; i++) {
    try {
      await driver.switchTo().window(allHandles[i]);
      const currentUrl = await driver.getCurrentUrl();
      console.log('当前tab页面路径为:', currentUrl)
      if (currentUrl.startsWith("https://voice.google.com")) {
        gvHandle = allHandles[i]
        break;
      }
    } catch (e) {

    }
  }
  console.log('获取到的页面tab路径为:', gvHandle)
  if (!gvHandle) {
    await driver.sleep(1000)
    await driver.executeScript(`window.open('https://voice.google.com/', '_blank');`);
    await driver.sleep(2000)
    await toGVTab(driver)
  } else {
    console.log('成功跳转到Voice-Calls页面')
  }
}
