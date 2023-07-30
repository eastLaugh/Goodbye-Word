import { MD5 } from './md5.js'
fanyi()
chrome.runtime.onInstalled.addListener(() => {

})

async function fanyi(str) {
    // await new Promise((resolve) => { setTimeout(resolve, 1000) })
    var appid = '20230714001744484';
    var key = 'Wgx258_rILJ849RIJ8V5';
    var salt = (new Date).getTime();
    var query = str;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'en';
    var to = 'zh';
    var str1 = appid + query + salt + key;
    var sign = MD5(str1);

    // 使用fetch替代$.ajax

    const response = await fetch(
        `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(query)}&appid=${appid}&salt=${salt}&from=${from}&to=${to}&sign=${sign}`,
        {
            method: 'GET',
            dataType: 'jsonp',
        }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);
    return data.trans_result[0].dst;

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.type == 'translate') {
        const { word } = request;
        (async () => {
            try {
                word.translation = await fanyi(word.content);
                sendResponse({ word, result: true })
            } catch (e) {
                word.translation = '调用翻译接口失败，请点击手动设置';
                sendResponse({ word, result: false })
            }
        })();
        return true;
    }

})

