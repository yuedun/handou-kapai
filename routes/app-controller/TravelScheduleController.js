"use strict";
/**
 * Created by thinkpad on 2015/7/20.
 */
var async = require('async');
var commonUtils = require('../../utils/commonUtil');
var responseObj = require('../../models/ResponseObj.js');
var travelScheduleService = require('../../services/TravelScheduleService');
var topicPostService = require('../../services/topicPostService.js');
var newsService = require('../../services/newsService.js');
var userService = require('../../services/UserService.js');
var config = require('../../config/config.json');
var myClient = require('../../utils/redisDB').myClient;

var TravelScheduleController = function () {};

/**
 * 获取明星行程
 * @param req
 * @param res
 */
TravelScheduleController.getTravelSchedule = function (req, res) {
    //console.log("TravelScheduleController.getTravelSchedule");
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("categoryId");
    checkParams.push("travelDate");
    var result = commonUtils.paramsIsNull(req, res,checkParams);
    if(result) return;

    var command = req.body.command;
    //console.log(command);
    var object = req.body.object;
    var params = {
        categoryId: object.categoryId,
        travelDate: object.travelDate
    };
    var resObj = responseObj();
    resObj.command = command;
    travelScheduleService.getMonthSchedule(params, function (err, obj) {
        if (null == err) {
            if (null == obj) {
                resObj.object.msg = "没有行程";
                res.send(resObj);
            } else {
                resObj.object = obj;
                res.send(resObj);
            }
        } else {
            resObj.object.msg = "行程查询失败";
            resObj.status = false;
            resObj.code = '4001';
            res.send(resObj);
        }
    });
};

/** by hp
 * 明星今日动态
 * sns+行程+资讯
 * @param req
 * @param res
 */
TravelScheduleController.todaysDynamicStar = function(req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        groupId: object.groupId
    };
    var resObj = responseObj();
    resObj.command = command;
    async.parallel([
        function(callback){
            //sns
            travelScheduleService.todaySns(params, function(err, list){
                callback(null, list);
            });
        },
        function(callback){
            //行程
            travelScheduleService.todayTravel(params, function(err, list){
                callback(null, list);
            });
        },
        function(callback){
            //资讯
            travelScheduleService.todayNews(params, function(err, list){
                callback(null, list);
            });
        }
    ], function(err, result){
        if(err){
            resObj.errMsg(5002, "数据读取异常");
            res.send(resObj);
        } else {
            var results = [];
            result[0].forEach(function(item, index){
                results.push(item);
            });
            result[1].forEach(function(item, index){
                results.push(item);
            });
            result[2].forEach(function(item, index){
                item.postId = "http://nodeapi.handouer.cn:9000/lofti/api/kpnews/"+item.postId;
                results.push(item);
            });
            resObj.object = results;
            res.send(resObj);
        }
    })
};
/**
 * by hp
 * 广告位
 * @param req
 * @param res
 */
TravelScheduleController.advertisingHome = function(req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        groupId: object.groupId,
        state: 1
    };
    var cacheKey = "adver:"+object.groupId;
    var expire = 600;//单位秒
    var resObj = responseObj();
    resObj.command = command;
    myClient.select(cacheKey, function(err, reply){
        if (reply) {
            resObj.object = JSON.parse(reply);
            res.send(resObj);
        } else {
            travelScheduleService.advertisingHome(params, function(err, list){
                if(err){
                    resObj.errMsg(5002, JSON.stringify(err.message));
                    res.send(resObj);
                } else {
                    async.map(list, function(item, callback){
                        if(item.getDataValue("groupId") == null){
                            item.setDataValue("groupId", "");
                        }
                        if(item.getDataValue("releaseDate") == null){
                            item.setDataValue("releaseDate", "");
                        }
                        item.setDataValue("adverPic", config.qiniu.kp_site + item.getDataValue("adverPic"));
                        //频道和帖子类型根据编号查询id
                        if(item.getDataValue("linkType") === "topic" ||
                            item.getDataValue("linkType") === "post"){
                            var topicParams = {
                                condition: {
                                    topicNumber: item.getDataValue("linkValue")
                                },
                                attr: ['topicId', 'topicScope', 'topicName', 'topicDesc', 'userId']
                            };
                            topicPostService.getTopicByParam(topicParams, function(err, topic){
                                if(topic) {
                                    var userParam = {
                                        userId: topic.getDataValue("userId"),
                                        attributes: ['nickName', 'headPortrait']
                                    };
                                    userService.getUserInfo(userParam, function(err, user) {
                                        var userType = topic.getDataValue("user").getDataValue("userType") == "user"? 3: 1;
                                        topic.setDataValue("nickName", user.getDataValue("nickName"));
                                        topic.setDataValue("headPortrait", commonUtils.headPortrait(topic));
                                        topic.setDataValue("userType", userType);
                                        topic.setDataValue("user", undefined);
                                        item.setDataValue("linkValue", topic.getDataValue("topicId"));
                                        item.setDataValue("topic", topic);
                                        callback(null, item);
                                    });
                                } else {
                                    callback(null);
                                }
                            });
                        } else if(item.getDataValue("linkType") === "news"){
                            var newsParams = {
                                condition: {
                                    news_number: item.getDataValue("linkValue")
                                },
                                attr: ['news_id']
                            };
                            newsService.getNewsByParam(newsParams, function(err, obj){
                                item.setDataValue("linkValue", "http://nodeapi.handouer.cn:9000/lofti/api/news/"+obj.getDataValue("news_id"));
                                callback(null, item);
                            });
                        } else {
                            callback(null, item);
                        }
                    }, function(err, result){
                        var results = [];
                        result.forEach(function(item, index){
                            if (item) {
                                results.push(item);
                            };
                        });
                        myClient.setValue(cacheKey, expire, results, null);
                        resObj.object = results;
                        res.send(resObj);
                    });
                }
            });
        };
    });
};

module.exports = TravelScheduleController;
