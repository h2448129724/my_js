const {
    openBrowser,
    closeBrowser,
    createBrowser, getGroupList, addGroup,
} = require("./request");
const puppeteer = require("puppeteer");
const {getDate, getJsonFileInfo, writeJsonToFile, getJsonFromExcel, getJsonObjFileInfo} = require("./utils");
const {loginToGV} = require("./register");
const {delayed} = require("selenium-webdriver/lib/promise");
const chrome = require("selenium-webdriver/chrome");
const webdriver = require("selenium-webdriver");
const {sendMessage, testSendMessage} = require("./sendmsg");
// 主程序
// main1();


main();

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

async function main() {
    if (process.argv.length === 3) {
        console.log('开始运行脚本，配置文件为:', process.argv[2])
    } else {
        console.log('运行脚本失败，未指定配置文件')
        return
    }

    const configFileName = process.argv[2]

    //1:添加窗口
    //1.1获取窗口信息json文件
    const dateStr = getDate();
    const settingInfo = await getRegisterGVSettingInfo(configFileName);
    if (!settingInfo || !settingInfo.groupName || !settingInfo.accountFileName) {
        console.log('注册账号配置文件读取失败，请检查配置文件./file/setting/register.json是否配置正确,groupName应该配置为账号分组名称,accountFileName应该配置为含有账号信息的excel文件名称')
        return
    }


    const groupName = settingInfo.groupName
    const groupId = await getGroupIdByName(groupName)
    if (!groupId) {
        return
    }
    const todayAccountListFile = `./file/account_info/${groupName}.json`;
    const todayAccountList = await getJsonFileInfo(todayAccountListFile);

    const todayNewAccountExcelFile = `./file/excel_info/${settingInfo.accountFileName}.xlsx`;
    const todayNewAccountList = getJsonFromExcel(todayNewAccountExcelFile);
    todayNewAccountList.forEach((account) => {
        if (!todayAccountList.find((item) => item.userName == account.userName)) {
            todayAccountList.push(account);
        }
    });
    await writeJsonToFile(todayAccountListFile, todayAccountList);


    //1.2.1 获取当前已有窗口信息
    const todayWindowListFile = `./file/window_info/${groupName}.json`;
    const todayWindowInfoList = await getJsonFileInfo(todayWindowListFile);

    //1.2.2 获取既往已有窗口信息
    const preWindowListFile = `./file/window_info/all.json`;
    const preWindowInfoList = await getJsonFileInfo(preWindowListFile);

    if (todayNewAccountList && todayNewAccountList.length > 0) {
        for (let i = 0; i < todayNewAccountList.length; i++) {
            const accountInfo = todayNewAccountList[i];
            if (!todayWindowInfoList.find(item => item.userName === accountInfo.userName && item.password === accountInfo.password)) {
                const preWindowInfo = preWindowInfoList.find(item => item.userName === accountInfo.userName && item.password === accountInfo.password)
                //如果当前窗口信息中不包含当前账号，添加新的窗口
                if (!preWindowInfo) {
                    //如果既往窗口信息中不包含当前账号,添加新的窗口
                    const windowInfoParams = generateWindowInfo(groupId, "https://accounts.google.com/", "gmail", `${groupName}-${i}`, accountInfo.userName, accountInfo.password, accountInfo.remark, 2, "socks5", accountInfo.host, accountInfo.port, accountInfo.proxyUserName, accountInfo.proxyPassword);
                    const res = await createBrowser(windowInfoParams);
                    if (res.success) {
                        console.log("添加窗口成功！", windowInfoParams.userName);
                        //1.3保存窗口信息
                        const windowInfo = {
                            id: res.data.id,
                            seq: res.data.seq,
                            code: res.data.code,
                            groupId: res.data.groupId,
                            platform: res.data.platform,
                            platformIcon: res.data.platformIcon,
                            name: res.data.name,
                            userName: res.data.userName,
                            password: res.data.password,
                            proxyMethod: res.data.proxyMethod,
                            proxyType: res.data.proxyType,
                            host: res.data.host,
                            port: res.data.port,
                            proxyUserName: res.data.proxyUserName,
                            proxyPassword: res.data.proxyPassword,
                            remark: res.data.remark
                        }
                        todayWindowInfoList.push(windowInfo)
                        preWindowInfoList.push(windowInfo)
                    } else {
                        console.log("添加窗口失败！", windowInfoParams.userName, res)
                    }
                } else {
                    //今日账号中包含往日添加过窗口的账号
                    todayWindowInfoList.push(preWindowInfo)
                }
            }
        }
        //更新窗口信息
        await writeJsonToFile(todayWindowListFile, todayWindowInfoList);
        await writeJsonToFile(preWindowListFile, preWindowInfoList);
    }

    const date = getDate()

    //开始循环遍历创建的窗口，打开窗口
    for (let i = 0; i < todayWindowInfoList.length; i++) {
        let isRunning = await checkIsRunning(configFileName)
        if (!isRunning) {
            console.log("用户停止程序")
            return
        }
        const currentWindow = todayWindowInfoList[i]
        if (!currentWindow.registerFailedInfo) {
            currentWindow.registerFailedInfo = []
        }
        const todayFailedInfo = currentWindow.registerFailedInfo.find(item => item.date === dateStr)
        if (todayFailedInfo && todayFailedInfo.count > 3) {
            console.log(`今日注册失败次数超过3次,不再操作窗口${currentWindow.seq}`)
            continue
        }
        console.log(`开始操作窗口${currentWindow.seq}`)
        const openRes = await openWindow(currentWindow.id)
        if (openRes.success) {
            console.log('打开窗口成功')
            currentWindow.isOpenSuccess = true;
            const driver = getDriver(openRes)
            // await toGVTab(driver)
            driver.get('https://voice.google.com/')
            const isSuccess = await loginToGV(driver, currentWindow.userName, currentWindow.password, currentWindow.remark)
            if (isSuccess) {
                console.log('gv注册成功,窗口id:', currentWindow.seq)
                currentWindow.isRegisterSuccess = true
            } else {
                console.log('gv注册失败,窗口id:', currentWindow.seq)
                currentWindow.isRegisterSuccess = false
                if (todayFailedInfo) {
                    todayFailedInfo.count = todayFailedInfo.count + 1
                } else {
                    currentWindow.registerFailedInfo.push({
                        date: date, count: 1
                    })
                }
            }
            await closeAllTab(driver)
        } else {
            console.log('打开窗口失败')
            currentWindow.isOpenSuccess = false;
            if (todayFailedInfo) {
                todayFailedInfo.count = todayFailedInfo.count + 1
            } else {
                currentWindow.registerFailedInfo.push({
                    date: date, count: 1
                })
            }
        }
        let elementIndex = preWindowInfoList.findIndex(item => item.userName === currentWindow.userName && item.password === currentWindow.password)
        preWindowInfoList[elementIndex] = currentWindow;
        await writeJsonToFile(preWindowListFile, preWindowInfoList)
        await writeJsonToFile(todayWindowListFile, todayWindowInfoList);
        await delayed(2000)
        try {
            const service = chrome.getDefaultService()
            if (service) {
                await service.kill()
                await delayed(2000)
            }
            if (!currentWindow.hasUnreadMsg) {
                await closeBrowser(currentWindow.id)
            }
        } catch (e) {
            console.log('关闭窗口失败', e)
        }
        isRunning = await checkIsRunning(configFileName)
        if (!isRunning) {
            console.log("用户停止程序")
            return
        }
    }
}

async function getRegisterGVSettingInfo(configFileName) {
    const gvSettingFileName = `./file/setting/${configFileName}.json`
    return await getJsonObjFileInfo(gvSettingFileName)
}

async function closeAllTab(driver) {
    let allHandles = await driver.getAllWindowHandles();
    for (let i = 0; i < allHandles.length; i++) {
        await driver.switchTo().window(allHandles[i]);
        await driver.sleep(1000)
        await driver.close()
    }
}


async function getGroupIdByName(groupName) {
    const groupListResp = await getGroupList(0, 100);
    if (groupListResp.success) {
        const groupItem = groupListResp.data.list.find((item) => {
            return item.groupName === groupName;
        });
        if (groupItem) {
            console.log("已存在分组");
            return groupItem.id;
        } else {
            console.log('开始添加分组,分组名称为:', groupName)
            const addGroupResp = await addGroup(groupName, 0);
            if (addGroupResp.success) {
                console.log("添加分组成功", addGroupResp.data);
                return addGroupResp.data.id;
            } else {
                console.log("添加分组失败", addGroupResp);
            }
        }
    } else {
        console.log("获取分组列表失败", groupListResp);
    }
}

function generateWindowInfo(groupId, platform, platformIcon, name, userName, password, remark, proxyMethod, proxyType, host, port, proxyUserName, proxyPassword) {
    return {
        groupId,
        platform,
        platformIcon,
        name,
        userName,
        password,
        remark,
        proxyMethod,
        proxyType,
        host,
        port,
        proxyUserName,
        proxyPassword,
        browserFingerPrint: {
            os: "MacIntel",
        },
    };
}

async function checkIsRunning(configFileName) {
    const gvSettingFileName = `./file/setting/${configFileName}.json`
    const jsonInfo = await getJsonObjFileInfo(gvSettingFileName)
    return jsonInfo.isRunning
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
