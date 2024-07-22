const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const {openBrowser} = require('./request')
const {until} = require("selenium-webdriver");
const {requestPhoneNum, getCode} = require('./sms_request')
const {delayed} = require("selenium-webdriver/lib/promise");

// main()

async function loginToGV(driver, userName, password, recoryEmail) {
    let service
    let isSuccess
    try {
            // toGVTab(driver)
            // console.log("打开gv网站")
        // webdriver.By.className('phone-number-details')//已注册成功
        // webdriver.By.id('getVoiceToggle')//没有登录过gmail
        // webdriver.By.id('searchAccountPhoneDropDown')//已经登录过gmail，但是还没有注册过gv
        // 'A free phone number to take control of your communication'
        // webdriver.By.xpath('//h2[contains(text(),"A free phone number to take control of your communication")]')
        const elementInfo = await waitUntilGetOneElement(driver, [webdriver.By.xpath('//*[@id="gvPageRoot"]/div[2]/gv-side-panel/mat-sidenav-container/mat-sidenav-content/div/div[2]/gv-side-nav'),
            webdriver.By.id('getVoiceToggle'),
            webdriver.By.id('searchAccountPhoneDropDown'),
            webdriver.By.xpath('//h2[contains(text(),"A free phone number to take control of your communication")]'),
            webdriver.By.xpath('//h1[contains(text(),"Unable to access a Google product")]')], 30000)
        if (elementInfo) {
            const index = elementInfo.index
            const element = elementInfo.element
            if (index === 0) {
                console.log('已经注册成功')
                isSuccess = true
            } else if (index === 1) {
                console.log('没有登录过gmail')
                //找到了元素，说明没有登录过gv
                console.log("获取用处按钮")
                await driver.sleep(1000)
                console.log("点击用户按钮")
                await element.click()
                await getVisibleElement(driver, webdriver.By.className('getGoogleVoiceOptions'))
                console.log("获取平台选择按钮")
                await driver.sleep(1000)
                const webBtn = await getVisibleElement(driver, webdriver.By.className('webButton'))
                console.log("获取web平台按钮")
                await driver.sleep(1000)
                console.log("点击web平台按钮")
                webBtn.click()
                await driver.sleep(2000)
                console.log("获取用户名输入框")

                webdriver.By.css('input#identifierId')
                const elementInfo3 = await waitUntilGetOneElement(driver, [webdriver.By.xpath('//h1[contains(text(),"Unable to access a Google product")]'), webdriver.By.css('input#identifierId')], 30000)
                if (elementInfo3) {
                    if (elementInfo3.index === 0) {
                        isSuccess = false
                        console.log('google账号可能被封无法使用,注册失败')
                        return isSuccess
                    }
                }
                const userNameInput = await getVisibleElement(driver, webdriver.By.css('input#identifierId'))
                await userNameInput.click()
                await driver.sleep(1000)
                await userNameInput.clear()
                await driver.sleep(1000)
                // await userNameInput.sendKeys('RatliffEdlao@gmail.com')
                // await userNameInput.sendKeys('MruczekNicastro@gmail.com')
                // await userNameInput.sendKeys('FilmerCerio@gmail.com')
                // await userNameInput.sendKeys('HattubMunzer909@gmail.com')
                // await userNameInput.sendKeys('ScachetteProch@gmail.com')
                console.log("输入gmail用户名")
                await userNameInput.sendKeys(userName)
                await driver.sleep(1000)
                console.log("获取下一步按钮")
                const nextBtn = await getVisibleElement(driver, webdriver.By.id('identifierNext'))
                console.log("点击下一步")
                await nextBtn.click()
                console.log("获取密码输入框按钮")
                const pwdInput = await getVisibleElement(driver, webdriver.By.name('Passwd'))
                await driver.sleep(1000)
                await pwdInput.click()
                await driver.sleep(1000)
                // const passwordInput = await driver.findElement(webdriver.By.name('Passwd'))
                await pwdInput.clear()
                await driver.sleep(1000)
                // await passwordInput.sendKeys('1sjlnh4u5s')
                // await passwordInput.sendKeys('tdnc3tzphw')
                // await passwordInput.sendKeys('6tfwhssacc')
                // await passwordInput.sendKeys('c3h5ri3iseb')
                console.log("输入gmail密码")
                await pwdInput.sendKeys(password)
                await driver.sleep(1000)
                console.log("获取下一步按钮")
                const pwdNextBtn = await getVisibleElement(driver, webdriver.By.id('passwordNext'))
                console.log("点击下一步按钮")
                pwdNextBtn.click()
                console.log("获取区域选择框")

                // webdriver.By.id('searchAccountPhoneDropDown')//区域选择框按钮
                // webdriver.By.xpath('//span[text()="Not now"]/parent::button')//not now按钮
                // webdriver.By.xpath('//div[text()="Confirm your recovery email"]')//Confirm your recovery email按钮

                // webdriver.By.xpath('//h1[contains(text(),"Unable to access a Google product")]')
                const elementInfo2 = await waitUntilGetOneElement(driver, [webdriver.By.id('searchAccountPhoneDropDown'),
                    webdriver.By.xpath('//span[text()="Not now"]/parent::button'),
                    webdriver.By.xpath('//div[text()="Confirm your recovery email"]'),
                    webdriver.By.xpath('//h1[contains(text(),"Unable to access a Google product")]'),
                    webdriver.By.xpath('//h2[contains(text(),"A free phone number to take control of your communication")]')], 30000)
                if (elementInfo2) {
                    const index2 = elementInfo2.index
                    const element2 = elementInfo2.element
                    if (index2 === 3) {
                        isSuccess = false
                        console.log('google账号可能被封无法使用,注册失败')
                        return isSuccess
                    }
                    if (index2 === 1) {
                        //获取到了选着账号位置页面
                        console.log('出现not now页面，点击notnow按钮')
                        await element2.click()
                    } else if (index2 === 2) {
                        await handleRecoryEmail(driver, recoryEmail)
                    } else if (index2 ===4){
                        const element = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Continue"]'))
                        if (element) {
                            element.click()
                        }
                    }
                    await getPhoneCode(driver)
                    isSuccess = await isRegisterSuccess(driver)
                } else {
                    isSuccess = await isRegisterSuccess(driver)
                }
                // const dropDownElement = await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'), 10000)
                // if (!dropDownElement) {
                //     console.log('未获取到区域选择框，判断是not now页面还是辅助邮箱输入页面')
                //     const currentUrl = await driver.getCurrentUrl()
                //     const notNowBtn = await handleUnNormalPage(driver, currentUrl)
                //     if (notNowBtn) {
                //         console.log('出现not now页面，点击notnow按钮')
                //         //现在是not now 页面
                //         await notNowBtn.click()
                //     } else {
                //         //判断是否是辅助邮箱认证页面
                //         await handleRecoryEmail(driver, recoryEmail)
                //     }
                // }
                // await getPhoneCode(driver)
                // isSuccess = await isRegisterSuccess(driver)
            } else if (index === 2) {
                console.log('已经登录过gmail，但是还没有注册过gv,出现区域选着框')
                await getPhoneCode(driver)
                isSuccess = await isRegisterSuccess(driver)
            } else if (index === 3) {
                console.log('已经登录过gmail，但是还没有注册过gv,出现协议同意界面')
                const element = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Continue"]'))
                if (element) {
                    element.click()
                }
                await getPhoneCode(driver)
                isSuccess = await isRegisterSuccess(driver)
            } else if(index ===4){
                console.log('账号被封')
                isSuccess = false
            } else{
                console.log('未获取到元素')
                isSuccess = false
            }
        }

        // const element = await getVisibleElement(driver, webdriver.By.id('getVoiceToggle'))
        // if (element) {
        //     //找到了元素，说明没有登录过gv
        //     console.log("获取用处按钮")
        //     await driver.sleep(1000)
        //     console.log("点击用户按钮")
        //     await element.click()
        //     await getVisibleElement(driver, webdriver.By.className('getGoogleVoiceOptions'))
        //     console.log("获取平台选择按钮")
        //     await driver.sleep(1000)
        //     const webBtn = await getVisibleElement(driver, webdriver.By.className('webButton'))
        //     console.log("获取web平台按钮")
        //     await driver.sleep(1000)
        //     console.log("点击web平台按钮")
        //     webBtn.click()
        //     await driver.sleep(2000)
        //     console.log("获取用户名输入框")
        //     const userNameInput = await getVisibleElement(driver, webdriver.By.css('input#identifierId'))
        //     await userNameInput.click()
        //     await driver.sleep(2000)
        //     await userNameInput.clear()
        //     await driver.sleep(2000)
        //     // await userNameInput.sendKeys('RatliffEdlao@gmail.com')
        //     // await userNameInput.sendKeys('MruczekNicastro@gmail.com')
        //     // await userNameInput.sendKeys('FilmerCerio@gmail.com')
        //     // await userNameInput.sendKeys('HattubMunzer909@gmail.com')
        //     // await userNameInput.sendKeys('ScachetteProch@gmail.com')
        //     console.log("输入gmail用户名")
        //     await userNameInput.sendKeys(userName)
        //     await driver.sleep(1000)
        //     console.log("获取下一步按钮")
        //     const nextBtn = await getVisibleElement(driver, webdriver.By.id('identifierNext'))
        //     console.log("点击下一步")
        //     await nextBtn.click()
        //     console.log("获取密码输入框按钮")
        //     const pwdInput = await getVisibleElement(driver, webdriver.By.name('Passwd'))
        //     await driver.sleep(1000)
        //     await pwdInput.click()
        //     await driver.sleep(1000)
        //     // const passwordInput = await driver.findElement(webdriver.By.name('Passwd'))
        //     await pwdInput.clear()
        //     await driver.sleep(1000)
        //     // await passwordInput.sendKeys('1sjlnh4u5s')
        //     // await passwordInput.sendKeys('tdnc3tzphw')
        //     // await passwordInput.sendKeys('6tfwhssacc')
        //     // await passwordInput.sendKeys('c3h5ri3iseb')
        //     console.log("输入gmail密码")
        //     await pwdInput.sendKeys(password)
        //     await driver.sleep(1000)
        //     console.log("获取下一步按钮")
        //     const pwdNextBtn = await getVisibleElement(driver, webdriver.By.id('passwordNext'))
        //     console.log("点击下一步按钮")
        //     pwdNextBtn.click()
        //     console.log("获取区域选择框")
        //     const dropDownElement = await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'), 10000)
        //     if (!dropDownElement) {
        //         console.log('未获取到区域选择框，判断是not now页面还是辅助邮箱输入页面')
        //         const currentUrl = await driver.getCurrentUrl()
        //         const notNowBtn = await handleUnNormalPage(driver, currentUrl)
        //         if (notNowBtn) {
        //             console.log('出现not now页面，点击notnow按钮')
        //             //现在是not now 页面
        //             await notNowBtn.click()
        //         } else {
        //             //判断是否是辅助邮箱认证页面
        //             await handleRecoryEmail(driver, recoryEmail)
        //         }
        //     }
        //     await getPhoneCode(driver)
        //     isSuccess = await isRegisterSuccess(driver)
        // } else {
        //     isSuccess = await isRegisterSuccess(driver)
        //     if (!isSuccess) {
        //         await getPhoneCode(driver)
        //     }
        //     // const messageView = await isInConversationPage(driver)
        //     // if (messageView) {
        //     //     console.log('注册成功')
        //     //     const element = await getVisibleElements(driver, webdriver.By.xpath('//span[text()=" To call and text, get a Google Voice number "]'))
        //     //     if (element) {
        //     //         console.log('注册成功但是不可用')
        //     //     }
        //     //     await closeDriver(driver)
        //     //     await delayed(20000)
        //     // } else {
        //     // }
        // }
        // // await closeDriver(driver)
        // // await delayed(20000)
    } catch (e) {
        console.log('catch', e)
        isSuccess = await isRegisterSuccess(driver)
    }
    return isSuccess
}

async function closeDriver(driver) {
    let allHandles = await driver.getAllWindowHandles();
    for (let i = 0; i < allHandles.length; i++) {
        await driver.switchTo().window(allHandles[i]);
        await driver.close()
    }
    await driver.quit()
}

async function getPhoneCode(driver) {
    console.log("获取区域码选择框")
    const element = await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'))
    if (!element) {
        return
    }
    //citycodesuggestionid-0
    console.log("获取第一个区域码选项")
    const cityCodeElement = await getVisibleElement(driver, webdriver.By.id('citycodesuggestionid-0'))
    if (!cityCodeElement) {
        return
    }
    await driver.sleep(2000)
    console.log("点击区域码选项")
    await cityCodeElement.click()
    console.log("获取电话号码选择框")
    await getVisibleElement(driver, webdriver.By.id('searchAccountPhoneDropDown'))
    //phonenumberresultid-0
    console.log("获取第一个电话号码")
    const phoneNumElement = await getVisibleElement(driver, webdriver.By.id('phonenumberresultid-0'))
    if (!phoneNumElement) {
        return
    }
    //gmat-button
    console.log("获取电话号码确认按钮")
    const selectBtn = await phoneNumElement.findElement(webdriver.By.className("gmat-button"))
    if (!selectBtn) {
        return
    }
    await driver.sleep(2000)
    console.log("点击电话号码确认按钮")
    await selectBtn.click()
    await getVisibleElement(driver, webdriver.By.className("gvSignupView-innerArea"))
    await driver.sleep(2000)
    console.log("获取verify按钮")
    const verifyBtn = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Verify"]'), 10000)
    // const verifyBtn = await getVisibleElement(driver, webdriver.By.xpath('//span[text()="Verify"]'))
    if (!verifyBtn) {
        return
    }
    await driver.sleep(2000)
    console.log("点击verify按钮")
    await verifyBtn.click()
    console.log("获取手机号输入框")
    const phoneNumInput = await getVisibleElement(driver, webdriver.By.className('gvAddLinkedNumber-numberInput'))
    if (!phoneNumInput) {
        return
    }
    await driver.sleep(1000)
    await phoneNumInput.click()
    await driver.sleep(1000)
    await phoneNumInput.clear()
    await driver.sleep(1000)
    const resp = await requestPhoneNum()
    console.log('resp', resp)
    if (resp && resp.length === 3) {
        const phoneNum = resp[2]
        console.log("输入接码平台号码")
        await phoneNumInput.sendKeys(phoneNum)
        //获取验证码
        const addLinkElement = await getVisibleElement(driver, webdriver.By.className('gvAddLinkedNumber-actions'))
        const buttonList = await addLinkElement.findElements(webdriver.By.tagName("button"))
        if (buttonList.length > 1) {
            const okBtns = buttonList[1]
            await driver.sleep(2000)
            await okBtns.click()
        }

        const id = resp[1]
        const phoneCode = await getCodeFromRemote(id, driver)
        if (phoneCode) {
            console.log("获取接码平台验证码为", phoneCode)
            await driver.sleep(2000)
            console.log('获取验证码输入框')
            const codeInputElements = await getVisibleElements(driver, webdriver.By.name('verify-code'))
            if (codeInputElements && codeInputElements.length === 6) {
                for (let i = 0; i < codeInputElements.length; i++) {
                    const codeInput = codeInputElements[i]
                    await codeInput.click()
                    await codeInput.clear()
                    console.log('输入第一个数字', phoneCode.charAt(i))
                    await codeInput.sendKeys(phoneCode.charAt(i))
                    await driver.sleep(1000)
                }
            }
            console.log('获取确认按钮')
            const addLinkElement2 = await getVisibleElement(driver, webdriver.By.className('gvAddLinkedNumber-actions'))
            const buttonList2 = await addLinkElement2.findElements(webdriver.By.tagName("button"))
            if (buttonList2.length > 1) {
                const verifyBtn = buttonList2[1]
                await driver.sleep(2000)
                console.log('点击确认按钮')
                await verifyBtn.click()
            }
            // Finish
            console.log('获取Finish按钮')
            const finishBtn = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Finish"]'))
            await driver.sleep(1000)
            console.log('点击Finish按钮')
            await finishBtn.click()
            console.log('再次获取Finish按钮')
            const finishBtn2 = await getVisibleElement(driver, webdriver.By.xpath('//button[@aria-label="Finish"]'))
            await driver.sleep(1000)
            console.log('再次点击Finish按钮')
            await finishBtn2.click()
        } else {
            console.log('接码平台获取验证码失败')
        }
    } else {
        console.log('接码平台获取号码失败')
    }
    //gvAddLinkedNumber-actions

}

async function getCodeFromRemote(id, driver) {
    const curTime = new Date().getTime()
    const phoneCode = await getCode(id, curTime)
    if (phoneCode) {
        if (phoneCode === -1) {
            console.log('超过30秒未收到验证码,点击再次发送')
            const resendBtn = await getVisibleElement(driver, webdriver.By.xpath('//*[@id="dialogContent_0"]/div/gv-stroked-button/span/button'))
            if (resendBtn) {
                await resendBtn.click()
                const newCurTime = new Date().getTime()
                const phoneCode = await getCode(id, newCurTime)
                if (phoneCode && phoneCode !== -1) {
                    return phoneCode
                }
            }
        }
    }
    return phoneCode
}

async function isInConversationPage(driver, waitTime) {
    try {
        const element = await getVisibleElement(driver, webdriver.By.id('messaging-view'), waitTime)
        if (element) {
            return element
        }
    } catch (e) {
        console.log('isInConversationPage', e)
    }
}

async function isRegisterSuccess(driver) {
    const isInPage = await isInConversationPage(driver, 30000)
    if (isInPage) {
        const element= await waitUntilGetOneElement(driver,[webdriver.By.xpath('//*[local-name()="gv-conversation-list"]'),webdriver.By.className('phone-number-details'),30000])
        if (!element) {
            console.log('注册成功但不可用')
        } else {
            console.log('注册成功')
            return true
        }
    }
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


async function getVisibleElement(driver, identity, waitTime) {
    try {
        if (!waitTime) {
            waitTime = 30000
        }
        //等到元素出现
        await driver.wait(until.elementLocated(identity), waitTime);
        //找到元素
        const element = await driver.findElement(identity)
        //等待元素可见
        await driver.wait(until.elementIsVisible(element), waitTime)
        //返回元素
        return element
    } catch (e) {
        console.log('获取元素失败', identity.value)
        // const isSuccess = await isRegisterSuccess(driver)
        // if (isSuccess) {
        //     throw new Error('注册成功')
        // }
    }
}

async function waitUntilGetOneElement(driver, identity, timeout) {
    let curDateTimestamp = new Date().getTime()
    while (new Date().getTime() - curDateTimestamp < timeout) {
        console.log('开启新一轮查找')
        for (let i = 0; i < identity.length; i++) {
            try {
                const element = await getVisibleElement(driver, identity[i], 1000)
                if (element) {
                    console.log('获取元素成功', identity[i].value)
                    return {
                        element: element,
                        index: i
                    }
                }
            } catch (e) {
                console.log('未获取到元素', e)
            }
        }

    }
}

async function getVisibleElements(driver, identity, waitTime) {
    try {
        if (!waitTime) {
            waitTime = 30000
        }
        //等到元素出现
        await driver.wait(until.elementLocated(identity), waitTime);
        //找到元素
        const element = await driver.findElements(identity)
        //等待元素可见
        await driver.wait(until.elementIsVisible(element[0]), waitTime)
        //返回元素
        return element
    } catch (e) {
        console.log('获取元素失败', identity.value)
        return undefined
    }
}

async function getCurrentUrlWithTimeout(driver, timeoutMs) {
    return new Promise(async (resolve, reject) => {
        let timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('获取当前URL超时'));
        }, timeoutMs);

        try {
            let currentUrl = await driver.getCurrentUrl();
            clearTimeout(timeoutId);
            resolve(currentUrl);
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
}

//处理账号位置选择，点击not now按钮
async function handleUnNormalPage(driver, pageUrl) {
    if (pageUrl) {
        if (pageUrl.includes("https://gds.google.com/web/chip")) {
            const element = await getVisibleElement(driver, webdriver.By.xpath('//span[text()="Not now"]/parent::button'))
            if (element) {
                return element
            }
        }
    }
}

//
async function handleRecoryEmail(driver, email) {
    try {
        const element = await getVisibleElement(driver, webdriver.By.xpath('//div[text()="Confirm your recovery email"]'), 2000)
        if (element) {
            console.log('出现辅助邮箱输入页面')
            await element.click()
            const emailInput = await getVisibleElement(driver, webdriver.By.name('knowledgePreregisteredEmailResponse'))
            if (emailInput) {
                await driver.sleep(1000)
                await emailInput.click()
                await driver.sleep(1000)
                // const passwordInput = await driver.findElement(webdriver.By.name('Passwd'))
                await emailInput.clear()
                await driver.sleep(1000)
                // await passwordInput.sendKeys('1sjlnh4u5s')
                // await passwordInput.sendKeys('tdnc3tzphw')
                // await passwordInput.sendKeys('6tfwhssacc')
                // await passwordInput.sendKeys('c3h5ri3iseb')
                console.log("输入辅助邮箱")
                await emailInput.sendKeys(email)
                const nextBtn = await getVisibleElement(driver, webdriver.By.xpath('//span[text()="Next"]'))
                await nextBtn.click()
            }
        }
    } catch (e) {
        console.log('获取辅助邮箱页面失败', e)
    }
}


module.exports = {
    loginToGV,getVisibleElement,getVisibleElements
}
