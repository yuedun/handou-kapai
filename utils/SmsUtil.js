/**
 * Created by admin on 2015/7/18.
 */
'use strict';
var http = require('http');
var querystring = require('querystring');
var client = require('../utils/redisDB').client;
var myClient = require('../utils/redisDB').myClient;

var ACCOUNT_PASSWORD = {
    account: 'sdk_handouer',
    password: 'lofti@2014',
    signature: '【韩豆】'
};
var SendMessage = function(){};

SendMessage.sendCommon = function(params, callback){
    var validateCode = this.getRandom(false, 4);//验证码（4位长度）
    myClient.setValue(params.destMobile, 600, validateCode, null);//验证码保留10分钟
    var postData = querystring.stringify({
        'account' : ACCOUNT_PASSWORD.account,
        'password': ACCOUNT_PASSWORD.password,
        'destmobile': params.destMobile,
        'msgText': validateCode + '(短信验证码，请勿泄露，10分钟内有效)' + ACCOUNT_PASSWORD.signature,
        'sendDateTime': ''
    });
    var options = {
        hostname: 'www.jianzhou.sh.cn',
        port: 80,
        path: '/JianzhouSMSWSServer/http/sendBatchMessage',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    var myReq = http.request(options, function (result) {
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            callback(null, chunk);
        });
    });
    myReq.on('error', function (e) {
        callback(e.message);
    });
    myReq.write(postData);
    myReq.end();
};

/*
 ** randomWord 产生任意长度随机字母数字组合
 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 ** xuanfeng 2014-08-28
 */
SendMessage.getRandom = function(randomFlag, min, max){
    var str = "",
        range = min,//固定位数
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // 随机产生min到max之间的位数
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    //固定位数
    for(var i=0; i<range; i++){
        var pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
};
module.exports = SendMessage;