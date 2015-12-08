"use strict";
/**
 * Created by admin on 2015/8/19.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var Constants = require('../utils/constants');
var config = require('../config/config');
var messageService = require('../services/messageService');
var userService = require('../services/UserService');
var messagePushService = require('../services/MessagePushService');
var groupService = require('../services/groupService');
var commonUtil = require('../utils/commonUtil');
/**
 * by Star / admin
 * 推送列表
 */
router.get('/push', function(req, res){
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;

	var params = {
		ConditionId:object.conditionid,
		ConditionText:object.conditionText ? object.conditionText.trim() : object.conditionText,
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order: 'create_date desc'	// 默认排序
	};

	if(object.order === "timeasc"){
		params.order = "create_date asc";
	}
	if(object.order === "timedesc"){
		params.order = "create_date desc";
	}
	// 获取推送列表
	messageService.getAdminPushList(params,function(err, pushList){
		if(err){
			res.render('error',{message:err.message});
		} else {
			async.map(pushList.rows, function(item, callback){
				item.createDate = dateUtils.formatDate(item.createDate);
				// 判断四种类型设置昵称
				if(item.pushGoal == "all"){				// 全体
					var params0 = {
						userId: item.reciveUserId,
						attributes:['nickName']
					};
					userService.getUserInfo(params0, function(err, user){
						item.nickName = user.nickName;
						callback(null, item);
					});
				} else if(item.pushGoal == "fans"){		// 粉丝团
					// 获取粉丝团名称
					var params1 = {
						groupId: item.reciveUserId,
						groupState:1,
						attributes:['starName','groupName']
					};
					groupService.getGroupByParams(params1, function(err, group){
						item.nickName = group.starName;
						callback(null, item);
					});
				} else if(item.pushGoal == "org"){		// 组织
					var params2 = {
						userId: item.reciveUserId,
						attributes:['nickName']
					};
					userService.getUserInfo(params2, function(err, orguser){
						item.nickName = orguser.nickName;
						callback(null, item);
					});
				} else {								// 个人
					var params3 = {
						userId: item.reciveUserId,
						attributes:['nickName']
					};
					userService.getUserInfo(params3, function(err, user){
						if(user){
							item.nickName = user.nickName;
						} else {
							item.nickName = "多个用户";
						}
						callback(null, item);
					});
				}
			}, function(err, results){
				res.render('admin/push_list',{
					messageList:pushList.rows, currentPage:pageIndex, totalCount:pushList.count
				});
			});
		}
	});
});

/**
 * by Star / admin
 * 推送给全体页面
 */
router.get('/pushAll-add-ui', function(req, res){
	res.render('admin/pushall_add');
});

/**
 * by Star / admin
 * 推送给全体
 */
router.post('/pushAllAdd', function(req, res){
	var object = req.body;
	// 获取session里面的用户信息
	var localUserId = req.session.sessionUser.userId;
	var params = {
		messageText:object.pushContent,
		sendUserId:Constants.OFFICIAL_USER,		// 发起推送人
		reciveUserId:Constants.PUSH_USER,		// 接收推送人(默认一个用户)
		pushGoal:"all",				// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
		chatType:1,					// 官方推送
		officalType:3,				// 个人消息
		releaseDate:object.releaseDate ? object.releaseDate : new Date()
	};
	async.parallel([
		// 1、推送内容入库。
		function(callback0){
			messageService.createMessage(params, function(message){
				callback0(null, message);
			});
		},
		// 2、执行推送
		function(callback1){
			// 判断是否为定时推送
			var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
			var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
			var pushTime = '';
			if(null != object.releaseDate && '' != object.releaseDate){
				// 进行格式转换
				var momenttime = moment(object.releaseDate,DISPLAY_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
				pushTime = momenttime+"Z";
				console.log(" [pushTime]>>>> :" + pushTime);
			}
			// 条件
			var params1 = {
				userId:Constants.OFFICIAL_USER
			};
			// 所需参数
			var attrs = ['userId','nickName','headPortrait'];
			userService.getUserByParam(params1, attrs, function(err, kpUser){
				var params2 = {
					channels:'app',
					pushTime:pushTime==''?'':pushTime,
					prod:'dev',
					data:{
						userId:kpUser.userId,			//  发起推送人
						headPortrait:config.qiniu.kp_site + kpUser.headPortrait, 
						action:'app',
						chatContent:kpUser.nickName+": "+params.messageText, 
						officalType:3,					// 官方推送类型（0：帖子，1：活动，2：资讯, 3:个人 / 组织 / 粉丝团 / 全体）
						chatType:1,						// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
						postId:"",						// 帖子ID
						nickName:kpUser.nickName,		// 发起人的用户昵称
					    replayNickName:"",				// 接收方昵称
					    replay:false	
					}
				};
				messagePushService.sendMessage(params2);
				callback1(null, kpUser);
			});
		}
	],function(err, results){
		res.redirect("/admin/push");
	});
});

/**
 * by Star / admin
 * 推送给粉丝团页面
 */
router.get('/pushfansGroup-add-ui', function(req, res){
	// 查询出所有的粉丝团
	var params = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	};
	groupService.getGroupListAll(params, function(err, groupList){
		console.log(' groupList = ' + groupList);
		res.render('admin/pushfansGroup_add',{
			groupList:groupList
		});
	});
});

/**
 * by Star / admin
 * 推送给粉丝团
 */
router.post('/pushfansGroupAdd', function(req, res){
	var object = req.body;
	// 获取session里面的用户信息
	var localUserId = req.session.sessionUser.userId;
	var params = {
		messageText:object.pushContent,
		sendUserId:Constants.OFFICIAL_USER,			// 发起推送人
		reciveUserId:object.groupId,	// 接收推送人[集体]
		pushGoal:"fans",				// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
		chatType:1,						// 官方推送
		officalType:3,					// 个人消息
		releaseDate:object.releaseDate ? object.releaseDate : new Date()
	};
	// 并行执行 Start 
	async.parallel([
		// 1、推送内容入库。
		function(callback0){
			messageService.createMessage(params, function(message){
				callback0(null, message);
			});
		},
		// 2、执行推送
		function(callback1){
			// 判断是否为定时推送
			var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
			var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
			var pushTime = '';
			if(null != object.releaseDate && '' != object.releaseDate){
				// 进行格式转换
				var momenttime = moment(object.releaseDate,DISPLAY_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
				pushTime = momenttime+"Z";
				console.log(" [pushTime]>>>> = " + pushTime);
			}
			// 条件
			var params1 = {
				userId:Constants.OFFICIAL_USER			// 官方用户
			};
			// 所需参数
			var attrs = ['userId','nickName','headPortrait'];
			userService.getUserByParam(params1, attrs, function(err, kpUser){
				var params2 = {
					channels:object.groupId,
					userId:Constants.PUSH_USER,			//  接收推送人(库里固定用户)
					pushTime:pushTime == ''?'':pushTime,
					prod:'dev',
					goal:'collective',	// 集体目标
					data:{
						userId:kpUser.userId,			//  发起推送人
						headPortrait:config.qiniu.kp_site + kpUser.headPortrait, 
						action:'app',
						chatContent:kpUser.nickName+": "+params.messageText, 
						officalType:3,					// 官方推送类型（0：帖子，1：活动，2：资讯, 3:个人 / 组织 / 粉丝团 / 全体）
						chatType:1,						// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
						postId:"",						// 帖子ID
						nickName:kpUser.nickName,		// 发起人的用户昵称
					    replayNickName:"",				// 接收方昵称
					    replay:false	
					}
				};
				messagePushService.sendMessage(params2);
				callback1(null, kpUser);
			});
		}
	],function(err, results){
		res.redirect("/admin/push");
	});
});

/**
 * by Star / admin
 * 推送给组织页面
 */
router.get('/pushOrg-add-ui', function(req, res){
	// 查询出所有的粉丝团
	var params = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	}
	userService.getActivateOrgList(params, function(err, orgList){
		res.render('admin/pushOrg_add',{
			orgList:orgList
		});
	});
});


/**
 * by Star / admin
 * 推送给组织
 */
router.post('/pushOrgAdd', function(req, res){
	var object = req.body;
	// 获取session里面的用户信息
	var localUserId = req.session.sessionUser.userId;
	var params = {
		messageText:object.pushContent,
		sendUserId:Constants.OFFICIAL_USER,		// 发起推送人
		reciveUserId:object.orgId,	// 接收推送人
		pushGoal:"org",				// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
		chatType:1,					// 官方推送
		officalType:3,				// 个人消息
		releaseDate:object.releaseDate ? object.releaseDate : new Date()
	};
	// 并行执行 Start 
	async.parallel([
		// 1、推送内容入库。
		function(callback0){
			messageService.createMessage(params, function(message){
				callback0(null, message);
			});
		},
		// 2、执行推送
		function(callback1){
			// 判断是否为定时推送
			var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
			var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
			var pushTime = '';
			if(null != object.releaseDate && '' != object.releaseDate){
				// 进行格式转换
				var momenttime = moment(object.releaseDate,DISPLAY_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
				pushTime = momenttime+"Z";
				console.log(" [pushTime]>>>> = " + pushTime);
			}
			// 条件
			var params1 = {
				userId:Constants.OFFICIAL_USER			// 官方用户
			};
			// 所需参数
			var attrs = ['userId','nickName','headPortrait'];
			userService.getUserByParam(params1, attrs, function(err, kpUser){
				var params2 = {
					channels:object.orgId,
					userId:object.orgId,			//  接收推送人(组织)
					pushTime:pushTime == ''?'':pushTime,
					prod:'dev',
					goal:'collective',	// 集体目标
					data:{
						userId:kpUser.userId,			//  发起推送人
						headPortrait:config.qiniu.kp_site + kpUser.headPortrait, 
						action:'app',
						chatContent:kpUser.nickName+": "+params.messageText, 
						officalType:3,					// 官方推送类型（0：帖子，1：活动，2：资讯, 3:个人 / 组织 / 粉丝团 / 全体）
						chatType:1,						// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
						postId:"",						// 帖子ID
						nickName:kpUser.nickName,		// 发起人的用户昵称
					    replayNickName:"",				// 接收方昵称
					    replay:false	
					}
				};
				messagePushService.sendMessage(params2);
				callback1(null, kpUser);
			});
		}
	],function(err, results){
		res.redirect("/admin/push");
	});
});

/**
 * by Star / admin
 * 推送给个人页面
 */
router.get('/pushOne-add-ui', function(req, res){
	res.render('admin/pushOne_add');
});

/**
 * by Star / admin
 * 推送给个人
 */
router.post('/pushOneAdd', function(req, res){
	var object = req.body;
	// 获取的session中的用户
	var localUserId = req.session.sessionUser.userId;
	var params = {
		phone:object.phone
	};
	// 根据手机号码查询出所有的用户ID
	userService.getUserByPhones(params, function(err, userIdList){
		// 向单个用户推送的时候记录接收推送人
		if(userIdList.length == 1){
			var params1 = {
				messageText:object.pushContent,
				sendUserId:Constants.OFFICIAL_USER,				// 发起推送人
				reciveUserId:userIdList[0].userId,	// 接收推送人
				pushGoal:"user",					// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
				chatType:1,							// 官方推送
				officalType:3,						// 个人消息
				releaseDate:object.releaseDate ? object.releaseDate : new Date()
			};
			messageService.createMessage(params1, function(message){});
		} else {
			// 向多个人用户推送的时候记录多个接收推送人
			for(var i = 0; i< userIdList.length; i++){
				var paramss = {
					messageText:object.pushContent,
					sendUserId:Constants.OFFICIAL_USER,		// 发起推送人
					reciveUserId:userIdList[i].userId,		// 接收推送人
					pushGoal:"user",			// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
					chatType:1,					// 官方推送
					officalType:3,				// 个人消息
					releaseDate:object.releaseDate ? object.releaseDate : new Date()
				};
				messageService.createMessage(paramss, function(message){});
			}
		}
		// 循环每个用户
		async.map(userIdList,function(item, callback){
			// 执行推送
			// 判断是否为定时推送
			var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
			var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
			var pushTime = '';
			if(null != object.releaseDate && '' != object.releaseDate){
				// 进行格式转换
				var momenttime = moment(object.releaseDate,DISPLAY_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
				pushTime = momenttime+"Z";
			}
			// 条件
			var params1 = {
				userId:Constants.OFFICIAL_USER			// 官方用户  默认ID为:999999
			};
			// 所需参数
			var attrs = ['userId','nickName','headPortrait'];
			userService.getUserByParam(params1, attrs, function(err, kpUser){
				var params2 = {
					userId:item.userId,
					pushTime:pushTime == ''?'':pushTime,
					prod:'dev',
					data:{
						userId:kpUser.userId,			//  发起推送人
						headPortrait:config.qiniu.kp_site + kpUser.headPortrait, 
						action:'app',
						chatContent:kpUser.nickName+": " + object.pushContent,
						officalType:3,					// 官方推送类型（0：帖子，1：活动，2：资讯, 3:个人 / 组织 / 粉丝团 / 全体）
						chatType:1,						// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
						postId:"",						// 帖子ID
						nickName:kpUser.nickName,		// 发起人的用户昵称
					    replayNickName:"",				// 接收方昵称
					    replay:false	
					}
				};
				messagePushService.sendMessage(params2);
			});
			callback(null, item);
		},function(err, results){
			res.redirect("/admin/push");
		});
	});
});

/**
 * by Star / admin
 * 删除推送消息
 */
router.get('/pushDel', function(req, res){
	var object = req.query;
	console.log('messageId = ' + object.MessageId);
	var params = {
		messageId:object.MessageId
	};
	// 执行删除	
	messageService.adminDelPush(params,function(obj){
		console.log('del result : ' + JSON.stringify(obj));
		res.redirect("/admin/push");
	});
});


/**
 * by Star / admin
 * 常见问题列表
 */
router.get('/commonQuestion', function(req, res){
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;
	var params = {
		ConditionId:object.conditionid,
		ConditionText:object.conditionText,
		type:'c',
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order: 'create_date desc'	// 默认排序
	};
	if(object.order === "timeasc"){
		params.order = "create_date asc";
	}
	if(object.order === "timedesc"){
		params.order = "create_date desc";
	}
	// 获取常见问题列表
	messageService.getCommonQuestionList(params,function(err, commonQuestionList){
		if(err){
			res.render('error',{message:err.message});
		} else {
			res.render('admin/commonQuestion_list',{
				commonQuestionList:commonQuestionList.rows,currentPage:pageIndex, totalCount:commonQuestionList.count
			});
		}
	});
});

/**
 * by Star / admin
 * 跳转常见问题新增页面
 */
router.get('/commonQuestion-add-ui', function(req, res){
	res.render('admin/commonQuestion_add');
});

/**
 * by Star / admin
 * 新增常见问题
 */
router.post('/commonQuestionAdd', function(req, res){
	var object = req.body;
	var params = {
		content:object.question,
		type:'c'
	};
	// 新增常见问题
	messageService.adminAddQuestion(params,function(err, obj){
		// 条件
		var params1 = {
			content:obj.content,
			createDate:obj.createDate
		};
		// 获取字段
		var attrs = ['secretaryId'];
		messageService.getQuestionByParam(params1,attrs,function(err,secretary){
			console.log('secretaryId = ' + secretary.secretaryId );
			var params2 = {
				content:object.answer,
				type:'a',
				answerFor:secretary.secretaryId
			};
			// 回答新增问题
			messageService.adminAddQuestion(params2,function(err, obj){
				res.redirect('/admin/commonQuestion');
			});
		});
	});
});

/**
 * by Star / admin
 * 编辑常见问题
 */
router.get('/commonQuestion-edit-ui', function(req, res){
	var object = req.query;
	var params = {
		secretaryId:object.secretaryId
	};
	messageService.commonQuestionById(params, function(err, obj){
		res.render('admin/commonQuestion_edit',{
			commonQuestion:obj[0]
		});
	});
});


/**
 * by Star / admin
 * 修改常见问题
 */
router.post('/commonQuestionEdit', function(req, res){
	var object = req.body;
	// 并行执行
	async.parallel([
		// 修改问题
		function(callback0){
			// 修改问题的内容
			var value0 = {
				content:object.question.trim()		// 去掉空格
			};
			// 修改问题的条件
			var params0 = {
				secretaryId:object.secretaryId
			};
			messageService.adminEditQuestion(value0,params0,function(err, obj0){
				callback0(null,obj0);
			});
		},
		// 修改答案
		function(callback1){
			// 修改答案的内容
			var value1 = {
				content:object.answer.trim()		// 去掉空格
			};
			// 修改答案的条件
			var params1 = {
				secretaryId:object.answerId
			};
			messageService.adminEditQuestion(value1,params1,function(err, obj1){
				callback1(null,obj1);
			});
		}
	],function(err, results){
		if(!err){
			res.redirect('/admin/commonQuestion');
		} else {
			res.render('error',{message:err.message});
		}
	});
});

/**
 * by Star / admin
 * 删除常见问题
 */
router.get('/commonQuestionDel', function(req, res){
	var object = req.query;
	var params = {
		secretaryId:object.secretaryId,
		answerFor:object.secretaryId
	};
	// 执行删除	
	messageService.adminDelCommonQuestion(params,function(err, obj){
		console.log('del result : ' + JSON.stringify(obj));
		if(object.flag == 1){//表示重定向至提问列表
			res.redirect("/admin/userQuestion");
		}else{
			res.redirect("/admin/commonQuestion");
		}
	});
});


/**
 * by Star / admin
 * 我的提问列表
 */
router.get('/userQuestion', function(req, res){
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;
	var params = {
		ConditionText:object.conditionText,		// 问题搜索框
		isAnswer: object.isAnswer,				// 状态查询
		type:'q',	// 问题
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order: 'create_date desc'	// 默认排序
	};
	if(object.order === "timeasc"){
		params.order = "create_date asc";
	}
	if(object.order === "timedesc"){
		params.order = "create_date desc";
	}
	
	// 获取提问列表总数
	var totalCount = 0;
	messageService.userQuestionCount(params,function(err, count){
		//console.log(' >>>>>totalCount = ' + count[0].totalCount);
		totalCount = count[0].totalCount;
		if(count[0].totalCount != 0){
			// 获取提问列表集合
			messageService.userQuestionRows(params,function(err, rows){
				// 循环处理每条数据
				async.map(rows,function(item, callback){
					// 设置输出时间格式
					item.createDate = dateUtils.formatDate(item.createDate);
					item.headPortrait = commonUtil.headPortrait({headPortrait:item.headPortrait});
					var params1 = {
						userId:item.userId,
						type:'q'	// 只查询问题
					};
					// 得到这个用户的最近的一条提问
					messageService.findOneQuestion(params1, function(err, oneRow){
						item.content = oneRow[0].content;
						// 设置最近一条的时间格式
						item.createDate = dateUtils.formatDate(oneRow[0].createDate);
						// 设置最后一条问题的ID
						item.secretaryId = oneRow[0].secretaryId;
						callback(null, item);
					});
				},function(err, results){
					res.render('admin/userQuestion_list',{
						userQuestionList:results,currentPage:pageIndex, totalCount:totalCount, params:params
					});
				});
			});
		} else {
			res.render('admin/userQuestion_list',{
				userQuestionList:[{}],currentPage:pageIndex, totalCount:0, params:params
			});
		}
	});
});


/**
 * by Star / admin
 * 问题的详情
 */
router.get('/userQuestionDetail', function(req, res){
	var object = req.query;
	// 条件
	var params = {
		userId:object.userId
	};
	// 需获取参数
	var attrs = ['userId','nickName','userName'];
	async.parallel([
		// 获取用户的基本信息
		function(callback1){
			// 获取用户的基本信息
			userService.getUserByParam(params,attrs,function(err, kpUser){
				callback1(null, kpUser);
			});
		},
		// 获取问题和回答 数据
		function(callback2){
			// 获取问题和回答 数据
			messageService.userQuestionAndAnswer(params,function(err, Secretary){
				async.map(Secretary, function(item, callback){
					// 格式化时间
					item.createDate = dateUtils.formatDate(item.createDate);
					callback(null, item);
				},function(err, results1){
					callback2(null, results1);
				});
			});
		}
	],function(err, results){
		res.render('admin/userQuestion_edit',{
			userInfo:results[0], questionList:results[1],SecretaryId:object.secretaryId
		});
	});
});


/**
 * by Star / admin
 * 回答用户的提问
 */
router.post('/answerForQuestion', function(req, res){
	var object = req.body;
	// 获取session中的用户
	var locUserId = req.session.sessionUser.userId;
	var params = {
		userId:object.userId,
		answerUserId:locUserId,
		answerFor:object.answerFor,
		content:object.content,
		type:'a'		// 回答类型
	};

	// 回答提问
	messageService.adminAddQuestion(params, function(err, obj){
		if(!err){
			async.parallel([
				// 修改状态
				function(callback){
					// 需要修改的值
					var setValue = {
						state:1
					};
					// 修改问题状态的条件
					var params2 = {
						userId:object.userId,
						state:0
					};
					// 修改问题的状态
					messageService.adminEditQuestion(setValue, params2, function(err, obj){
						console.log('obj = ' + obj);
						callback(null, obj);
					});
				},
				// 推送
				function(callback){
					// 根据session用户ID查询该用户的基本信息
					var params1 = {
						userId:locUserId
					};
					// 所需字段
					var attrs = ['userId','nickName','headPortrait'];
					// 获取该用户的基本信息
					userService.getUserByParam(params1,attrs,function(err, kpUser){
						// 执行推送
						var params2 = {
							userId:object.userId,				//  接收推送人
							prod:'dev',
							data:{
								userId:kpUser.userId,			//  发起推送人
								headPortrait:config.qiniu.kp_site + kpUser.headPortrait,	//  发起推送人头像
								action:'app',
								chatContent:'咖派官方'+": "+'回答了你的提问:' + params.content,	// 发起推送人昵称及推送内容
								officalType:0,	// 官方推送类型（0：帖子，1：活动，2：资讯）
								chatType:0,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
								postId:"",						// 帖子ID
								nickName:kpUser.nickName,		// 发起人的用户昵称
							    replayNickName:"",				// 接收方昵称
							    replay:false	
							}
						};
						// 调用推送方法
						messagePushService.sendMessage(params2);
						callback(null, kpUser);
					});
				}
			],function(err, results){
				res.redirect('/admin/userQuestion');
			});
		} else {
			console.log('回答问题时出错了!');
		}
	});
});

module.exports = router;
