import requests
import time

BASE_URL = "https://daisysms.com"
API_KEY = "rOsdxGL7ZD6h9l0SnZHekvDBD9o8kK"

def request_phone_num():
    try:
        resp = requests.get(f"{BASE_URL}/stubs/handler_api.php", params={
            "api_key": API_KEY,
            "action": "getNumber",
            "service": "gf",
            "max_price": "5.5"
        })
        print('requestPhoneNum', resp.text)
        if resp.text and "ACCESS_NUMBER" in resp.text:
            return resp.text.split(':')
    except Exception as e:
        print('接码平台获取号码发生异常', e)
    return None

def get_code(id, start_time):
    try:
        while True:
            resp = requests.get(f"{BASE_URL}/stubs/handler_api.php", params={
                "api_key": API_KEY,
                "action": "getStatus",
                "id": id
            })
            print('getCode', resp.text)
            if resp.text and "STATUS_OK" in resp.text:
                return resp.text.split(':')[1]
            elif time.time() - start_time > 30:
                return -1
            else:
                print('暂未收到短信，5秒后重试')
                time.sleep(5)
    except Exception as e:
        print('获取验证码时发生异常', e)
    return None