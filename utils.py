# -*- coding: utf-8 -*-

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BrowserAutomation:
    def __init__(self):
        options = webdriver.FirefoxOptions()
        options.add_argument("--no-sandbox")  # 禁用沙盒模式
        self.driver = webdriver.Firefox(options=options)  # 替换为GeckoDriver路径

    def open_browser(self, url):
        self.driver.get(url)

    def login_gv(self, email, password):
        self.driver.get('https://accounts.google.com/')
        email_input = self.driver.find_element(By.ID, 'identifierId')
        email_input.send_keys(email)
        self.driver.find_element(By.ID, 'identifierNext').click()
        print("等待密码输入框出现...")
        WebDriverWait(self.driver, 30).until(EC.presence_of_element_located((By.NAME, 'Passwd')))
        password_input = self.driver.find_element(By.NAME, 'Passwd')
        password_input.send_keys(password)
        self.driver.find_element(By.ID, 'passwordNext').click()
        WebDriverWait(self.driver, 30).until(EC.title_contains('Google Account'))

    def send_message(self, phone, message):
        self.driver.get('https://voice.google.com/')
        print("等待消息按钮出现...")
        message_button = WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Messages")]'))
        )
        message_button.click()
        print("等待新消息按钮出现...")
        new_message_button = WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.XPATH, '//*[@aria-label="Send new message"]'))
        )
        new_message_button.click()
        print("等待号码输入框出现...")
        phone_input = WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.XPATH, '//*[@aria-label="Enter name or number"]'))
        )
        phone_input.send_keys(phone)
        phone_input.send_keys(Keys.RETURN)
        print("等待消息输入框出现...")
        message_input = WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.XPATH, '//*[@aria-label="Send a message"]'))
        )
        message_input.send_keys(message)
        send_button = self.driver.find_element(By.XPATH, '//*[@aria-label="Send message"]')
        send_button.click()

    def close_browser(self):
        self.driver.quit()



# async function getPhoneNum() {
#     const resp = await requestPhoneNum();
#     console.log('resp', resp);
#     if (resp && resp.length === 3) {
#         const phoneNum = resp[2];
#         const id = resp[1];
#         const phoneCode = await getCode(id);
#         if (phoneCode) {
#             // 处理验证码逻辑
#         }
#     }
# }

