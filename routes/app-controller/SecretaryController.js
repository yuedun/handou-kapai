'use strict';
/**
 * Created by admin on 2015/7/9.
 * 韩豆小秘书
 */
var Response = require('../../models/ResponseObj');
var dateUtils = require('../../utils/dateUtils.js');
var commonUtils = require('../../utils/commonUtil.js');
var secretaryService = require('../../services/SecretaryService.js');
var config = require('../../config/config.json');
var SecretaryController = function SecretaryController() {};
/**
 * 常见问题列表
 * @param req
 * @param res
 */
SecretaryController.getCommonQuestion = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        type: object.type
    };
    var resObj = Response();
    resObj.command = command;
    secretaryService.getCommonQuestion(params, function (err, list) {
        if (err) {
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            resObj.object = list;
            res.send(resObj);
        }
    });
};
/**
 * 我的问题
 * @param req
 * @param res
 */
SecretaryController.getMyQuestion = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        userId: object.userId,
        direction: object.direction,
        pageSize: object.pageSize ? object.pageSize : 10,
        lastDate: object.lastDate
    };
    var resObj = Response();
    resObj.command = command;
    secretaryService.getMyQuestion(params, function (err, list) {
        if (err) {
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            (function () {
                var secretaries = [];
                list.forEach(function (item, index) {
                	var headPortrait = null;
                	if (item.getDataValue("type") == 'q') {
                		headPortrait = item.getDataValue("User").getDataValue("headPortrait");
                	} else{
                		headPortrait = item.getDataValue("AnswerUser").getDataValue("headPortrait");
                	}
                    secretaries.push({
                        secretaryId: item.getDataValue("secretaryId"),
                        content: item.getDataValue("content"),
                        createDate: dateUtils.formatDate(item.getDataValue("createDate")),
                        type: item.getDataValue("type"),
                        headPortrait: headPortrait? config.qiniu.kp_site + headPortrait: config.qiniu.kp_site + config.qiniu.defaul_user_head
                    });
                });
                resObj.object = secretaries;
                res.send(resObj);
            })();
        }
    });
};
/**
 * 提问
 * @param req
 * @param res
 */
SecretaryController.addQuestion = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        type: "q",
        content: object.content,
        userId: object.userId
    };
    var resObj = Response();
    resObj.command = command;
    secretaryService.addQuestion(params, function (err, obj) {
        if (err) {
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            res.send(resObj);
        }
    });
};
/**
 * 我的消息-官方，评论、点赞、回复
 * @param req
 * @param res
 */
SecretaryController.myMessage = function (req, res) {
    let command = req.body.command;
    let object = req.body.object;
    let resObj = Response();
    resObj.command = command;
    if(object.chatType == 3){
        let params = {
            condition: {
                reciveUserId: object.userId,
                chatType: object.chatType,
                officalType: object.officalType
            },
            attrs: ['messageId', "messageText", "sendUserId", "reciveUserId", "topicId", "pushGoal", "chatType", "officalType", "releaseDate"],
            offset: object.pageIndex? (object.pageIndex - 1) * object.pageSize: 0,
            limit: object.pageSize? object.pageSize: 10
        };
        secretaryService.getMyMessage(params, function (err, list) {
            if (err) {
                resObj.errMsg(5002, JSON.stringify(err.message));
                res.send(resObj);
            } else {
                list.forEach(function(item, index){
                    item.setDataValue("headPortrait", commonUtils.headPortrait(item.getDataValue("sendUser")));
                    item.setDataValue("nickName",item.getDataValue("sendUser").getDataValue("nickName"));
                    if(item.getDataValue("sendUser").getDataValue("userType") == "user"){
                        item.setDataValue("userType", 3);       // 用户
                    } else {
                        item.setDataValue("userType", 1);       // 组织
                    }
                    item.getDataValue("officalType");
                    item.getDataValue("messageText");
                    item.setDataValue("sendUser", undefined);
                    item.setDataValue("reciveUser", undefined);
                    item.setDataValue("createDate", dateUtils.formatDate(item.setDataValue("releaseDate")));
                });
                resObj.object = list;
                res.send(resObj);
            }
        });
    } else if(object.chatType == 1){
        let params = {
            condition: {
                $or: [
                    {
                        chatType: object.chatType,
                        reciveUserId: object.userId
                    },
                    {
                        pushGoal:{$in:['all','fans','org']}
                    }
                ]
            },
            attrs: ['messageId', "messageText", "sendUserId", "reciveUserId", "topicId", "pushGoal", "chatType", "officalType", "releaseDate"],
            offset: object.pageIndex ? (object.pageIndex - 1) * object.pageSize: 0,
            limit: object.pageSize ? object.pageSize: 10
        };

        console.log('offset  = '+params.offset);
        console.log('limit   = '+params.limit);

        secretaryService.getofficiaMessage(params, function (err, list) {
            if (err) {
                resObj.errMsg(5002, JSON.stringify(err.message));
                res.send(resObj);
            } else {
                var messageList = [];
                list.forEach(function(item, index){
                    // 判断是推送给用户的
                    item.setDataValue("headPortrait", commonUtils.headPortrait(item.getDataValue("sendUser")));
                    item.setDataValue("nickName",item.getDataValue("sendUser").getDataValue("nickName"));
                    if(item.getDataValue("sendUser").getDataValue("userType") == "user"){
                        item.setDataValue("userType", 3);       // 用户
                    } else {
                        item.setDataValue("userType", 1);       // 组织
                    }
                    item.getDataValue("officalType");
                    item.getDataValue("messageText");
                    item.setDataValue("sendUser", undefined);
                    item.setDataValue("createDate", dateUtils.formatDate(item.setDataValue("releaseDate")));
                    messageList.push(item);
                });
                resObj.object = messageList;
                res.send(resObj);
            }
        });
    }
};

/**
 * 删除消息
 * @param req
 * @param res
 */
SecretaryController.removeMessage = function(req, res){
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        messageId: object.messageId
    };
    var resObj = Response();
    resObj.command = command;
    secretaryService.deleteMessage(params, function() {
        res.send(resObj);
    });
};

module.exports = SecretaryController;