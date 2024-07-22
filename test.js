const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const {openBrowser} = require('./request')
const {until} = require("selenium-webdriver");
const {requestPhoneNum, getCode} = require('./sms_request')
main1()

function main1() {
    console.log('传递的参数:',process.argv.length);
    for (let i = 2; i < process.argv.length; i++) {
        console.log(process.argv[i]);
    }
}

async function getPhoneNum() {
    const resp = await requestPhoneNum()
    console.log('resp', resp)
    if (resp && resp.length === 3) {
        const phoneNum = resp[2]
        const id = resp[1]
        const phoneCode = await getCode(id)
        if (phoneCode) {

        }
    }
}

async function main() {

    try {
        //geo.iproyal.com:32325:M0Jacf5LYfk1kVob:WDTIlxEJ570AAcVG_country-us_streaming-1

        //419   5249f290a4ed4db6988855d19a9714c3
        //415   02b98016c4a643b4b298f519dc2c0f9e
        //431   4adc9ec369964bf58e39f8f3033416ea
        //432   28c8e2568fd049d7874888ab9a7425d8
        //433   7b30ac20c55c4cffa244aa22ae62ba72
        //434   541d60fd7f2b411b92ff26012a9542fb
        const openRes = await openBrowser({
            id: '5249f290a4ed4db6988855d19a9714c3',
            args: [],
            loadExtensions: false,
            extractIp: false
        })
        if (openRes.success) {
            let options = new chrome.Options()
            options.options_['debuggerAddress'] = openRes.data.http
            // options.options_['prefs'] = { 'profile.default_content_setting_values': { images: 2 } }

            let driverPath = openRes.data.driver
            let service = new chrome.ServiceBuilder(driverPath).build()
            chrome.setDefaultService(service)

            let driver = new webdriver.Builder()
                .setChromeOptions(options)
                .withCapabilities(webdriver.Capabilities.chrome())
                .forBrowser('chrome')
                .build()
            await driver.get('http://www.baidu.com')
            driver.sleep(2000)
            // const element = await getVisibleElements(driver, webdriver.By.xpath('//a[text()="About"]'))
            // const element = await getVisibleElements(driver, webdriver.By.className('mnav'))
            // if (element && element.length > 0) {
            //     console.log('element', element[3])
            //     await element[3].click()
            // }
            const element = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Verify"]'))
            if (element) {

            }
        }
    } catch (e) {
        console.log('catch', e)
    }
}

async function getVisibleElements(driver, identity, waitTime) {
    try {
        //等到元素出现
        await driver.wait(until.elementLocated(identity), 30000);
        //找到元素
        const element = await driver.findElements(identity)
        //等待元素可见
        await driver.wait(until.elementIsVisible(element[0]), 30000)
        //返回元素
        return element
    } catch (e) {
        console.log('获取元素失败', e)
        return undefined
    }
}

// async function getPhoneCode(driver) {
//     console.log("获取区域码选择框")
//     await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'))
//     //citycodesuggestionid-0
//     console.log("获取第一个区域码选项")
//     const cityCodeElement = await getVisibleElement(driver, webdriver.By.id('citycodesuggestionid-0'))
//     await driver.sleep(2000)
//     console.log("点击区域码选项")
//     await cityCodeElement.click()
//     console.log("获取电话号码选择框")
//     await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'))
//     //phonenumberresultid-0
//     console.log("获取第一个电话号码")
//     const phoneNumElement = await getVisibleElement(driver, webdriver.By.id('phonenumberresultid-0'))
//     //gmat-button
//     console.log("获取电话号码确认按钮")
//     const selectBtn = await phoneNumElement.findElement(webdriver.By.className("gmat-button"))
//     await driver.sleep(2000)
//     console.log("点击电话号码确认按钮")
//     await selectBtn.click()
//     const gvSignupElement = await getVisibleElement(driver, webdriver.By.className("gvSignupView-innerArea"))
//     const verifyBtn = await gvSignupElement.findElement(webdriver.By.tagName("button"))
//     await driver.sleep(2000)
//     await verifyBtn.click()
//     const addLinkElement = await getVisibleElement(driver, webdriver.By.className('gvAddLinkedNumber-actions'))
//     const phoneNumInput = await getVisibleElement(driver, webdriver.By.className('gvAddLinkedNumber-numberInput'))
//     //获取号码
//     const okBtns = addLinkElement.findElements(webdriver.By.tagName("gv-flat-button"))
//     await driver.sleep(2000)
//     await okBtns.click()
//
//     //gvAddLinkedNumber-actions
//
// }

async function toGVTab(driver) {
    let allHandles = await driver.getAllWindowHandles();
    let gvHandle;
    for (let i = 0; i < allHandles.length; i++) {
        await driver.switchTo().window(allHandles[i]);
        const title = await driver.getTitle();
        if (title === 'Voice - Calls') {
            gvHandle = allHandles[i]
            break;
        }
    }
    if (!gvHandle) {
        await driver.sleep(1000)
        await driver.executeScript(`window.open('https://voice.google.com/', '_blank');`);
        await driver.sleep(2000)
        await toGVTab(driver)
    } else {
        console.log('成功跳转到Voice-Calls页面')
    }
}

async function registerGV(driver) {

}

async function getVisibleElement(driver, identity, waitTime,) {
    try {
        //等到元素出现
        await driver.wait(until.elementLocated(identity), 30000);
        //找到元素
        const element = await driver.findElement(identity)
        //等待元素可见
        await driver.wait(until.elementIsVisible(element), 30000)
        //返回元素
        return element
    } catch (e) {
        console.log('获取元素失败', e)
        return undefined
    }
}

async function getPageUrl(driver) {
    return await driver.getCurrentUrl()
}

async function handleUnNormalPage(driver, pageUrl) {
    if (pageUrl) {
        if (pageUrl.contains("https://gds.google.com/web/chip")) {
            const element = await getVisibleElement(driver, webdriver.By.xpath('//span[text()="Not now"]/parent::button'))
            if (element) {
                await element.click()
            }
        }
    }
}
