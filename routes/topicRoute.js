"use strict";
/**
 * Created by admin on 2015/8/19.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var topicService = require('../services/TopicService');
var topicPostService = require('../services/topicPostService');
var channelService = require('../services/ChannelService');
var groupService = require('../services/groupService');
var userService = require('../services/UserService');
var commentService = require('../services/CommentService');
var messagePushService = require('../services/MessagePushService.js');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var Constants = require('../utils/constants');
var config = require('../config/config');
var commonUtil = require('../utils/commonUtil');
var messageService = require('../services/messageService');
var beanRelationService = require('../services/BeanRelationService.js');
var videoService = require('../services/VideoService.js');

/**
 * by hp/admin
 * 频道列表
 */
router.get('/topic',function(req, res){
	var object = req.query;
	//搜索条件
	var params = {
		condition:{},
		topicState:object.topicState,
		isRecommend:object.isRecommend,
		pageIndex : req.query.pageIndex? req.query.pageIndex: 1,
		pageSize : req.query.pageSize,
		attrs: ['topicId','topicNumber','topicName','topicScope','topicDesc','createDate','updateDate','topicState','isRecommend'],
		topicTypes: [0, 1]//频道类型
	};
	if (object.choose) params.condition[object.choose] = object.keyword;
	if(object.order === "createDesc") params.order = "topic.create_date desc";
	if(object.order === "createAsc") params.order = "topic.create_date asc";
	if(object.order === "updateDesc") params.order = "topic.update_date desc";
	if(object.order === "updateAsc") params.order = "topic.update_date asc";
	topicService.getTopicList(params, function(err, objList){
		async.map(objList.rows, function(item, callback){
			channelService.getChannelsPostCount({pTopicId: item.getDataValue("topicId"), topicState: 1}, function(err, count){
				item.degreeOfHeat = count;
				item.setDataValue("createDate", dateUtils.formatDate(item.getDataValue("createDate")));
				item.setDataValue("updateDate", dateUtils.formatDate(item.getDataValue("updateDate")));
				callback(null, item);
			});
		}, function(err, results){
			res.render('admin/topic_list', {
				objList: results, 
				currentPage: params.pageIndex, 
				totalCount: objList.count,
				choose:object.choose,
				keyword:object.keyword,
				order:object.order,
				topicState:object.topicState,
				isRecommend:object.isRecommend
			});
		});
	});
});
/**
 * by hp/admin
 * 频道下帖子列表
 */
router.get('/topic/:topicId/post',function(req, res){
	var object = req.query;
	var params = {
		condition:{
			parentTopicId: req.params.topicId,
			topicState: object.topicState
		},
		pageIndex : req.query.pageIndex? req.query.pageIndex: 1,
		pageSize : req.query.pageSize,
		attrs: ['topicId','topicNumber','topicScope','topicDesc','createDate','updateDate','topicState']
	};
	if (object.topicDesc) params.condition.topicDesc = object.topicDesc;
	if(object.order === "createDesc") params.order = "topic.create_date desc";
	if(object.order === "createAsc") params.order = "topic.create_date asc";
	if(object.order === "updateDesc") params.order = "topic.update_date desc";
	if(object.order === "updateAsc") params.order = "topic.update_date asc";
	topicService.getTopicPostList(params, function(err, objList){
		async.map(objList.rows, function(item, callback){
			channelService.getChannelsPostCount({pTopicId: item.getDataValue("topicId"), topicState: 1}, function(err, count){
				item.degreeOfHeat = count;
				item.setDataValue("createDate", dateUtils.formatDate(item.getDataValue("createDate")));
				item.setDataValue("updateDate", dateUtils.formatDate(item.getDataValue("updateDate")));
				callback(null, item);
			});
		}, function(err, results){
			res.render('admin/topic_post_list', {
				objList: results, 
				currentPage: params.pageIndex, 
				totalCount: objList.count,
				choose:object.choose,
				keyword:object.keyword,
				order:object.order,
				topicState:object.topicState,
				isRecommend:object.isRecommend,
				pTopicId: req.params.topicId,
				groupId: req.query.groupId
			});
		});
	});
});
/**
 * by hp/admin
 * 添加频道下帖子UI
 */
router.get('/topic-post-add-ui', function(req, res) {
	async.parallel([
		function(callback){
			var topicParams = {
				condition: {
					topicId: req.query.pTopicId
				},
				attr: ['topicId', 'topicName', 'topicDesc', 'topicScope']
			};
			topicPostService.getTopicByParam(topicParams, function(err, obj){
				callback(err, obj);
			});
		},
		function(callback){
			var userParam = {
				userType: "user",
				userId: "11111111111111",
				attrs: ['userId', 'nickName', 'userName'],
				pageIndex: 0,
				pageSize: 100
			};
			userService.getUserList(userParam, function(err, list){
				callback(err, list);
			});
		}
	], function(err, result){
		if(err){
			res.render('error', {message: err});
		} else {
			res.render('admin/topic_post_add',{
				status:true, 
				pTopic: result[0], 
				userList: result[1],
				groupId: req.query.groupId,
				qntoken: qiniutoken
			});
		}
	});
});
/**
 * by hp/admin
 * 新增频道下帖子
 */
router.post("/topic/post",function(req,res){
	var object = req.body;
	var group = {
		parentTopicId: object.parentTopicId,
		topicScope:object.topicScope,
		topicPics: object.starLogo ? object.starLogo.toString(): '',
		groupId:object.groupId,
		userId: object.userId,
		topicDesc:object.topicDesc,
		topicState: object.topicState,
		topicType: 2,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	};
	//topicId存在则为修改，不存在未添加
	if (object.topicId){
		topicService.updateTopic(object.groupId, group, function(err, obj){
			if(err){
				res.render('admin/group_update', {status: false});
			} else{
				res.redirect('/admin/topic/'+object.parentTopicId+'/post');//跳转到列表
			}
		});
	} else {
		//上传了图片获取尺寸
		if (object.starLogo) {
			var picsStr = group.topicPics.split(",");
			topicService.topicSize(picsStr, function(err, list) {
				group.picsSize = list;
				topicService.addTopic(group, function(err, obj){
					if(err){
						res.render('admin/topic_add', {status: false});
					} else{
						res.redirect('/admin/topic/'+object.parentTopicId+'/post');//跳转到列表
					}
				});
			});
		} else {
			topicService.addTopic(group, function(err, obj){
				if(err){
					res.render('admin/topic_add', {status: false});
				} else{
					res.redirect('/admin/topic/'+object.parentTopicId+'/post');//跳转到列表
				}
			});
		};
	}
});
/**
 * by Star / admin
 * 用户帖子列表
 */
router.get('/userPost', function(req, res){
	var object = req.query;
	var params = {
		Object:object,					// 条件参数
		topicState:Constants.STATE.ACTIVE,
		topicType:Constants.POST.CHANNEL,
		pageIndex : req.query.pageIndex? req.query.pageIndex: 1,
		pageSize : req.query.pageSize ? req.query.pageSize: 10
	};
	var postCount = 0;
	// 获取帖子总数
	topicPostService.getAdminUserPostCount(params, function(err, totalCount){
		if(totalCount[0].postCount != 0){
			postCount = totalCount[0].postCount;
			// 获取帖子列表
			topicPostService.getAdminUserPost(params,function(err, userpostList){
				async.map(userpostList,function(item,callback){
					// 格式化帖子时间
					item.createDate = dateUtils.formatDate(item.createDate);
					// 获取帖子的评论数
					async.parallel([
						function(callback0){
							// 获取评论数
							var params0 = {
								topicId:item.topicId,
								commentState:1
							};
							commentService.getNewPostCommentCountObj(params0,function(err,commentCount){
								callback0(null, commentCount);
							});
						}
					],function (err, result) {
						// 给item对象设置评论数
						item.commentCount = result[0][0].commentCount;
						callback(null,item);
					});
				},function(err,results){
					res.render('admin/userPost_list',{
						userPostList:results, currentPage:params.pageIndex, totalCount:postCount, params:params.Object
					});
				});
			});
		} else {
			res.render('admin/userPost_list',{
				userPostList:[], currentPage:params.pageIndex, totalCount:postCount, params:params.Object
			});
		}
	});
});

/**
 * by Star / admin 
 * 组织帖子列表
 */
router.get('/orgPost', function(req, res){
	var object = req.query;
	var params = {
		Object:object,						 // 条件参数
		topicType:Constants.POST.ORGANIZE,   // 组织帖子常量标识[3]
		pageIndex : req.query.pageIndex? req.query.pageIndex: 1,
		pageSize : req.query.pageSize? req.query.pageSize: 10
	};
	var postCount = 0;
	// 获取帖子总数
	topicPostService.getAdminOrgPostCount(params, function(err, totalCount){
		if(totalCount[0].postCount != 0){
			postCount = totalCount[0].postCount;
			// 获取帖子列表
			topicPostService.getAdminOrgPost(params,function(err, orgpostList){
				async.map(orgpostList,function(item,callback){
					// 格式化帖子时间
					item.createDate = dateUtils.formatDate(item.createDate);
					// 获取帖子的评论数
					async.parallel([
						function(callback0){
							// 获取评论数
							var params0 = {
								topicId:item.topicId,
								commentState:1
							};
							commentService.getNewPostCommentCountObj(params0,function(err,commentCount){
								callback0(null, commentCount);
							});
						}
					],function (err, result) {
						// 给item对象设置评论数
						item.commentCount = result[0][0].commentCount;
						callback(null,item);
					});
				},function(err,results){
					res.render('admin/orgPost_list',{
						orgPostList:results, currentPage:params.pageIndex, totalCount:postCount,params:params.Object
					});
				});
			});
		}else{
			res.render('admin/orgPost_list',{
				orgPostList:[], currentPage:params.pageIndex, totalCount:postCount,params:params.Object
			});
		}
	});
});

/**
 * by Star / admin
 * 查看(用户 、组织)帖子详情
 */
router.get('/userPost/postDetails',function(req, res){
	// 用来标识普通用户 或 组织用户帖子
	var userType = req.query.userType;
	var params = {
		topicId:req.query.topicId
	};
	// 获取帖子基本信息
	topicPostService.getTopicById(params,function(err, topic){
		var imagelist = [];
		// 用户帖子
		if(userType == 'user'){
			var picture = [];
			// 图片 和 动图同时分割处理
			if(topic.topicScope == 1 || topic.topicScope == 3){
				if(null == topic.topicPics){
					picture = imagelist;
				} else {
					var imgarry = topic.topicPics.split(",");
					for(var i = 0;i<imgarry.length;i++){
						imagelist.push(imgarry[i]);
					}
					picture = imagelist;
				}
			} else {
				// 文字 和 语音无需处理
			}
			res.render('admin/userPostDetails',{
				userPost:topic,imglist:picture
			});
		} else {
			// 组织帖子
			if(null == topic.topicPics){
				picture = imagelist;
			} else {
				var imgarry = topic.topicPics.split(",");
				for(var i = 0;i<imgarry.length;i++){
					imagelist.push(imgarry[i]);
				}
				picture = imagelist;
			}
			res.render('admin/orgPostDetails',{
				orgPost:topic,imglist:picture
			});
		}
	});
});

/**
 * by Star / admin
 * 组织帖子推送
 */
router.get('/orgPostMessage', function(req, res){
	var object = req.query;
	var userId = req.session.sessionUser.userId;
	var headPortrait = req.session.sessionUser.headPortrait;
	var nickName = req.session.sessionUser.nickName;
	var params = {
		userId:userId,				// 接收推送人
		channels:userId,			// 接收推送人
		data:{
			userId:userId,			// 发起推送人
			headPortrait:headPortrait?config.qiniu.kp_site+headPortrait:config.qiniu.kp_site+config.qiniu.defaul_user_head,
			chatType:0,
			action:'app',
			postId:object.postId,
			nickName:nickName,
			replayNickName:'',
			replay:false,
			chatContent:nickName + ': 给你推送了消息: '+object.chatContent
		}
	};
	// 调用推送方法
	messagePushService.sendMessage(params);
	res.redirect("/admin/orgPost");			// 组织帖子列表
});


/**
 * by Star / admin
 * 删除 / 恢复(用户、组织)帖子
 */
router.get('/userPostUpdate' ,function(req, res){
	var params = {};
	var action = req.query.action;
	var userType = req.query.userType;
	console.log('userType = ' + userType);
	if (action == "recover"){
		params = {topicState: 1}
	} else if (action == "del"){
		params = {topicState: -1}
	}
	topicService.updateTopic({topicId:req.query.topicId}, params, function(err, objList){
		// 指向不同的页面
		if(userType == 'user'){
			res.redirect("/admin/userPost");		// 用户帖子列表
		} else {
			res.redirect("/admin/orgPost");			// 组织帖子列表
		}
	});
});

/**
 * by Star / admin
 * 帖子评论
 */
router.get('/postComment', function(req, res){
	var object = req.query;
	var params = {
		Object:object,						 // 条件参数
		pageIndex : req.query.pageIndex? req.query.pageIndex: 1,
		pageSize : req.query.pageSize? req.query.pageSize:10
	};
	var commentCount = 0;
	// 评论总数
	commentService.getAdminPostCommentCount(params,function(err, totalCount){
		commentCount = totalCount[0].totalCount;
	});
	
	// 评论列表
	commentService.getAdminPostComment(params,function(err,postComment){
		console.log(' postComment size = ' + postComment.length);
		async.map(postComment,function(item, callback){
			// 格式化帖子时间
			item.createDate = dateUtils.formatDate(item.createDate);
			callback(null, item);
		},function(err, results){
			res.render('admin/postComment',{
				postCommentList:postComment, currentPage:params.pageIndex, totalCount:commentCount,params:params.Object
			});
		});
	});
});

/**
 * by Star / admin
 * 删除用户评论
 */
router.get('/postCountUpdate', function(req, res){
	var commentId = req.query.commentId;
	// 条件
	var params = {
		commentId:req.query.commentId
	};
	// 变更参数
	var setValue = {
		commentState:Constants.STATE.FROZEN
	};
	commentService.updatePostComment(setValue, params, function(err, obj){
		res.redirect("/admin/postComment");
	});
});

/**
 * by hp/admin
 * 添加频道UI
 */
router.get('/topic-add-ui', function(req, res) {
	var params = {
		attributes:['groupId', 'starName'],
		condition: {groupState: 1}
	};
	async.parallel([
		function(callback){
			groupService.getGroupListAll(params, function(err, list){
				callback(err, list);
			});
		},
		function(callback){
			var userParam = {
				userType: "org",
				attrs: ['userId', 'nickName', 'userName'],
				pageSize: 100
			};
			userService.getOrgList(userParam, function(err, list){
				callback(err, list);
			});
		}
	], function(err, result){
		if(err){
			res.render('error', {message: err});
		} else {
			res.render('admin/topic_add',{status:true, groupList: result[0], orgList: result[1].rows});
		}
	});
});

/**
 * by hp/admin
 * 添加组织帖子UI
 */
router.get('/org-topic-add-ui', function(req, res) {
	res.render('admin/org_topic_add',{status:true, orgId: req.query.orgId, qntoken: qiniutoken});
});
/**
 * by hp
 * 新增或修改组织帖子，在kpUserRoute中有相同的get方式路由
 */
router.post('/org/:orgId/topic', function(req, res) {
	var object = req.body;
	var stateFlag = object.stateFlag;
	var obj = {
		userId: object.orgId,
		topicName: object.topicName,
		audioAddress: object.starBG,
		audioTime: req.body.audioTime ? req.body.audioTime : null,
		topicPics: object.starLogo ? object.starLogo.toString() : '',
		topicDesc: object.topicDesc,
		isRecommend: object.isRecommend ? 1 : 0,
		topicState: object.state ? 1 : 0,
		topicType: Constants.POST.ORGANIZE, //组织帖子
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	};
	if (null != object.releaseDate && '' != object.releaseDate) {
		obj.timedReleaseDate = object.releaseDate;
	}
	var picsize = obj.topicPics.split(","); //图片key数组
	if (object.releaseDate) {
		obj.topicState = 1; //如果是定时发布的帖子状态默认为1
	}
	if (object.topicId) {
		if (stateFlag == 2 && object.releaseDate == '') {
			obj.timedReleaseDate = moment().format("YYYY-MM-DD HH:mm:ss");
		}
		if (null != picsize && '' != picsize) {
			topicService.topicSize(picsize, function(err, _picsSize) {
				obj.picsSize = _picsSize;
				topicService.updateTopic({
					topicId: object.topicId
				}, obj, function(err, obj) {
					res.redirect('/admin/org/' + object.orgId + "/topic"); //跳转到组织的帖子列表
				});
			});
		} else {
			topicService.updateTopic({
				topicId: object.topicId
			}, obj, function(err, obj) {
				res.redirect('/admin/org/' + object.orgId + "/topic"); //跳转到组织的帖子列表
			});
		}
	} else {
		obj.createDate = moment().format("YYYY-MM-DD HH:mm:ss");
		var orgGroupParam = {
			condition: {
				userId: object.orgId
			},
			attr: ['groupId']
		};
		// 判断是否有图片传入
		if (null != picsize && '' != picsize) {
			topicService.topicSize(picsize, function(err, _picsSize) {
				obj.picsSize = _picsSize;
				var userParams = {
					userId: obj.userId,
					beanValue: 20,
					attributes: ['userId', 'bean'] // 必传
				};
				userService.getOrgsGroup(orgGroupParam, function(err, orgGroup) {
					obj.groupId = orgGroup.getDataValue("groupId");
					topicService.addTopic(obj, function(err, obj) {
						beanRelationService.getBeanDouble(userParams.beanValue, {
							type: 'post'
						}, function(beanValue) {
							userParams.beanValue = beanValue;
							userService.updateUserBean(userParams, function(err, kpUser) {
								res.redirect('/admin/org/' + object.orgId + "/topic"); //跳转到组织的帖子列表
							});
						});
					});
				});
			});
		} else {
			var userParams = {
				userId: obj.userId,
				beanValue: 20,
				attributes: ['userId', 'bean'] // 必传
			};
			userService.getOrgsGroup(orgGroupParam, function(err, orgGroup) {
				obj.groupId = orgGroup.getDataValue("groupId");
				topicService.addTopic(obj, function(err, obj) {
					beanRelationService.getBeanDouble(userParams.beanValue, {
						type: 'post'
					}, function(beanValue) {
						userParams.beanValue = beanValue;
						userService.updateUserBean(userParams, function(err, kpUser) {
							res.redirect('/admin/org/' + object.orgId + "/topic"); //跳转到组织的帖子列表
						});
					});
				});
			});
		}
	}
});
/**
 * by hp
 * 发布，取消发布，推荐，取消推荐，删除，恢复频道
 */
router.get('/topicUpdate/:topicId',function(req, res){
	var params = {};
	var action = req.query.action;
	//recommend推荐  unreco取消推荐  unpost取消发布  post发布  recover恢复删除  del删除
	if(action == "recommend"){
		params = {isRecommend: 1}
	} else if (action == "unreco"){
		params = {isRecommend: 0}
	} else if (action == "unpost"){
		params = {topicState: 0}
	} else if (action == "post"){
		params = {topicState: 1}
	} else if (action == "recover"){
		params = {topicState: 0}
	} else if (action == "del"){
		params = {topicState: -1}
	}
	topicService.updateTopic({topicId: req.params.topicId}, params, function(err, objList){
		res.redirect("/admin/topic");
	});

});

/**
 * 修改组织帖子 UI
 */
router.get("/orgTopicUpdateUI",function(req,res){
	var topicId = req.query.topicId;
	var stateFlag = req.query.stateFlag;
	var topicPics = '';
	var params = {
		attributes : ['topicId','topicName','audioAddress','topicDesc','topicPics','isRecommend']
	};
	topicService.getTopicObj({topicId:topicId},params,function(err,obj){
		if(obj.topicPics !=null && obj.topicPics !=''){
			topicPics = obj.topicPics.split(',');
		}
		res.render('admin/org_topic_update', {
			status:true, qntoken: qiniutoken,topic:obj,topicPics:topicPics,rogId:req.query.orgId,stateFlag:stateFlag
		});
	});
});


/**
 * 修改帖子状态
 */
router.get("/orgTopicUpdateState",function(req,res){
	var topicState = req.query.topicState;
	var stateFlag = req.query.stateFlag;
	var topicId = req.query.topicId;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var params = {
		topicState:topicState,
		updateDate:date
	};
	if(stateFlag == 2){//如果是定时发布就改成发布
		params.timedReleaseDate = date;
	}
	topicService.updateTopic({topicId:topicId},params,function(err,obj){
		res.redirect('/admin/org/' + req.query.orgId + "/topic"); //跳转到组织的帖子列表
	});
});
/**
 * by hp/admin
 * 添加或修改频道
 */
router.post('/topic', function(req, res) {
	var object = req.body;
	var group = {
		topicName:object.topicName,
		topicScope:object.topicScope,
		groupId:object.groupId,
		userId: object.userId,
		topicDesc:object.topicDesc,
		isRecommend:object.isRecommend? 1: 0,
		groupState:object.groupState? 1: 0,
		topicType: 1,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	};
	//topicId存在则为修改，不存在未添加
	if (object.topicId){
		topicService.updateTopic(object.groupId, group, function(err, obj){
			if(err){
				res.render('admin/group_update', {status: false});
			} else{
				res.redirect('/admin/group');//跳转到列表
			}
		});
	} else {
		topicService.addTopic(group, function(err, obj){
			if(err){
				res.render('admin/topic_add', {status: false});
			} else{
				res.redirect('/admin/topic');//跳转到列表
			}
		});
	}
});

/**
 * 物理删除内部组织帖子
 */
router.get('/delInnerOrgTopic',function(req,res){
	var topicId = req.query.topicId;
	var orgId = req.query.orgId;
	var flag = req.query.flag;
	topicService.deleteTopic({topicId:topicId},function(obj){
		if(flag == 'topicPD'){
			res.redirect('/admin/topic');//跳转频道列表
		}else{
			res.redirect('/admin/org/' + orgId + "/topic"); //跳转到组织的帖子列表
		}
	});
});

/**
 * 内部组织帖子推送
 */
router.get('/innerOrgPostMessage', function(req, res){
	var object = req.query;
	var topicId = object.topicId;
	var userId = object.orgId;
	var plusContent = object.plusContent;
	var msgParams = {
		topicId : topicId,
		messageText:plusContent,
		sendUserId :userId,
		reciveUserId:userId,
		pushGoal:'org',
		chatType:1,
		officalType:0,
		releaseDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	async.parallel([
		// 获取发起推送用户的基本信息
		function(callback0){
			// 需要的字段
			var attrs = ['userId','nickName','headPortrait'];
			userService.getUserByParam({userId:userId},attrs,function(err, kpUser){
				callback0(null, kpUser);
			});
		},
		function(callback1){
			messageService.createMessage(msgParams,function(message){
				callback1(message);
			});
		}
	],function(err, results){
		var params = {
			userId:results[0].userId,
			channels:results[0].userId,
			prod:'dev',
			data:{
				userId:results[0].userId,			// 发起推送的人
				headPortrait:commonUtil.headPortrait({headPortrait:results[0].headPortrait}), // 发起推送人的头像
				action:'app',	// 推送信息让客户端显示执行
				chatContent:results[0].nickName + ': 邀你去看看新发布的帖子 :'+plusContent,
				officalType:0,	// 官方推送类型（0：帖子，1：活动，2：资讯）
				chatType:1,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
				postId:topicId,		// 帖子ID
				nickName:results[0].nickName,		// 发起人的用户昵称
			    replayNickName:"",				// 接收方昵称
			    replay:false					// 
			}
		};
		// 调用推送方法
		messagePushService.sendMessage(params,function(){});
		res.redirect('/admin/org/' + userId + "/topic"); //跳转到组织的帖子列表
	});
});

/**
 * 2015-11-04 by Star / admin
 * 视频列表
 */
router.get('/videoList', function(req, res){
	var object = req.query;	
	var pageIndex = object.pageIndex ? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize ? parseInt(object.pageSize): 10;
	var params = {
		intro: object.keyword ? object.keyword : "",
		offset: pageIndex ? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize ? pageSize: 10,
		order: 'createDate DESC'//默认排序
	};
	if(object.order === "timedesc") params.order = "createDate desc";
	if(object.order === "timeasc") params.order = "createDate asc";
	if(object.order === "likedesc") params.order = "likeCount desc";
	if(object.order === "likeasc") params.order = "likeCount asc";
	if(object.order === "sharedesc") params.order = "shareCount desc";
	if(object.order === "shareasc") params.order = "shareCount asc";
	if(object.order === "readdesc") params.order = "readCount desc";
	if(object.order === "readasc") params.order = "readCount asc";
	videoService.getVideoList(params, function(err, videoList){
		async.map(videoList.rows, function(item, callback){
			// 设置图片前缀
			item.picture = item.picture ? config.qiniu.kp_site + item.picture : "";
			// 格式化时间字段
			var datetime = dateUtils.formatGMTDate(item.createDate);
			item.setDataValue('createDate',datetime);
			callback(null, item);
		}, function(err, results){
			res.render('admin/video_list',{
				totalCount:videoList.count, videoList:results, currentPage: pageIndex
			});
		});		
	});
});


/**
 * 2015-11-04 by Star / admin
 * 跳转至新增视频页
 */
router.get('/video-addui', function(req, res){
	res.render('admin/video_add',{qntoken: qiniutoken});
});


/**
 * 2015-11-04 by Star / admin
 * 新增视频
 */
router.post('/video-add', function(req, res){
	var object = req.body;
	var params = {
		videoDesc:object.videoDesc,
		videoAddress:object.videoAddress,
		picture:object.starLogo,
		videoTag:object.videoTag
	}
	videoService.createVideo(params, function(err, video){
		res.redirect('/admin/videoList');	//跳转视频列表
	});
});

/**
 * 2015-11-05 by Star / admin
 * 跳转至编辑视频页
 */
router.get('/video-editui', function(req, res){
	var params = {
		videoId:req.query.videoId
	}
	videoService.findOneVideo(params, function(err, obj){
		res.render('admin/video_edit',{qntoken: qiniutoken, video: obj});
	});
});

/**
 * 2015-11-05 by Star / admin
 * 编辑视频
 */
router.post('/video-edit', function(req, res){
	var object = req.body;
	// 修改的值
	var setValue = {
		videoDesc: object.videoDesc,
		videoAddress: object.videoAddress,
		picture: object.starLogo
	};
	// 条件
	var params = {
		videoId: object.videoId
	};
	videoService.updateVideoByParams(setValue, params, function(obj){
		res.redirect('/admin/videoList');	//跳转视频列表
	});
});

/**
 * 2015-11-04 by Star / admin
 * 删除视频帖子
 */
router.get('/video-del', function(req, res){
	// 修改的值
	var setValue = {
		videoState:0
	};
	// 条件
	var params = {
		videoId:req.query.videoId
	};
	videoService.updateVideoByParams(setValue, params, function(obj){
		res.redirect('/admin/videoList');	//跳转视频列表
	});
});


/**
 * 2015-11-06 by Star / admin
 * 预览视频(辅助功能)
 */
router.get('/video-preview', function(req, res){
	var object = req.query;
	var videoinfo = object.videoAddress;
	console.log('videoInfo = ' + videoinfo);
	res.render('admin/video_preview',{video: videoinfo});
});

module.exports = router;