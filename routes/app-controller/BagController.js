"use strict";
/**
 * Created by thinkpad on 2015/7/23.
 */
var async = require('async');
var moment = require('moment');
var commonUtils = require('../../utils/commonUtil');
var responseObj = require('../../models/ResponseObj.js');
var bagService = require('../../services/BagService');
var userService = require('../../services/UserService');
var giftService = require('../../services/giftService');
var dateUtils = require('../../utils/dateUtils');
var bag = require('../../models/sqlFile/Bag');
var config = require('../../config/config');
var BagController = function () {};

/**
 * 获得背包中的兑换券信息
 * @param req
 * @param res
 */
BagController.getTicketsInBag = function (req, res) {
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("userId");
    var result = commonUtils.paramsIsNull(req, res, checkParams);
    if(result) return;
    var command = req.body.command;
    var object = req.body.object;
    var params = {
        userId: object.userId
    };
    var resObj = responseObj();
    resObj.command = command;
    bagService.getTicketsInBag(params, function (err, tickets) {
        if (null == err) {
            if (null == tickets) {
                resObj.object.msg = "没有兑换券";
                res.send(resObj);
            } else {
                var ticketArray = [];
                tickets.forEach(function (ticket) {
                    var obj = {
                        bagId: ticket.bag_id,
                        ticketType: ticket.ticket_type,
                        ticketName: ticket.ticket_name,
                        ticketAmount: ticket.ticket_amount,
                        ticketId: ticket.ticket_id,
                        ticketPictureUrl: config.qiniu.kp_site + ticket.ticket_picture_url,
                        usage: ticket.ticket_usage,
                        produceDate: dateUtils.formatDate(ticket.produceDate),
                        expireDate: dateUtils.formatDate(ticket.expireDate)
                    };
                    ticketArray.push(obj);
                });
                resObj.object = ticketArray;
                res.send(resObj);
            }
        } else {
            resObj.object.msg = "背包查询失败";
            resObj.status = false;
            resObj.code = '4001';
            res.send(resObj);
        }
    });
};

/**
 * 使用豆币券
 * @param req
 * @param res
 */
BagController.useDouBiExchange = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    checkValid(req, res, function (ret) {
        var ticketParam = {
            ticketId: object.ticketId
        };
        bagService.getTicketParValue(ticketParam, function (err, ret) {
            var integralParams = {
                userId: object.userId,
                beanValue: object.ticketAmount*ret[0].par_value,
                attributes: ['userId', 'bean']
            };
            userService.updateUserBean(integralParams, function (err,obj) {
            });
            var comsumeParams = {
                userId: object.userId,
                ticketId: object.ticketId,
                ticketAmount: object.ticketAmount
            };
            comsumeTicketInBag(comsumeParams, function (ret) {
                if (ret.exchangeStatus == "success") {
                    resObj.object = {exchangeStatus: "success"};
                    res.send(resObj);
                }
            });
        });
    });
};

/**
 * 使用打卡券
 * @param req
 * @param res
 */
BagController.useDakaExchange = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var result = checkDakaParams(req,res);
    if(result) return;
    var params = {
        userId: object.userId,
        ticketId: object.ticketId,
        ticketAmount: object.ticketAmount
    };
    bagService.freshDailyTicketofDaka(params, function () {
        bagService.getTotalTicketsofDaka(params,function(err,records){
            if(records[0].total_amount > 0){
                bagService.hasEnoughTicketofDailyDaka(params,function(err,records){
                    var exchangeParams = {
                        userId:params.userId,
                        ticketId:params.ticketId,
                        ticketAmount:params.ticketAmount
                    };
                    if(records.length > 0){
                        exchangeParams.ticketId = bag.DAKATicketID.DailyDaka;
                    }else{
                        exchangeParams.ticketId = bag.DAKATicketID.Daka;
                    }
                    comsumeTicketInBag(exchangeParams, function (ret) {
                        if (ret.exchangeStatus == "success") {
                            resObj.object = {exchangeStatus: "success"};
                            res.send(resObj);
                        }
                    });
                });
            }else{
                resObj.errMsg("4017", "兑换券无效");
                resObj.status = false;
                res.send(resObj);
            }
        });

    });
};

/**
 * 使用专辑券
 * @param req
 * @param res
 */
BagController.useZhuanjiExchange = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var result = checkZhuanjiParams(req,res);
    if(result) return;
    checkExchangeValidation(req,res,function(ret){
        var params = {
            userId: object.userId,
            ticketId: object.ticketId,
            ticketAmount: object.ticketAmount,
            exchangeType:bag.EXCHANGE_TYPE.ALBUM,
            starName:object.starName,
            albumName:object.albumName
        };
        bagService.insertExchangeInfo(params,function(records){
            comsumeTicketInBag(params, function (ret) {
                if (ret.exchangeStatus == "success") {
                    resObj.object = {exchangeStatus: "success"};
                    res.send(resObj);
                }
            });
        });
    });
};

/**
 * 使用鲜花券
 * @param req
 * @param res
 */
BagController.useFlowerExchange = function (req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    checkValid(req, res, function (ret) {
        var params = {
            userId: object.userId,
            ticketId: object.ticketId,
            ticketAmount: object.ticketAmount
        };
        comsumeTicketInBag(params, function (ret) {
            if (ret.exchangeStatus == "success") {
                resObj.object = {exchangeStatus: "success"};
                res.send(resObj);
            }
        });
    });
};

var checkValid = function (req, res, callback) {
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("userId");
    checkParams.push("ticketId");
    checkParams.push("ticketAmount");
    var result = checkParameters(req,res,checkParams);
    if(result) return;
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var params = {
        userId: object.userId,
        ticketId: object.ticketId,
        ticketAmount: object.ticketAmount
    };
    bagService.isValidExchange(params, function (err, ret) {
        if (ret.isValid) {
            callback(ret);
        } else {
            resObj.errMsg("4017", "兑换券无效");
            resObj.status = false;
            res.send(resObj);
        }
    });
};

var checkExchangeValidation = function (req, res, callback) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var params = {
        userId: object.userId,
        ticketId: object.ticketId,
        ticketAmount: object.ticketAmount
    };
    bagService.isValidExchange(params, function (err, ret) {
        if (ret.isValid) {
            callback(ret);
        } else {
            resObj.errMsg("4017", "兑换券无效");
            resObj.status = false;
            res.send(resObj);
        }
    });
};

/**
 * 检查参数打卡券是否有效
 * @param req
 * @param res
 */
var checkDakaParams = function (req, res) {
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("userId");
    checkParams.push("ticketId");
    checkParams.push("ticketAmount");
    return checkParameters(req,res,checkParams);

};

/**
 * 检查参数专辑券是否有效
 * @param req
 * @param res
 */
var checkZhuanjiParams = function (req, res) {
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("userId");
    checkParams.push("ticketId");
    checkParams.push("ticketAmount");
    checkParams.push("starName");
    checkParams.push("albumName");
    return checkParameters(req,res,checkParams);
};

/**
 * 检查参数是否有效
 * @param req
 * @param res
 * @param checkParams
 */
var checkParameters = function(req,res,checkParams){
    return commonUtils.paramsIsNull(req, res, checkParams);
};

/**
 * 扣除兑换券
 * @param params
 * @param callback
 */
var comsumeTicketInBag = function (params, callback) {
    bagService.useTicketInBag(params, function (err, ret) {
        bagService.clearTicketInBag(params, function (err, ret) {
        });
        var ret = {exchangeStatus: "success"};
        callback(ret);

    });
};

/**
 * 向用户背包中添加兑换券
 * @param req
 * @param res
 */
BagController.addTicket = function(req,res){
    //检测请求参数是否存在
    var checkParams = [];
    checkParams.push("userId");
    checkParams.push("ticketId");
    checkParams.push("ticketAmount");
    var result = checkParameters(req,res,checkParams);
    if(result) return;
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var currentTime = new Date();
    var ticketparams = {
        userId: object.userId,
        ticketId: object.ticketId,
        ticketAmount: object.ticketAmount,
        createDate:currentTime
    };

    var params2 = {
        ticketId:object.ticketId
    };
    // 检测是否抽到实物奖
    giftService.findOneTicketSet(params2, function(err, ticketSet){
        // 抽到实物奖时
        if(ticketSet){
            // 抽到并且实物奖没有的时候
            if(ticketSet.ticketCount <= 0){
                resObj.errMsg(5007,"当前版本过旧，当前抽奖无效");
                res.send(resObj);
            } else {
                bagService.addTicket(ticketparams,function(){
                    resObj.object = {OperateStatus: "success"};
                    res.send(resObj);
                });
            }
        } else {
            // 不存在则按正常流程走
            bagService.addTicket(ticketparams,function(){
                resObj.object = {OperateStatus: "success"};
                res.send(resObj);
            });
        }
    });
};

/**
 * 获得可抽取的奖券列表
 * @param req
 * @param res
 */
BagController.getGiftTicketList = function(req,res){
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    bagService.getTicketListWithoutDailyDaka(function(err,tickets){
        if (null == tickets) {
            resObj.object.msg = "没有奖券";
            resObj.code = "5010";
            res.send(resObj);
        } else {
            var ticketArray = [];
            tickets.forEach(function (ticket) {
                var obj = {
                    ticketId: ticket.ticket_id,
                    ticketType: ticket.ticket_type,
                    ticketName: ticket.ticket_name,
                    parValue: ticket.par_value,
                    ticketPictureUrl: ticket.ticket_picture_url,
                    usage: ticket.ticket_usage,
                    produceDate: dateUtils.formatDate(ticket.produceDate),
                    expireDate: dateUtils.formatDate(ticket.expireDate)
                };
                ticketArray.push(obj);
            });
            resObj.object = ticketArray;
            res.send(resObj);
        }
    });
};

/**
 * 获取奖品设置列表
 * @param {Object} req
 * @param {Object} res
 */
BagController.getTicketSet = function(req, res){
	var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    resObj.command = command;
    var params = {
    	userId:object.userId
    }
    giftService.getTicketSet(params, function(err, tickesetlist){
		resObj.object = tickesetlist;
    	res.send(resObj);
    });
};

module.exports = BagController;
