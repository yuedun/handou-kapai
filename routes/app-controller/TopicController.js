"use strict";
var async = require('async');
var moment = require('moment');
var commonUtils = require('../../utils/commonUtil');
var responseObj = require('../../models/ResponseObj.js');
var topicService = require('../../services/TopicService');
var topicPostService = require('../../services/topicPostService');
var commentService = require('../../services/CommentService.js');
var LikeRelationService = require('../../services/LikeRelationService.js');
var dateUtils = require('../../utils/dateUtils');
var config = require('../../config/config');
var Constants = require('../../utils/constants');
var myClient = require('../../utils/redisDB').myClient;
var TopicController = function(){};

/**
 * edit by hp
 * 通用频道列表
 * （暂时不通用）可用于1、推荐频道 2、最新频道、3、粉丝团频道 4、组织频道 5、组织帖子 6、我的频道 7、我的帖子
 * 各个频道列表可能有的区别：排序-日期，热度，分页-日期，页码
 * @param req
 * @param res
 */
TopicController.getTopicList = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtils.paramsIsNull(req, res, ["userId", "direction"])) return;
	var params= {
		userId: object.userId,
		orderType: object.orderType? object.orderType: null,
		pageSize: object.pageSize? object.pageSize: Constants.DEFAULT_PAGE_SIZE,
		lastDate: object.lastDate,
		direction: object.direction? object.direction: Constants.DIRECTION.REFRESH
	};
	var cacheKey = "topic:hotest";
    var expire = 600;//单位秒
	var resObj = responseObj();
	resObj.command = command;
	myClient.select(cacheKey, function(err, reply){
        if (object.orderType == "hot" && object.direction == Constants.DIRECTION.LOADMORE && reply) {
            resObj.object = JSON.parse(reply);
            res.send(resObj);
        } else {
		    topicService.getUserTopicList(params, function (err, list) {
		        if (err) {
		            resObj.errMsg(5001, "数据读写异常"+JSON.stringify(err.message));
					res.send(resObj);
		        } else {
					list.forEach(function(item, index){
						item.userType = (item.userType == "org"? 1: 3);
						item.createDate = dateUtils.formatDate(item.createDate);
						item.updateDate = dateUtils.formatDate(item.updateDate);
						item.headPortrait = commonUtils.headPortrait(item);
					});
					if (object.orderType == "hot") {
						myClient.setValue(cacheKey, expire, list, null);
					}
					resObj.object = list;
		            res.send(resObj);
		        }
		    });
		}
	});
};
/**
 * by hp
 * 我的频道-普通频道，粉丝团频道1.1版本新增
 * 各个频道列表可能有的区别：排序-日期，热度，分页-日期，页码
 * @param req
 * @param res
 */
TopicController.getMyTopicList = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtils.paramsIsNull(req, res, ["userId", "topicType", "direction", "pageSize"])) return;
	var params= {
		userId: object.userId,
		topicType: object.topicType,//0：普通频道，1：粉丝团频道，2：频道帖子，3：组织帖子
		pageSize: object.pageSize? object.pageSize: Constants.DEFAULT_PAGE_SIZE,
		lastDate: object.lastDate,
		direction: object.direction? object.direction: Constants.DIRECTION.REFRESH
	};
	var resObj = responseObj();
	resObj.command = command;
    topicService.getMyTopicList(params, function (err, list) {
        if (err) {
            resObj.errMsg(5001, "数据读写异常"+JSON.stringify(err.message));
			res.send(resObj);
        } else {
			list.forEach(function(item, index){
				item.userType = (item.userType == "org"? 1: 3);
				item.createDate = dateUtils.formatDate(item.createDate);
				item.updateDate = dateUtils.formatDate(item.updateDate);
				item.headPortrait = commonUtils.headPortrait(item);
			});
			resObj.object = list;
            res.send(resObj);
        }
    });
};
/**
 * 获取频道主基本信息
 * @param {Object} req
 * @param {Object} res
 */
TopicController.topicHostInfo = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		topicId:object.topicId
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.getTopicHostInfo(params,function(err,obj){
		resObj.object = {
			topicDesc:obj.getDataValue('topicDesc'),
			nickName:obj.getDataValue('user').getDataValue('nickName'),
			headPortrait:config.qiniu.kp_site + obj.getDataValue('user').getDataValue('headPortrait'),
			userId:obj.getDataValue('user').getDataValue('userId')
		};
		res.send(resObj);
	});
};

/**
 * 频道下的帖子列表
 * @param {Object} req
 * @param {Object} res
 */
TopicController.topicPost = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	// params对象里面不能直接放userId,会影响SQL查询
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		loginUser:object.userId,	// 当前APP 用户
		parentTopicId:object.parentTopicId
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.topicPostList(params,function(err,postlist){
		async.map(postlist,function(item,callback){
			// 对输出字段判空处理
			item.topicName = item.topicName ? item.topicName : "";
			item.topicDesc = item.topicDesc ? item.topicDesc : "";
			item.isRecommend = item.isRecommend ? item.isRecommend : 0;
			item.nickName = item.nickName ? item.nickName : "";
			// 图片字段判空处理
			var imagelist = [];
			if('' == item.topicPics || null == item.topicPics){
				item.topicPics = imagelist;
			}else{
				// 处理图片
				var imgarry = item.topicPics.split(",");
				for(var i = 0; i < imgarry.length; i++){
					imagelist.push(config.qiniu.kp_site + imgarry[i]);
				}
				item.topicPics = imagelist;
			}
			
			// 处理图片尺寸
			var picSizelist = [];
			if('' == item.picsSize || null == item.picsSize){
				item.picsSize = picSizelist;
			} else {
				// 处理图片尺寸
				var picSizeArry = item.picsSize.split(",");
				for(var j = 0; j < picSizeArry.length; j++){
					picSizelist.push(picSizeArry[j]);
				}
				item.picsSize = picSizelist;			
			}
			// 是否存在音频
			item.audioAddress = item.audioAddress ? config.qiniu.kp_site + item.audioAddress : "";
			// 设置官方豆头像
			item.headPortrait = item.headPortrait ? config.qiniu.kp_site + item.headPortrait : config.qiniu.kp_site + config.qiniu.defaul_user_head;
			// 判断定时发布帖子时间(定时时间字段不为空时说明该帖子为定时帖子)
			if(null != item.timedReleaseDate && '' != item.timedReleaseDate){
				item.createDate = item.timedReleaseDate;
			} else {
				item.timedReleaseDate = "";
			}
			// 设置帖子时间
			item.createDate = dateUtils.formatDate(item.createDate);
			// 判断用户类型
			item.userType = item.userType == "org" ? 1: 3;
			async.parallel([
				// 帖子的评论数
				function(callback0){
					var params0 = {
						commentState:1,
						topicId:item.topicId
					};
					commentService.getNewPostCommentCountObj(params0,function(err,commentCount){
						callback0(null,commentCount);
					});
				},
				// 判断当前app用户对该条帖子的点赞状态
				function(callback1){
					var params1 = {
						postId:item.topicId,
						userId:object.userId,
						type:0	// 帖子的点赞关系用0标识
					};
					LikeRelationService.getTopicLikeRelation(params1,function(err,islikeRelation){
						callback1(null, islikeRelation);
					});
				}
			],function(err,result){
				// 给item对象设置评论数
				item.commentCount = result[0][0].commentCount;
				// 判断当前app用户是否点过赞
				item.likeRelation = result[1] ? result[1].state : 0;
				callback(null,item);
			});
		},function(err, results){
			resObj.object = results;
			res.send(resObj);
		});
	});
};

/**
 * 关注频道(或取消关注频道)
 * @param req
 * @param res
 */
TopicController.followTopic = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId: object.userId,
		topicId: object.topicId,
		relationState: object.action=="follow"? 1: 0
	};
	var resObj = responseObj();
	resObj.command = command;
	if(object.action == 'follow'){
		topicService.getUserTopicRelation(params, function(err, obj){
			if(obj){
				topicService.upFollowTopic(params, function(err, results) {
					res.send(resObj);
				});
			}else{
				topicService.followTopic(params, function(err, results) {
					res.send(resObj);
				});
			}
		});
	} else{
		topicService.upFollowTopic(params, function(err, results) {
			res.send(resObj);
		});
	}
};

module.exports = TopicController;