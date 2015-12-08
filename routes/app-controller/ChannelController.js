"use strict";
var async = require('async');
var moment = require('moment');
var Response = require('../../models/ResponseObj');
var channelService = require('../../services/ChannelService');
var userService = require('../../services/UserService');
var topicPostService = require('../../services/topicPostService');
var beanRelationService = require('../../services/BeanRelationService');
var Constants = require('../../utils/constants');
var config = require('../../config/config');
var dateUtils = require('../../utils/dateUtils.js');
var commonUtils = require('../../utils/commonUtil.js');
var myClient = require('../../utils/redisDB').myClient;
var topicService = require('../../services/TopicService');
/**
 * by hp
 * 创建频道：0：普通频道，1：粉丝团频道，2：频道帖子，3,：组织帖子
 * 加积分
 * @param req
 * @param res
 */
exports.createChannel = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId: object.userId,
		groupId: object.groupId,//用户可以属于多个组织，所以需要前端传递该参数
		name: object.topicName,
		scope: object.topicScope,
		desc: object.topicDesc,
		topicType: object.groupId? 1: 0//粉丝团id存在为粉丝团频道，不存在为普通频道
	};
	if(commonUtils.paramsIsNull(req, res, ['userId','topicName','topicScope','topicDesc'])){
		//如果有空值则retrun不继续往下执行
		return;
	}
	//频道内容范围 0：文字频道，1：图片频道，2：语音频道，3：动图频道
	var response = Response();
	response.command = command;
	channelService.createChannel(params, function(error, data) {
		if(error) {
			response.status = false;
			response.errMsg(5000, error);
			res.send(response);
		}else{
			var params1 = {
				userId: params.userId,
				beanType: Constants.BEAN_TYPE.CREATE_TOPIC,
				beanDate: moment().format("YYYY-MM-DD"),
				startOfDate:dateUtils.getweekDate().weekStartDate,
				endOfDate:dateUtils.getweekDate().weekEndDate
			};
			//加积分,先查询后操作,如果已加过100豆币则不再加(每周限2次)
			beanRelationService.findBean(params1, function(list){
				if(list.length < 2){
					async.parallel([
						function(callback){
							params1.beanValue = 100;//创建频道100积分
							//创建关系
							beanRelationService.createBeanRealtion(params1, function(err, obj){
								callback(null, obj);
							});
						},
						function(callback){
							var params2 = {
								userId: params.userId,
								beanValue: 100,
								attributes: ['userId','bean']
							};
							//修改用户积分
							userService.updateUserBean(params2, function(err,obj){
								callback(null, obj);
							});
						}
					], function(err, result){
						if(err){
							response.errMsg(5002, "数据读写异常");
							res.send(response);
						} else {
							response.setObject(data);
							res.send(response);
						}
					});
				} else {
					//已加豆币不建关系和修改用户豆币
					response.setObject(data);
					res.send(response);
				}
			});
		}
	});
};

/**
 * 查询频道首页：推荐频道列表
 * @return {[type]} [description]
 */
exports.getTopChannels = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		offset: object.pageIndex? (object.pageIndex - 1) * object.pageSize: 0,
		limit: object.pageSize? object.pageSize: Constants.DEFAULT_PAGE_SIZE
	};
	var cacheKey = "TopChannels:";
    var expire = 600;//单位秒
	var response = Response();
	response.command = command;
	myClient.select(cacheKey, function(err, reply){
        if (reply) {
            response.object = JSON.parse(reply);
            res.send(response);
        } else {
        	channelService.getRecommendedChannelList(params, function(err, results) {
				async.map(results, function(item, callback){
					item.userType = (item.userType == "org"? 1: 3);
					item.headPortrait = commonUtils.headPortrait(item);
					item.createDate = dateUtils.formatDate(item.createDate);
					item.updateDate = dateUtils.formatDate(item.updateDate);
					callback(null, item);
				}, function(err, result){
					myClient.setValue(cacheKey, expire, result, null);
					response.object = result;
					res.send(response);
				});
			});
        }
    });
};
/**
 * 查询频道首页，最新频道，按时间倒序
 * @return {[type]} [description]
 */
exports.getLatestChannels = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		direction: object.direction? object.direction: Constants.DIRECTION.REFRESH,
		lastDate: object.lastDate,
		limit: object.pageSize? object.pageSize: Constants.DEFAULT_PAGE_SIZE//默认100条
	};
	var response = Response();
	response.command = command;
	channelService.getChannels(params, function(err, results) {
		async.map(results, function(item, callback){
			channelService.getChannelsPostCount({pTopicId: item.topicId, topicState: 1}, function(err, count) {
				item.degreeOfHeat = count;
				item.userType = (item.userType == "org"? 1: 3);
				item.headPortrait = commonUtils.headPortrait(item);
				item.createDate = dateUtils.formatDate(item.createDate);
				item.updateDate = dateUtils.formatDate(item.updateDate);
				callback(null, item);
			});
		}, function(err, result){
			response.object = result;
			res.send(response);
		});
	});
};

/**
 * 粉丝团下频道列表
 * @return {[type]} [description]
 */
exports.getGroupChannels = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		groupId: object.groupId,
		topicState: Constants.STATE.ACTIVE,
		isRecommend: Constants.NO,
		direction: object.direction,
		lastDate: object.lastDate,
		pageSize: object.pageSize? object.pageSize: Constants.DEFAULT_PAGE_SIZE
	};
	var resObj = Response();
	resObj.command = command;
	channelService.getGroupChannels(params, function(err, results) {
		async.map(results, function(item, callback){
			channelService.getChannelsPostCount({pTopicId: item.topicId, topicState: 1}, function(err, count) {
				item.degreeOfHeat = count;
				item.headPortrait = commonUtils.headPortrait(item);
				item.userType = (item.userType == "org"? 1: 3);
				item.createDate = dateUtils.formatDate(item.createDate);
				item.updateDate = dateUtils.formatDate(item.updateDate);
				callback(null, item);
			});
		}, function(err, result){
			resObj.object = result;
			res.send(resObj);
		});
	});
};

/**
 * 用户删除帖子
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.removePost = function(req, res) {
	var response = Response();
	var params = req.body.object;
	var command = req.body.command;
	params.topicState = Constants.STATE.FROZEN;
	
	topicPostService.getTopicById(params,function(err,topic){
		// 判断当前用户是否为该条帖子的作者。
		if(topic.userId == params.userId){
			// 相等执行删除操作
			topicPostService.updatePostById(params, function(state) {
				response.command = command;
				if (state) {
					response.object.status = true;
				} else {
					response.object.status = false;
				}
				res.send(response);
			});
		} else {
			// 不相等时提示用户
			response.errMsg(5006,"不能删除别人的帖子哦");
			res.send(response);
		}
	});
};

/**
 * 今天一天内是否创建过频道          没创建过返回true     创建过返回false
 * @param {Object} req
 * @param {Object} res
 */
exports.isUpTopic = function(req,res){
	var resObj = Response();
	var object = req.body.object;
	var command = req.body.command;
	resObj.command = command;
	if(commonUtils.paramsIsNull(req, res, ['userId'])){
		return;
	}
	var params = {
		userId: object.userId
	};
	topicService.isUpTopic(params, function(err, count) {
		if(err){
			resObj.errMsg(5001, "数据读取异常"+err.message);
			res.send(resObj);
		}else{
			if(count[0].count <= 0){
				resObj.object = {whetherUpTopic : true};
			}else{
				resObj.object = {whetherUpTopic : false};
			}
			res.send(resObj);
		}
	});
};