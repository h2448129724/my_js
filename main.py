# main.py
from browser_automation import BrowserAutomation
from sms_service import request_phone_num, get_code
import time

if __name__ == "__main__":
    # 配置和初始化
    EMAIL = "your_email@gmail.com"
    PASSWORD = "your_password"
    MESSAGE_CONTENT = "Hello, this is a test message."

    # 获取电话号码
    phone_data = request_phone_num()
    if phone_data:
        phone_num, request_id = phone_data[2], phone_data[1]
        print(f"获取到的电话号码: {phone_num}")

        # 初始化浏览器自动化
        browser_automation = BrowserAutomation()

        # 打开浏览器并登录GV
        browser_automation.open_browser('https://accounts.google.com/')
        browser_automation.login_gv(EMAIL, PASSWORD)
        
        # 发送消息
        browser_automation.send_message(phone_num, MESSAGE_CONTENT)
        
        # 获取验证码
        start_time = time.time()
        code = get_code(request_id, start_time)
        if code != -1:
            print(f"Received code: {code}")
        else:
            print("验证码获取超时")

        # 关闭浏览器
        browser_automation.close_browser()
    else:
        print("Failed to get phone number.")
