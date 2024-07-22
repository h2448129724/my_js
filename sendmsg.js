const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const {openBrowser} = require('./request')
const {until} = require("selenium-webdriver");
const {requestPhoneNum, getCode} = require('./sms_request')
const {delayed} = require("selenium-webdriver/lib/promise");
const {getJsonFromExcel, getDate} = require("./utils");
const {getVisibleElements, getVisibleElement} = require("./register");

async function testSendMessage(driver) {
    const message = {phone: 9417953734, message: 'it is so hot today!!'}
    await sendMessage(driver, message)
}

async function sendMessage(driver, message) {
    const messageNav = await selectMessageNav(driver)
    if (messageNav) {
        console.log('获取消息导航按钮成功')
        let hadMsg
        try {
            hadMsg = await getVisibleElements(driver, webdriver.By.xpath('//a[contains(@aria-label,"Messages:")]'), 5000)
        } catch (e) {

        }
        // const hadMsg = await getVisibleElement(driver, , 5000)
        //判断是否有未读消息
        if (hadMsg) {
            //含有未读消息
            console.log('含有未读消息')
            return 'hadUnreadMsg'
        } else {
            //没有未读消息
            console.log('不含有未读消息')
            try {
                const loadingView = await driver.findElement(webdriver.By.className('gvMessagingView-loading'))
                if (loadingView) {
                    await driver.wait(until.elementIsNotVisible(loadingView), 30000)
                }
            } catch (e) {
                console.log(e)
                const js_code = " var overlay = document.querySelector('.gvMessagingView-loading');if (overlay) {overlay.style.display = 'none';}"
                await driver.executeScript(js_code)
                await delayed(1000)
            }
            const conversationList = await getVisibleElement(driver, webdriver.By.xpath('//*[local-name()="gv-conversation-list"]'))
            if (conversationList) {
                console.log('开始获取新建消息按钮')
                // const js_code = " var overlay = document.querySelector('.cdk-overlay-pane');if (overlay) {overlay.style.display = 'none';}"
                // await driver.executeScript(js_code)
                const addMessageBtn = await getVisibleElement(driver, webdriver.By.className('gvMessagingView-actionButton'))
                if (addMessageBtn) {
                    console.log('获取新建消息按钮成功')
                    await delayed(2000)
                    await addMessageBtn.click()
                    console.log('开始获取号码输入框')
                    const element = await getVisibleElement(driver, webdriver.By.className('cdk-overlay-pane'))
                    if (element) {
                        console.log('获取到了弹窗')
                        await delayed(2000)
                        const js_code = " var overlay = document.querySelector('.cdk-overlay-pane');if (overlay) {overlay.style.display = 'none';}"
                        await driver.executeScript(js_code)
                        await delayed(2000)
                    }else{
                        console.log('没有获取到弹窗')
                    }
                    // const button = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Send message"]'))
                    // if (button) {
                    //     console.log('获取发送消息按钮成功')
                    // }
                    const inputDiv = await getVisibleElement(driver, webdriver.By.className('input-field'))
                    if (inputDiv) {
                        const numberInput = await inputDiv.findElement(webdriver.By.tagName('input'))
                        if (numberInput) {
                            console.log('获取号码输入框成功')
                            // await delayed(2000)
                            // await numberInput.click()
                            await delayed(1000)
                            await numberInput.clear()
                            await delayed(2000)
                            await numberInput.sendKeys(message.phone)
                            await numberInput.sendKeys(',')
                            await numberInput.sendKeys(webdriver.Key.ESCAPE)
                            await delayed(2000)
                            // console.log('获取号码弹窗')
                            // const element = await getVisibleElement(driver, webdriver.By.id('send_to_button-0'))
                            // if (element) {
                            //     console.log('获取号码弹窗成功，点击第一个条目')
                            //     await element.click()
                            // }
                            try {
                                hadMsg = await getVisibleElements(driver, webdriver.By.xpath('//a[contains(@aria-label,"Messages:")]'), 1000)
                                if (hadMsg) {
                                    console.log('含有未读消息')
                                    return 'hadUnreadMsg'
                                }
                            }catch (e){

                            }
                            const deleteIcon = await getVisibleElements(driver, webdriver.By.className('mat-mdc-chip-remove'))
                            if (deleteIcon && deleteIcon.length > 0) {
                                console.log('开始获取内容输入框')
                                const messageInput = await getVisibleElement(driver, webdriver.By.className('message-input'))
                                if (messageInput) {
                                    console.log('获取内容输入框成功')
                                    await messageInput.click()
                                    await delayed(1000)
                                    await messageInput.clear()
                                    await delayed(1000)
                                    await messageInput.sendKeys(message.message)
                                    await delayed(2000)
                                    console.log('开始获取发送按钮')
                                    // Send message
                                    const sendBtn = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Send message"]'))
                                    if (sendBtn) {
                                        console.log('获取发送按钮成功')
                                        await sendBtn.click()
                                        //' Sending... '
                                        await delayed(5000)
                                        const sendSuccess = await isMsgSendSuccess(driver)
                                        if (sendSuccess) {
                                            console.log('发送成功')
                                            return 'sendSuccess'
                                        } else {
                                            console.log('发送失败')
                                        }
                                    } else {
                                        console.log('获取发送按钮失败')
                                    }
                                }
                            }
                        }
                    }
                } else {
                    console.log('获取新建消息按钮失败')
                }
            }
        }
    } else {
        console.log('获取消息导航按钮失败')
    }
}

async function selectMessageNav(driver) {
    try {
        const elements = await getVisibleElements(driver, webdriver.By.xpath('//*[@id="gvPageRoot"]/div[2]/gv-side-panel/mat-sidenav-container/mat-sidenav-content/div/div[2]/gv-side-nav/div/div/mat-nav-list/a[2]'))
        if (elements) {
            if (elements.length > 1) {
                await elements[1].click()
                return elements[1]
            }
            if (elements.length === 1) {
                await elements[0].click()
                return elements[0]
            }
        }
    } catch (e) {
        console.log('获取消息导航按钮失败')
    }
}

async function isMsgSendSuccess(driver) {
    try {
        const elements = await getVisibleElements(driver, webdriver.By.className('status'))
        if (elements && elements.length > 0) {
            const lastElement = elements[elements.length - 1]
            const regExp = new RegExp('\\b\\d{1,2}:\\d{2}\\s+[AP]M\\b')
            await driver.wait(until.elementTextMatches(lastElement, regExp), 10000)
            const text = await lastElement.getText()
            console.log('发送时间为:', text)
            return true
        }
    } catch (e) {
        console.log('isMsgSendSuccess', e)
    }
}

async function hasUnReadMsg(element) {
    try {
        return await element.findElement(webdriver.By.className('navItemBadge'))
    } catch (e) {

    }
}


module.exports = {
    testSendMessage, sendMessage
}
