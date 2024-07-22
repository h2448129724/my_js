const {delayed} = require("selenium-webdriver/lib/promise");
const axios = require("axios").default;

const baseURL = "https://daisysms.com";

const request = axios.create({
    baseURL,
    timeout: 0,
});

async function requestPhoneNum() {
    try {
        const resp = await request({
            method: "get",
            url: "/stubs/handler_api.php?api_key=rOsdxGL7ZD6h9l0SnZHekvDBD9o8kK&action=getNumber&service=gf&max_price=5.5"
        });
        console.log('requestPhoneNum', resp.data)
        if (resp.data) {
            if (resp.data.includes('ACCESS_NUMBER')) {
                return resp.data.split(':')
            }
        }
    } catch (e) {
        console.log('接码平台获取号码发生异常', e)
    }
}

async function getCode(id, startTime) {
    const resp = await request({
        method: "get",
        url: "/stubs/handler_api.php?api_key=rOsdxGL7ZD6h9l0SnZHekvDBD9o8kK&action=getStatus&id=" + id
    });
    console.log('getCode', resp.data)
    if (resp.data) {
        if (resp.data.includes('STATUS_OK')) {
            return resp.data.split(':')[1]
        } else {
            const curTime = new Date().getTime()
            if (curTime - startTime > 30000) {
                return -1
            } else {
                console.log('暂未收到短信，5秒后重试')
                await delayed(5000)
                return await getCode(id, startTime)
            }
        }
    }
}

module.exports = {
    requestPhoneNum,
    getCode
}
