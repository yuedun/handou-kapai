"use strict";
// 导入辅助模块
var async = require('async');
var Response = require('../../models/ResponseObj');
var Constants = require('../../utils/constants');
var util = require('util');
var moment = require('moment');
// 导入service模块
var groupService = require('../../services/groupService');
var userService = require('../../services/UserService');
var LikeRelationService = require('../../services/LikeRelationService');
var commentService = require('../../services/CommentService');
var topicPostService = require('../../services/topicPostService');
var config = require('../../config/config');
var dateUtils = require('../../utils/dateUtils.js');
var commonUtil = require('../../utils/commonUtil');
var messagePushService = require("../../services/MessagePushService.js");
var myClient = require('../../utils/redisDB').myClient;
var GroupController = function() {}; //Controller对象

/**
 * 频道页-粉丝团频道-明星列表5条数据,查看更多
 * @param req
 * @param res
 */
GroupController.getGroupListWithTopChannels = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		offset: object.pageIndex? (object.pageIndex - 1) * object.pageSize: 0,
		limit: object.pageSize? object.pageSize: 5
	};
	var cacheKey = "GroupListWithTopChannels:"+object.pageIndex;
    var expire = 600;//单位秒
	var resObj = Response();
	resObj.command = command;
	myClient.select(cacheKey, function(err, reply){
        if (reply && object.pageSize == 5) {
            resObj.object = JSON.parse(reply);
            res.send(resObj);
        } else {
        	groupService.getGroupListByChannelQuantity(params, function(err, results) {
				if(err){
					resObj.errMsg(5000, err);
					res.send(resObj);
				}else{
					async.map(results, function(item, callback){
						if(item.starLogo){
							item.starLogo = config.qiniu.kp_site + item.starLogo;
						}else{
							item.starLogo = config.qiniu.kp_site + config.qiniu.defaul_user_head;
						}
						callback(null, item);
					}, function(err, result){
						if (object.pageSize == 5) {
							myClient.setValue(cacheKey, expire, result, null);
						}
						resObj.object = result;
						res.send(resObj);
					});
				}
			});
        }
    });
};

/**
 * by hp
 * 首次订阅获取明星列表
 * @param req
 * @param res
 */
GroupController.starList = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId: object.userId,
		attributes: ['groupId', 'starLogo', 'starName'],
		pageIndex: 1, //表示从1页开始
		pageSize: 1000
	};
	var resObj = Response();
	resObj.command = command;
	groupService.getStarList(params, function(err, list) {
		if (err) {
			resObj.errMsg(5000, err.message);
			res.send(resObj);
		} else {
			list.forEach(function(item, index){
				var selected = false;
				if(item.getDataValue("GroupUserRelation") &&
					item.getDataValue("GroupUserRelation").getDataValue("selectionState")) {
					//关系存在且值为1时为已选择
					selected = true;
				}
				list[index] = {
					groupId: item.getDataValue("groupId"),
					starLogo: config.qiniu.kp_site + item.getDataValue("starLogo"),
					starName: item.getDataValue("starName"),
					selected: selected
				}
			});
			resObj.object = list;
			res.send(resObj);
		}
	});
};

/**
 * by hp
 * 绑定或取消用户明星关系（可用于更换明星）
 * 取消选择的修改选择状态，目的取消选择明星后保留身份卡
 * @param req
 * @param res
 */
GroupController.userStarRelation = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ['userId', 'userType'])) {
		return;
	}
	var params = {
		userId: object.userId,
		userType: object.userType == 1? 'org': 'user'
	};
	var starList = object.starList;//参数传递过来选择的明星列表
	var newLength = starList.length;
	var originalList = object.originalList;//原来选择的明星列表
	var oldLength = originalList.length;
	var resObj = Response();
	resObj.command = command;
	//对比原有加入和现有加入，不存在的修改为取消状态，存在的不变，新增的添加数据
	async.each(originalList, function(item, callback){
		//旧的中的每一个在新的中是否存在,逻辑删除取消选择的
		if(starList.indexOf(item) < 0){
			var gurParam = {
				upFields:{selectionState: 0},
				userId: object.userId,
				groupId: item
			};
			//旧的在新的中不存在修改为取消状态
			groupService.upGroupUserRelation(gurParam, function(err, obj){
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		}
	}, function(err){
		if (err) {
			resObj.errMsg(5000, '操作失败');
			res.send(resObj);
		}
	});
	async.each(starList, function(item, callback){
		//新的中的每一个在旧的中是否存在，新增的
		if(originalList.indexOf(item) < 0){
			params.groupId = item;
			//新的在旧的中不存在添加数据库记录
			groupService.setUserStarRelation(params, function(err, obj) {
				if (err) {
					callback(err);
				}else {
					callback();
				}
			});
		}
	}, function(err){
		if (err) {
			resObj.errMsg(5000, '操作失败');
			res.send(resObj);
		}
	});
	res.send(resObj);
};

/**
 * by hp
 * 1.5版本选择明星
 * @param req
 * @param res
 */
GroupController.selectStar = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ['userId', 'userType'])) {
		return;
	}
	var params = {
		userId: object.userId,
		userType: object.userType == 1? 'org': 'user'
	};
	var starList = object.starList;//参数传递过来选择的明星列表
	var resObj = Response();
	resObj.command = command;
	async.each(starList, function(item, callback){
		params.groupId = item;
		groupService.setUserStarRelation(params, function(err, obj) {
			if (err) {
				callback(err);
			}else {
				callback();
			}
		});
	}, function(err){
		if (err) {
			resObj.errMsg(5000, '操作失败');
			res.send(resObj);
		} else {
			res.send(resObj);
		}
	});
}

/**
 * by hp
 * 1.5版本取消明星
 * @param req
 * @param res
 */
GroupController.deselectStar = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ['userId', 'userType'])) {
		return;
	}
	var params = {
		userId: object.userId,
		userType: object.userType == 1? 'org': 'user'
	};
	var starList = object.starList;//参数传递过来选择的明星列表
	var resObj = Response();
	resObj.command = command;
	async.each(starList, function(item, callback){
		params.upFields = {selectionState: 0};
		params.groupId = item;
		groupService.upGroupUserRelation(params, function(err, obj){
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	}, function(err){
		if (err) {
			resObj.errMsg(5000, '操作失败');
			res.send(resObj);
		} else {
			res.send(resObj);
		}
	});
}

/**
 * by hp
 * 我选择的明星列表，首页(普通用户)
 * @param req
 * @param res
 */
GroupController.myStarList = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		condition : {userId: object.userId, selectionState: 1},
		attributes: ['groupId', 'starLogo', 'starName']
	};
	var resObj = Response();
	resObj.command = command;
	//我选择的明星列表
	groupService.getMyStarList(params, function(err, list) {
		if (err) {
			resObj.errMsg(5000, "系统错误");
			res.send(resObj);
		} else {
			async.map(list, function(item, callback){
				var groupId = item.getDataValue("Group").getDataValue("groupId");
				var params2 = {groupId: groupId, userId: object.userId};
				//粉丝团信息，是否加入
				groupService.getGroupFansCount(params2, function (err, obj) {
					if (err) {
						resObj.errMsg(5000, "系统错误");
						res.send(resObj);
					} else {
						var starObj = {
							groupId: item.getDataValue("Group").getDataValue("groupId"),
							starName: item.getDataValue("Group").getDataValue("starName"),
							starLogo: config.qiniu.kp_site + item.getDataValue("Group").getDataValue("starLogo"),
							groupName: obj.getDataValue("groupName"),
							fansCount: obj.getDataValue("fanCount"),
							join: obj.getDataValue("GroupUserRelation").getDataValue("groupRelationState") ? true : false
						};
						callback(null, starObj);
					}
				});
			}, function(err, result){
				resObj.object = result;
				res.send(resObj);
			});
		}
	});
};

/**
 * by hp
 * 用户加入粉丝团，加入粉丝团获得身份卡，退出组织回收身份卡，取消关注粉丝团下组织
 * @param req
 * @param res
 */
GroupController.joinOrOutGroup = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		groupRelationState: object.action,//加入1，退出0
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	};
	var condition = {
		userId: object.userId,
		groupId: object.groupId
	};
	var resObj = Response();
	resObj.command = command;
	//加入或退出粉丝团
	groupService.joinOrOutGroup(params, condition, function(err, obj) {
		if (err) {
			resObj.errMsg(5000, "系统错误");
			res.send(resObj);
		} else {
			if(object.action == 1){
				var params2 = {
					userId: object.userId,
					groupId: object.groupId
				};
				//获取身份卡 修改粉丝团粉丝数
				async.auto({
					upCardNum: function(callback){
						//修改身份卡号
						groupService.updateCardNum({action: 1, groupId: object.groupId}, function(err, obj){
							callback(null, obj);
						});
					},
					addCard: ['upCardNum', function(callback, cardNum){
						params2.cardNumber = cardNum.upCardNum.getDataValue("cardNumber");
						groupService.addIDCard(params2, function(err, obj){
							callback(null, obj);
						});
					}],
					upFans: function(callback){
						//修改粉丝数
						groupService.updateGroupFansCount({action: 1, groupId: object.groupId}, function(err, obj){
							callback(null, obj);
						});
					}
				}, function(err, result){
					if(err){
						resObj.errMsg(5001, err.message);
						res.send(resObj);
					} else {
						messagePushService.subscribeChannel({userId:object.userId,channels:object.groupId});
						resObj.object = {
							cardNumber:result.upCardNum.getDataValue("cardNumber"),
							groupName:result.upCardNum.getDataValue("groupName")
						};
						res.send(resObj);
					}
				});
			}else if(object.action == 0){
				//回收身份卡 身份卡解除关联，取消加入的组织
				var params3 = {
					cardState: 0,
					updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
				};
				//async.auto
				async.auto({
					recover: function(callback){
						// 身份卡信息回收
						groupService.recoverIDCard(params3, condition, function(err, obj){
							callback(null, obj);
						});
					},
					groupsOrg: function(callback){
						// 查询粉丝团下的组织
						groupService.getGroupsOrg({groupId:object.groupId}, function(err, list){
							callback(null, list);
						});
					},
					upfans: function(callback){
						//修改粉丝数
						groupService.updateGroupFansCount({action: -1, groupId: object.groupId}, function(err, obj){
							callback(null, obj);
						});
					},
					userQuitGroup: ['groupsOrg', function(callback, results2){
						//物理删除用户与组织关系
						async.map(results2.groupsOrg, function(item, callback){
							groupService.userQuitGroup({orgId:item.userId, userId:object.userId}, function(err, obj){
								callback(null, obj);
							});
						}, function(err, result3){
							callback(null, result3);
						});
					}]
				}, function(err, results) {
					var arr = [];
					arr.push(object.groupId);
					messagePushService.unsubscribeChannel({userId:object.userId,channels:arr});
					if(err){
						resObj.errMsg(5000, "退出失败！");
					}
					res.send(resObj);
				});
			}
		}
	});
};

/** by ls
 * 我的身份卡
 * @param params
 * @param callback
 */
GroupController.getIDCard = function(req, res) {
	var command = req.body.command;
    var params = req.body.object;
    var resObj = Response();
    //params.pageSize = 100;
    /* if (params.pageSize == null || params.pageSize == '') {
	 	params.pageSize = 10;
	 }*/
	if(null == params){
    	resObj.errMsg( 4002, '参数为空！');
    	res.send(resObj);
    }
    
    if (params.pageSize == null) {
		params.pageSize = Constants.DEFAULT_PAGE_SIZE;
	}
	if (params.direction == null) {
		params.direction = Constants.DIRECTION.REFRESH;
	}
	if (params.lastDate == null) {
		params.direction = Constants.DIRECTION.REFRESH;
	}
    resObj.command = command;
    groupService.getIDCardAndDetail(params,function(err,list){
    	if(list.length <= 0){
    		//resObj.errMsg( 4001, '查询结果为空！');
    		resObj.object = [];
    		res.send(resObj);
    	}else{
    		resObj.object = [];
  		list.forEach(function(i,index){
  			resObj.object.push({
  				userId:i.userId,
  				groupId:i.groupId,
  				starName:i.starName,
  				starLogo:config.qiniu.kp_site + i.starLogo,
  				createDate:i.createDate?dateUtils.formatDate(i.createDate):i.createDate,
  				groupName:i.groupName,
  				cardNumber:i.cardNumber
  			});
  		});
    	res.send(resObj);
    	}
    });
};



/**
 * 首页（明星）粉丝团动态
 * @param {Object} req
 * @param {Object} res
 */
GroupController.fansDynamic = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		groupId:object.groupId,
		userId:object.userId
	};
	if(commonUtil.paramsIsNull(req, res, ['groupId'])){
		//如果有空值则retrun不继续往下执行
		return;
	}
	var resObj = Response();
	resObj.command = command;
	groupService.fansDynamic(params,function(err,fansDynamicInfo){
		async.map(fansDynamicInfo,function(item,callback){
			// 设置粉丝团动态的组织帖子不给予置顶操作
			item.isRecommend = 0;
			// 帖子标题判空处理
			item.topicName = item.topicName ? item.topicName : "";
			// 帖子内容判空处理
			item.topicDesc = item.topicDesc ? item.topicDesc : "";
			// 语音判空处理
			item.audioAddress = item.audioAddress ? config.qiniu.kp_site + item.audioAddress : "";
			// 语音时长处理
			item.audioTime = item.audioTime ? item.audioTime : 0;
			// 图片判空处理
			var imagelist = [];
			if('' == item.topicPics || null == item.topicPics){
				item.topicPics = imagelist;
			} else {
				var imgarry = item.topicPics.split(",");
				for(var i = 0;i<imgarry.length;i++){
					//imagelist.push(config.qiniu.kp_site + imgarry[i]);
					// 判断有无http头
					if(imgarry[i].indexOf("http") > -1){
						imagelist.push(imgarry[i]);
					} else {
						imagelist.push(config.qiniu.kp_site + imgarry[i]);
					}
				}
				item.topicPics = imagelist;
			}
			// 处理图片尺寸
			var picSizelist = [];
			if('' == item.picsSize || null == item.picsSize){
				item.picsSize = picSizelist;
			} else {
				var picSizeArry = item.picsSize.split(",");
				
				for(var j = 0;j<picSizeArry.length;j++){
					picSizelist.push(picSizeArry[j]);
				}
				item.picsSize = picSizelist;			
			}
			// 设置头像
			item.headPortrait = commonUtil.headPortrait(item);
			// 判断定时发布帖子时间(定时时间字段不为空时说明该帖子为定时帖子)
			if(null != item.timedReleaseDate && '' != item.timedReleaseDate){
				item.createDate = item.timedReleaseDate;
			} else {
				item.timedReleaseDate = "";
			}
			// 格式化时间字段(发布时间)
			item.createDate = dateUtils.formatDate(item.createDate);
			// 判断用户类型
			item.userType = item.userType == "org" ? 1: 3;
			async.parallel([
				// 获取用户的评论数
				function(callback0){
					var params1 = {
						topicId:item.topicId
					};
					commentService.getNewPostCommentCountObj(params1,function(err,commentCount){
						callback0(null,commentCount);
					});
				},
				// 判断当前app用户对该条帖子的点赞状态
				function(callback2){
					var params2 = {
						postId:item.topicId,
						userId:params.userId,
						type:0	// 帖子的点赞关系用0标识
					};
					LikeRelationService.getTopicLikeRelation(params2,function(err,islikeRelation){
						callback2(null, islikeRelation);
					});
				}
			],function(err,result){
				// 为组织帖子设置评论数
				item.commentCount = result[0][0].commentCount;
				// 判断当前app用户是否点过赞
				item.likeRelation = result[1] ? result[1].state : 0;
				callback(null,item);
			});
		},function(err,results){
			resObj.object = results;
			res.send(resObj);
		});
	});
};

/**
 * 首页（明星）粉丝团动态->只看我关注的
 * @param {Object} req
 * @param {Object} res
 */
GroupController.ICareAbout = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		userId:object.userId,
		groupId:object.groupId
	};
	var resObj = Response();
	resObj.command = command;
	groupService.iCareAboutOrg(params,function(err, iCareAboutOrg){
		async.map(iCareAboutOrg,function(item,callback){
			// 设置粉丝团动态的组织帖子不给予置顶操作
			item.isRecommend = 0;
			// 帖子标题判空处理
			item.topicName = item.topicName ? item.topicName : "";
			// 帖子内容判空处理
			item.topicDesc = item.topicDesc ? item.topicDesc : "";
			// 语音判空处理
			item.audioAddress = item.audioAddress ? config.qiniu.kp_site + item.audioAddress : "";
			// 语音时长处理
			item.audioTime = item.audioTime ? item.audioTime : 0;
			// 图片判空处理
			var imagelist = [];
			if('' == item.topicPics || null == item.topicPics){
				item.topicPics = imagelist;
			} else {
				var imgarry = item.topicPics.split(",");
				for(var i = 0;i<imgarry.length;i++){
					//imagelist.push(config.qiniu.kp_site + imgarry[i]);
					// 判断有无http头
					if(imgarry[i].indexOf("http") > -1){
					 imagelist.push(imgarry[i]);
					 } else {
					 imagelist.push(config.qiniu.kp_site + imgarry[i]);
					 }
				}
				item.topicPics = imagelist;
			}
			// 处理图片尺寸
			var picSizelist = [];
			if('' == item.picsSize || null == item.picsSize){
				item.picsSize = picSizelist;
			} else {
				var picSizeArry = item.picsSize.split(",");

				for(var j = 0;j<picSizeArry.length;j++){
					picSizelist.push(picSizeArry[j]);
				}
				item.picsSize = picSizelist;
			}
			// 判断定时发布帖子时间(定时时间字段不为空时说明该帖子为定时帖子)
			if(null != item.timedReleaseDate && '' != item.timedReleaseDate){
				item.createDate = item.timedReleaseDate;
			} else {
				item.timedReleaseDate = "";
			}
			// 格式化时间
			item.createDate = dateUtils.formatDate(item.createDate);
			// 判断用户类型
			item.userType = item.userType == "org" ? 1: 3;
			// 并行处理
			async.parallel([
				function(callback0){
					// 获取帖子的评论数
					var params0 = {
						topicId:item.topicId			
					};
					commentService.getNewPostCommentCountObj(params0,function(err,commentCount){
						callback0(null,commentCount);
					});
				},
				function(callback1){
					// 获取组织的头像
					var params1 = {
						userId:item.userId
					};
					var attrs = ['nickName','headPortrait'];
					userService.getUserByParam(params1, attrs, function(err, kpUser){
						callback1(null, kpUser);
					});
				},
				function(callback2){
					var params2 = {
						postId:item.topicId,
						userId:params.userId,		// 当前登陆用户
						type:0	// 帖子的点赞关系用0标识
					};
					LikeRelationService.getTopicLikeRelation(params2,function(err,islikeRelation){
						callback2(null, islikeRelation);
					});
				}
			],function(err,result){
				item.commentCount = result[0][0].commentCount;
				// 处理组织头像
				item.headPortrait = commonUtil.headPortrait(result[1]);
				// 处理组织的昵称
				item.nickName = result[1].nickName;
				// 判断当前app用户是否点过赞
				item.likeRelation = result[2] ? result[2].state : 0;
				callback(null, item);
			});
		},function(err,results){
			resObj.object = results;
			res.send(resObj);
		});
	});
};

module.exports = GroupController;