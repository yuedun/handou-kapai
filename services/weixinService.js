'use strict';
/**
 * Created by admin on 2015/3/23.
 */
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var sign = require('./sign.js');
var myClient = require('../utils/redisDB').myClient;

var weixin = function(){};
/**
 * 验证token
 * @param req
 * @param res
 */
weixin.validateToken = function(req, res) {
    var query = req.query;
    var signature = query.signature;//微信服务器加密字符串
    var echostr = query.echostr;//随机字符串
    var timestamp = query.timestamp;//时间戳
    var nonce = query.nonce;//nonce
    var oriArray = [];
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = "handou";//这里填写你的token
    oriArray.sort();
    var original = oriArray[0]+oriArray[1]+oriArray[2];
    var scyptoString = sha1(original);//将三个参数拼接加密字符串，并与服务器发送的字符串对比
    if (signature == scyptoString) {
        res.send(echostr);
    }
    else {
        res.send("Bad Token!");
    }
};

/**
 * sha1加密
 * @param str
 * @returns {*}
 */
function sha1(str) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
/**
 * 请求access_token的url
 * @type {validateToken}
 */
weixin.getAccessTokenUrl = function(){
    var appid = "wx49289a80c79a1913";//订阅号,wx49289a80c79a1913 wode:wx516bdeaef8db9cac
    //var appid = "wx4d4b8f60bf2ca960";//服务号
    var appsecret = "6b744f150a45c8228cf70978a1af849b";//订阅号6b744f150a45c8228cf70978a1af849b
    //var appsecret = "f74f0d0139148c5790b6a2cce896f212";//服务号wode908302bafcaa2899df8a15f8dcfb9c89
    return "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appid + "&secret=" + appsecret;
};
/**
 * 获取access_token
 */
weixin.getAccessToken = function(){
    var myreq = https.request(weixin.getAccessTokenUrl(), function (result) {
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            var access_token = JSON.parse(chunk).access_token;
            myClient.setValue('access_token', 7190, access_token, null);
            return access_token;
        });
    });
    myreq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    myreq.end();
};
/**
 * 获取web页面秘钥
 * @type {Function}
 */
weixin.getSignstr = function(url, callback){
    myClient.select('access_token', function(err, reply){
        if(reply){
            //redis中token存在
            myClient.select("ticket", function(err, reply2){
                if(reply2){
                    //ticket存在直接使用获取加密sign
                    var resultSign = sign(reply2, url);
                    callback(resultSign);
                }else{
                    //获取ticket,有请求次数限制，需要缓存
                    var myReq = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + reply + "&type=jsapi", function (result) {
                        result.on('data', function (chunk) {
                            var resultSign = sign(JSON.parse(chunk).ticket, url);
                            myClient.setValue("ticket",7190,resultSign.jsapi_ticket,null);
                            callback(resultSign);
                        });
                    });
                    myReq.on('error', function (e) {
                        console.log('problem with request: ' + e.message);
                    });
                    myReq.end();
                }
            });
        }else{
            //redis中token不存在
            var access_token = weixin.getAccessToken();
            var myReq3 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function (result) {
                result.on('data', function (chunk) {
                    var resultSign = sign(JSON.parse(chunk).ticket, url);
                    myClient.setValue("ticket",7190,JSON.stringify(resultSign).jsapi_ticket,null);
                    callback(resultSign);
                });
            });
            myReq3.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            myReq3.end();
        }
    });
};
module.exports = weixin;
