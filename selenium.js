const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { openBrowser } = require('./request')
const {until} = require("selenium-webdriver");
main()

async function main() {

  //geo.iproyal.com:32325:M0Jacf5LYfk1kVob:WDTIlxEJ570AAcVG_country-us_streaming-1

  //419   5249f290a4ed4db6988855d19a9714c3
  //415   02b98016c4a643b4b298f519dc2c0f9e
  //431   4adc9ec369964bf58e39f8f3033416ea
  //432   28c8e2568fd049d7874888ab9a7425d8
  const openRes = await openBrowser({
    id: '28c8e2568fd049d7874888ab9a7425d8',
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
    try {
      await driver.get('https://accounts.google.com/')
      const userNameInput = await driver.findElement(webdriver.By.css('input#identifierId'))
      await userNameInput.click()
      await driver.sleep(500)
      await userNameInput.clear()
      await driver.sleep(500)
      // await userNameInput.sendKeys('RatliffEdlao@gmail.com')
      // await userNameInput.sendKeys('MruczekNicastro@gmail.com')
      // await userNameInput.sendKeys('FilmerCerio@gmail.com')
      await userNameInput.sendKeys('HattubMunzer909@gmail.com')
      await driver.sleep(1000)
      const nextButton = await driver.findElement(webdriver.By.id('identifierNext'))
      await nextButton.click()
      const waitResult = await driver.wait(until.elementLocated(webdriver.By.name('Passwd')), 10000);
      console.log('waitResult', waitResult)
      if (waitResult) {
        const passwordInput = await driver.findElement(webdriver.By.name('Passwd'))
        await driver.wait(until.elementIsVisible(passwordInput))
        await driver.sleep(1000)
        await passwordInput.click()
        await driver.sleep(1000)
        // const passwordInput = await driver.findElement(webdriver.By.name('Passwd'))
        await passwordInput.clear()
        await driver.sleep(1000)
        // await passwordInput.sendKeys('1sjlnh4u5s')
        // await passwordInput.sendKeys('tdnc3tzphw')
        // await passwordInput.sendKeys('6tfwhssacc')
        await passwordInput.sendKeys('c3h5ri3iseb')
        await driver.sleep(1000)
        const passwordNextButton = await driver.findElement(webdriver.By.id('passwordNext'))
        await passwordNextButton.click()
        driver.wait(until.titleIs('Google Account'), 10000).then((value) => {
          console.log("已登录成功！！！！")
          toGVTab(driver)
        }).catch((err) => {
          console.log("登录失败！！！")
        })
      }
      //登录成功后的路径https://myaccount.google.com/?pli=1
    } catch (e) {
      console.log('error', e)
      driver.wait(until.titleIs('Google Account'), 5000).then((value) => {
        console.log("已登录成功！！！！")
        toGVTab(driver)
      }).catch((err) => {
        console.log("登录失败！！！")
      })
    }
  }
}

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
