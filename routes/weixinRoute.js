/**
 * Created by admin on 2015/3/23.
 */
var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var urlencode = require('urlencode');
var config = require('../config/config');
var apiUri = require('../config/apiUri');
var Picture = require('../models/Picture');
var Dialogue = require('../models/Dialogue');
var weixin = require('../services/weixinService');
var myClient = require('../utils/redisDB').myClient;
var responseObj = require('../models/ResponseObj');
var sign = require('../services/sign.js');
var qiniu = require('../utils/qiniu');
var token = qiniu.upToken('hopefully','http://handouer.wicp.net/weixin/createImg','x:name=hope');
//var token = qiniu.uptoken('hopefully');
var service_appid = 'wx4d4b8f60bf2ca960';//服务号
var service_secret = 'f74f0d0139148c5790b6a2cce896f212';
var read_appid = 'wx49289a80c79a1913';//订阅号
var read_secret = '6b744f150a45c8228cf70978a1af849b';

/**
 * 点亮专辑活动
 * 微信回调地址，会在请求中携带参数code
 * /weixin/activity?code=00129f5a6ff681e1eb276b3d0c1ed4cq&state=123
 * 第一次进来可获取到openid传递给页面，第二次进来会带上openid参数
 */
router.get('/activity', function(req, res){
    var myReq = https.request("https://api.weixin.qq.com/sns/oauth2/access_token?appid="+service_appid+"&secret="+service_secret+"&code="+req.query.code+"&grant_type=authorization_code", function (result) {
        result.on('data', function (chunk) {
            var s = chunk.toString();
            if(req.query.first_openid){
                //如果已经携带参数first_openid则是朋友点开的网页，加上friend_openid
                res.redirect('/weixin/activitypage/'+req.query.first_openid+"?friend_openid="+ JSON.parse(s).openid);
            }else{
                res.redirect('/weixin/activitypage/'+JSON.parse(s).openid);
            }
        });
    });
    myReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    myReq.end();
});
/**
 * 点亮活动打开页面
 */
router.get('/activitypage/:first_openid', function(req, res){
    var url = 'http://weixin.handouer.cn/weixin/activitypage/'+req.params.first_openid;
    if(req.query.friend_openid){
        url = 'http://weixin.handouer.cn/weixin/activitypage/'+req.params.first_openid+'?friend_openid='+req.query.friend_openid;
    }
    if(req.headers["user-agent"].toLowerCase().indexOf("micromessenger")>0){
//	if(1){
        weixin.getSignstr(url, function(signstr){
            var params = {
                sign:signstr,
                first_openid:req.params.first_openid,
                friend_openid:req.query.friend_openid
            };
            res.render('weixin/activity',params);
        });
    }else{
        res.render("weixin/wxerr",{});//浏览器中不能打开
    }
});

/**
 * 点亮活动兑换码页面
 */
router.get('/exchange/:first_openid', function(req, res){
    var url = 'http://weixin.handouer.cn/weixin/exchange/'+req.params.first_openid;
    if(req.headers["user-agent"].toLowerCase().indexOf("micromessenger")>0){
        weixin.getSignstr(url, function(signstr){
            var params = {
                sign:signstr,
                first_openid:req.params.first_openid
            };
            res.render('weixin/exchangePage',params);
        });
    }else{
        res.render("weixin/wxerr",{});//浏览器中不能打开
    }
});
/**
 *
 */
router.get('/handou', function(req, res){
    res.render('weixin/handou',{});
});
/**
 * 微信普通版进入加字幕
 */
router.get('/zimu/:pictureId', function(req, res){
    var params = req.query;
    params.picture_state = 0;
    params.picture_type = 0;
    params.picture_id = req.params.pictureId;
    Picture.find({
        where: params,
        attributes: ['picture_id', 'picture_original_name', 'picture_original_path']}).then(function(obj) {
        var pic_path = config.qiniu.download_website + obj.get('picture_original_path');
        myClient.select('access_token', function(err, reply){
            if(reply){
                //token存在
                var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + reply + "&type=jsapi", function (result2) {
                    result2.on('data', function (chunk2) {
                        var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                        res.render('weixin/zimu', {sign: signstr, img: pic_path});
                    });
                });
                myreq2.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                myreq2.end();
            }else{
                //token不存在
                var myreq = https.request(weixin.getAccessTokenUrl(), function (result) {
                    result.setEncoding('utf8');
                    result.on('data', function (chunk) {
                        var access_token = JSON.parse(chunk).access_token;
                        myClient.setValue('access_token', 7000, access_token, null);
                        var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function (result2) {
                            result2.on('data', function (chunk2) {
                                var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                                res.render('weixin/zimu', {sign: signstr, img: pic_path});
                            });
                        });
                        myreq2.on('error', function (e) {
                            console.log('problem with request: ' + e.message);
                        });
                        myreq2.end();
                    });
                });
                myreq.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                myreq.end();
            }
        });
        //以下可以代替上面的,待测试
        //var url = 'http://hphsk.oicp.net' + req.url;
        //weixin.getSignstr(url, function(signstr){
        //    res.render('weixin/zimu', {sign: signStr, img: pic_path});
        //});
    });
});

/**
 *
 * 验证微信token
 */
router.get('/validateToken', function(req, res){
    var echostr = weixin.validateToken(req, res);
    res.send(echostr);
});

/**
 * 翻译
 */
router.post('/fanyi', function(req, res){
    var _data = '';
    var content = urlencode(req.body.content);//重新编码中文
    var url = "http://openapi.baidu.com/public/2.0/bmt/translate?client_id=HahMqSkZWUq9QWHsWceXmG83&q=" + content + "&from=zh&to=kor";
    var myreq = http.request(url, function (result) {
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            res.json(JSON.parse(chunk));
        });
    });

    myreq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    myreq.end();
});

router.get('/cro/:pictureId', function (req, res) {
    var params = req.query;
    params.picture_state = 0;
    params.picture_type = 0;
    params.picture_id = req.params.pictureId;
    Picture.find({
        where: params,
        attributes: ['picture_id', 'picture_original_name', 'picture_original_path']}).then(function(obj) {
        var pic_path = config.qiniu.download_website + obj.get('picture_original_path');
        myClient.select('access_token', function(err, reply){
            if(reply){
                //token已保存
                var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + reply + "&type=jsapi", function (result2) {
                    result2.on('data', function (chunk2) {
                        var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                        res.render('weixin/cropPicture', {sign: signstr, img: pic_path});
                    });
                });
                myreq2.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                myreq2.end();
            }else{
                //token未保存
                var myreq = https.request(weixin.getAccessToken(), function (result) {
                    result.setEncoding('utf8');
                    result.on('data', function (chunk) {
                        var access_token = JSON.parse(chunk).access_token;
                        myClient.setValue('access_token', 7000, access_token, null);
                        var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function (result2) {
                            result2.on('data', function (chunk2) {
                                var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                                res.render('weixin/cropPicture', {sign: signstr, img: pic_path});
                            });
                        });
                        myreq2.on('error', function (e) {
                            console.log('problem with request: ' + e.message);
                        });
                        myreq2.end();
                    });
                });
                myreq.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                myreq.end();
            }
        });
    });
});
/**
 * 完成页面
 */
router.get('/comp', function(req, res){
    var path = req.query.path;
    myClient.select('access_token', function(err, reply){
        if(reply){
            //token存在
            var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + reply + "&type=jsapi", function (result2) {
                result2.on('data', function (chunk2) {
                    var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                    res.render('weixin/complate', {sign: signstr, path: path});
                });
            });
            myreq2.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            myreq2.end();
        }else{
            //token不存在
            var myreq = https.request(weixin.getAccessTokenUrl(), function (result) {
                result.setEncoding('utf8');
                result.on('data', function (chunk) {
                    var access_token = JSON.parse(chunk).access_token;
                    myClient.setValue('access_token', 7000, access_token, null);
                    var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function (result2) {
                        result2.on('data', function (chunk2) {
                            var signstr = sign(JSON.parse(chunk2).ticket, config.url_handouer + req.url);
                            res.render('weixin/complate', {sign: signstr, path: path});
                        });
                    });
                    myreq2.on('error', function (e) {
                        console.log('problem with request: ' + e.message);
                    });
                    myreq2.end();
                });
            });
            myreq.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            myreq.end();
        }
    });
});

/**
 * 查看图片
 */
router.get('/yulan/:path', function(req, res){
    var pathBase64 = req.params.path;
    var path = new Buffer(pathBase64, 'base64');
    var s = path.toString();
    res.render('weixin/yulan', {path: s});
});
/**
 * 台词
 */
router.get('/getDialogues/:command/:offset/:limit', function(req, res) {
    Dialogue.find({
        attributes: ['zh_content', 'kor_content'],
        //offset: req.params.offset == null ? 0 : (req.params.offset-1) * req.params.limit,
        limit: req.params.limit == null ? 1 : req.params.limit,
        order: 'rand()'
    }).then(function(obj) {
        var resObj = new responseObj();
        resObj.command = req.params.command;
        resObj.object = obj;
        res.json(resObj);
    });
});

module.exports = router;















