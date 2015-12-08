"use strict";
/**
 * Created by admin on 2015/8/19.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var http = require("http");
var topicService = require('../services/TopicService');
var commentService = require('../services/CommentService');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var messageService = require('../services/messageService');
var topicPostService = require('../services/topicPostService');
var userService = require('../services/UserService');
var messagePushService = require('../services/MessagePushService');
var config = require('../config/config');
var commonUtil = require('../utils/commonUtil');
var beanRelationService = require('../services/BeanRelationService.js');
/**
 * 得到组织发的帖子
 */
router.get('/org-topic-list', function(req,res){
	var dateFlag = moment().format("YYYY-MM-DD HH:mm:ss");
	var stateFlag = req.query.stateFlag;
	var userId = req.session.outsideSessionUser.userId;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params ={
		userId:userId,
		topicType:3,
		topicState:-1,
		postChoose:req.query.postChoose?req.query.postChoose:null,
		keyWord:req.query.keyWord?req.query.keyWord.trim():req.query.keyWord,
		order:req.query.order,
		isRecommend:req.query.isRecommend,
		startDate:req.query.startDate,
		endDate:req.query.endDate,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	
	if(stateFlag != ''){
		params.stateFlag = stateFlag;
	}
	var totalCount = 0 ;
	topicService.getOrgTopicCount(params,function(err,count){
		totalCount = count[0].count;
	});
	topicService.getOrgTopic(params,function(err,list){
		async.map(list, function(item, callback) {
			if(null != item.createDate){
				item.createDate = dateUtils.formatDate(item.createDate);
			}
			if(null != item.updateDate){
				item.updateDate = dateUtils.formatDate(item.updateDate);
			}
			if(null != item.timedReleaseDate){
				item.timedReleaseDate = dateUtils.formatDate(item.timedReleaseDate);
			}
			if(item.topicState == 1 && item.timedReleaseDate !=null && item.timedReleaseDate > dateFlag){
				item.topicState = 2;
			}
			var topicId = item.topicId;
			async.parallel([
				function(callback0){
					commentService.getNewPostCommentCountObj({topicId:topicId},function(err,count){
						callback0(null,count);
					})
				}
			], function(err, result) {
				item.commentCount = result[0][0].commentCount;
				callback(null,item);
			});	
		}, function(err, results) {
			res.render('outside/org_topic_list', {
				topList: results,totalCount:totalCount,currentPage:index,userId:userId,params:params
			});
		});	
	});
});

/**
 * 新增帖子UI
 */
router.get('/org-topic-addui',function(req,res){
	res.render('outside/org_topic_add', {status:true, qntoken: qiniutoken});	
});


/**
 * 逻辑删除帖子
 */
router.get('/topic/delete',function(req,res){
	var topicId = req.query.topicId;
	var topicState = req.query.topicState;
	topicService.updateTopic({topicId:topicId},{topicState:topicState,updateDate:moment().format("YYYY-MM-DD HH:mm:ss")},function(err,obj){
		res.redirect('/outside-admin/org-topic-list');
	});
});

/**
 * 物理删除帖子
 */
router.get('/topic/chedi-delete',function(req,res){
	var topicId = req.query.topicId;
	topicService.deleteTopic({topicId:topicId},function(obj){
		res.redirect('/outside-admin/org-topic-list');		
	});
});

/**
 * 修改帖子状态
 */
router.get('/topic/update-state',function(req,res){
	var releaseState = req.query.releaseState;
	var topicId = req.query.topicId;
	var topicState = req.query.topicState;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var params = {
		topicState:1,
		updateDate:date
	};
	if(releaseState == 2){//如果是定时发布就改成发布
		params.timedReleaseDate = date;
	}
	if(0 == topicState){//取消发布
		topicService.updateTopic({topicId:topicId},{topicState:0,updateDate:date},function(err,obj){
			res.redirect('/outside-admin/org-topic-list');
		});
	}else if(1 == topicState){//发布
		topicService.updateTopic({topicId:topicId},params,function(err,obj){
			res.redirect('/outside-admin/org-topic-list');
		});
	}else if(2 == topicState){//恢复
		topicService.updateTopic({topicId:topicId},{topicState:1,updateDate:date},function(err,obj){
			res.redirect('/outside-admin/org-topic-list');
		});
	}
});	

/**
 * 新增组织帖子
 */
router.post('/topic/add', function(req, res) {
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var topicName = req.body.topicName;
	var topicDesc = req.body.topicDesc;
	var topicPics = req.body.starLogo ? req.body.starLogo.toString() : '';
	var isRecommend = req.body.isRecommend;
	var state = req.body.state;
	var timedReleaseDate = req.body.timedReleaseDate;
	var userId = req.session.outsideSessionUser.userId;
	var audioAddress = req.body.starBG ? req.body.starBG : null;
	var audioTime = req.body.audioTime ? req.body.audioTime : null;
	var picsize = topicPics.split(","); //图片key数组
	// 判断是否有图片传入
	if (null != picsize && '' != picsize) {

		topicService.topicSize(picsize, function(err, _picsSize) {
			var params = {
				topicName: topicName,
				topicDesc: topicDesc,
				createDate: date,
				updateDate: date,
				audioAddress: audioAddress,
				audioTime: audioTime,
				topicPics: topicPics,
				picsSize: _picsSize, // 原图片尺寸参数
				topicType: 3,
				userId: userId
			};

			if (null != timedReleaseDate && '' != timedReleaseDate) {
				params.timedReleaseDate = timedReleaseDate;
			}
			if ('' != timedReleaseDate || state == 1) {
				params.topicState = 1;
			} else {
				params.topicState = 0;
			}
			if (isRecommend == 1) {
				params.isRecommend = 1;
			} else {
				params.isRecommend = 0;
			}
			var userParams = {
				userId: userId,
				beanValue: 20,
				attributes: ['userId', 'bean'] // 必传
			};
			async.auto({
			/*	get_user:function(callback){
					userService.getUserInfo({userId:"999999",attributes:['userId','headPortrait','nickName']},function(err,obj){//查询官方推送者的用户信息
						callback(null,obj);
					});	
				},*/
				get_org:function(callback){//查询改用户所属粉丝团编号
					userService.getUserVerifyByParam({userId: userId},function(err,userObj){
						if (userObj) {
							params.groupId = userObj.groupId;
						}
						callback(null,userObj);
					});
				},
				add_topic:['get_org', function(callback, userObj){//ADD topic
					topicService.addTopic(params, function(err, topic) {
						callback(null,topic);
					});	
				}],	
				get_double_bean:function(callback){//计算豆币是否有加倍
					beanRelationService.getBeanDouble(userParams.beanValue, {type: 'post'}, function(beanValue) {
						userParams.beanValue = beanValue;
						callback(null,beanValue);
					});	
				},	
				update_user_bean:['add_topic','get_double_bean', function(callback, obj){//修改其豆币。
					userService.updateUserBean(userParams, function(err, kpUser) {
						callback(null,kpUser);
					});	
				}],		
			},function(err, results){
				/*var msgParams = {//记录推送历史消息所需参数
					messageText:"恭喜您发了一条新帖加了"+userParams.beanValue+"豆币~~~目前总豆币:"+results.update_user_bean.bean,//内容
					sendUserId:results.get_user.userId,//发送者编号
					reciveUserId:userId,//接收者编号
					pushGoal:'user',//推送类型        
					chatType:1,
					officalType:0,
					releaseDate:moment().format("YYYY-MM-DD HH:mm:ss")
				};
				var sendParams = {//推送所需参数
				  userId : userId,//接受人
					data : {
						userId : results.get_user.userId,//发送者编号
						headPortrait :commonUtil.headPortrait({headPortrait:results.get_user.headPortrait}),
						action:'app',
						chatContent:"恭喜您发了一条新帖加了"+userParams.beanValue+"豆币~~~目前总豆币:"+results.update_user_bean.bean,
						chatType:1,
						postId:"",
						officalType:0,
						nickName : results.get_user.nickName,
						replayNickName:req.session.outsideSessionUser.nickName,
						replay:false
					}
				};
				async.parallel([
					function(callback0){
						//创建推送历史消息记录
						messageService.createMessage(msgParams,function(obj){
							callback0(null,obj);
						});
					},
					function(callback1){
						//发送推送
						messagePushService.sendMessage(sendParams,function(){});
					}
				], function(err, result) {
					res.redirect('/outside-admin/org-topic-list');
				});	*/
				res.redirect('/outside-admin/org-topic-list');
			});	
		});
	} else {
		var params = {
			topicName: topicName,
			topicDesc: topicDesc,
			createDate: date,
			updateDate: date,
			audioAddress: audioAddress,
			audioTime: audioTime,
			topicPics: topicPics,
			topicType: 3,
			userId: userId
		};

		if (null != timedReleaseDate && '' != timedReleaseDate) {
			params.timedReleaseDate = timedReleaseDate;
		}
		if ('' != timedReleaseDate || state == 1) {
			params.topicState = 1;
		} else {
			params.topicState = 0;
		}
		if (isRecommend == 1) {
			params.isRecommend = 1;
		} else {
			params.isRecommend = 0;
		}
		var userParams = {
			userId: userId,
			beanValue: 20,
			attributes: ['userId', 'bean'] // 必传
		};
		async.auto({
			/*get_user:function(callback){
				userService.getUserInfo({userId:"999999",attributes:['userId','headPortrait','nickName']},function(err,obj){//查询官方推送者的用户信息
					callback(null,obj);
				});	
			},*/
			get_org:function(callback){//查询改用户所属粉丝团编号
				userService.getUserVerifyByParam({userId: userId},function(err,userObj){
					if (userObj) {
						params.groupId = userObj.groupId;
					}
					callback(null,userObj);
				});
			},
			add_topic:['get_org', function(callback, userObj){//ADD topic
				topicService.addTopic(params, function(err, topic) {
					callback(null,topic);
				});	
			}],	
			get_double_bean:function(callback){//计算豆币是否有加倍
				beanRelationService.getBeanDouble(userParams.beanValue, {type: 'post'}, function(beanValue) {
					userParams.beanValue = beanValue;
					callback(null,beanValue);
				});	
			},	
			update_user_bean:['add_topic','get_double_bean', function(callback, obj){//修改其豆币。
				userService.updateUserBean(userParams, function(err, kpUser) {
					callback(null,kpUser);
				});	
			}],		
		},function(err, results){
	/*		var msgParams = {//记录推送历史消息所需参数
				messageText:"恭喜您发了一条新帖加了"+userParams.beanValue+"豆币~~~目前总豆币:"+results.update_user_bean.bean,//内容
				sendUserId:results.get_user.userId,//发送者编号
				reciveUserId:userId,//接收者编号
				pushGoal:'user',//推送类型        
				chatType:1,
				officalType:0,
				releaseDate:moment().format("YYYY-MM-DD HH:mm:ss")
			};
			var sendParams = {//推送所需参数
			  userId : userId,//接受人
				data : {
					userId : results.get_user.userId,//发送者编号
					headPortrait :commonUtil.headPortrait({headPortrait:results.get_user.headPortrait}),
					action:'app',
					chatContent:"恭喜您发了一条新帖加了"+userParams.beanValue+"豆币~~~目前总豆币:"+results.update_user_bean.bean,
					chatType:1,
					postId:"",
					officalType:0,
					nickName : results.get_user.nickName,
					replayNickName:req.session.outsideSessionUser.nickName,
					replay:false
				}
			};
			async.parallel([
				function(callback0){
					//创建推送历史消息记录
					messageService.createMessage(msgParams,function(obj){
						callback0(null,obj);
					});
				},
				function(callback1){
					//发送推送
					messagePushService.sendMessage(sendParams,function(){});
				}
			], function(err, result) {
				res.redirect('/outside-admin/org-topic-list');
			});	*/
			res.redirect('/outside-admin/org-topic-list');
		});	
	};
});
/**
 * 修改组织帖子UI
 */
router.get('/org-topic-updateUi',function(req,res){
	var releaseState = req.query.releaseState;
	var topicId = req.query.topicId;
	var params = {
		attributes : ['topicId','topicName','audioAddress','topicDesc','topicPics','isRecommend']
	};
	var picsArr = [];
	topicService.getTopicObj({topicId:topicId},params,function(err,obj){
		if(obj.topicPics){
			picsArr = obj.topicPics.split(",");
		}
		res.render('outside/org_topic_update', {
			status:true, qntoken: qiniutoken,topic:obj,topicPics:picsArr,releaseState:releaseState
		});
	});
});
/**
 *修改帖子
 */
router.post('/topic/update',function(req,res){
	var releaseState = req.body.releaseState;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var topicId = req.body.topicId;
	var topicDesc = req.body.topicDesc;
	var topicName = req.body.topicName;
	var audioAddress = req.body.starBG?req.body.starBG:null;
	var audioTime = req.body.audioTime?req.body.audioTime:null;
	var topicPics = req.body.starLogo?req.body.starLogo.toString():'';
	var isRecommend = req.body.isRecommend;
	var state = req.body.state;
	var timedReleaseDate = req.body.timedReleaseDate;
	var picsize = topicPics.split(",");		//图片key数组
	if(null != picsize && '' != picsize){
			var params = {
				topicDesc:topicDesc,
				topicName:topicName,
				audioAddress:audioAddress,
				audioTime:audioTime,
				topicPics:topicPics,
				picsSize:req.body.picsSize,		
				updateDate:date
			};
			if(isRecommend ==1){
					params.isRecommend=1;
				}else{
					params.isRecommend=0;
				}
				if(null != timedReleaseDate && '' != timedReleaseDate){
					params.timedReleaseDate = timedReleaseDate;		
				}
				if('' == timedReleaseDate && releaseState == 2){
					params.timedReleaseDate = date;		
				}
				if('' !=timedReleaseDate || state == 1){
					params.topicState = 1;
				}else{
					params.topicState = 0;
				}
				topicService.updateTopic({topicId:topicId},params,function(err,obj){
					res.redirect('/outside-admin/org-topic-list');
				});
	}else{
		var params = {
			topicDesc:topicDesc,
			topicName:topicName,
			audioAddress:audioAddress,
			audioTime:audioTime,
			topicPics:topicPics,
			updateDate:date
		}
		if(isRecommend ==1){
			params.isRecommend=1;
		}else{
			params.isRecommend=0;
		}
		if(null != timedReleaseDate && '' != timedReleaseDate){
			params.timedReleaseDate = timedReleaseDate;		
		}
		if('' == timedReleaseDate && releaseState == 2){
			params.timedReleaseDate = date;		
		}
		if('' !=timedReleaseDate || state == 1){
			params.topicState = 1;
		}else{
			params.topicState = 0;
		}
		topicService.updateTopic({topicId:topicId},params,function(err,obj){
			res.redirect('/outside-admin/org-topic-list');
		});
	};
});


/**
 *验证帖子名称是否已存在 
 */
router.post('/check/topicName',function(req,res){
	var topicName = req.body.topicName.trim();
	var topicId = req.body.topicId;
	var params = {topicState:{not:-1}};
	if(null ==topicId || '' == topicId){
		params.topicName = topicName;
	}else{
		params.topicName = topicName;
		params.topicId ={not:topicId};
	}
	topicService.getTopicCount(params,function(err,count){
		if(count > 0){
			res.json({message:'帖子标题已存在!',code:1909});
		}else{
			res.json({message:'',code:1111});
		};
	});
});

/**
 * 组织帖子推送
 */
router.get('/topic-push',function(req,res){
	var headPortrait = req.session.outsideSessionUser.headPortrait;
	var nickName = req.session.outsideSessionUser.nickName;
	var params = {
		topicId : req.query.topicId,
		messageText:req.query.plusContent,
		sendUserId : req.session.outsideSessionUser.userId,
		reciveUserId:req.session.outsideSessionUser.userId,
		pushGoal:'org',
		chatType:1,
		officalType:0,
		releaseDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	async.parallel([
		function(callback0){
			messageService.createMessage(params,function(message){
				callback0(message);
			});
		},
		function(callback1){
			var params2 = {
				userId:params.sendUserId,
				channels:params.sendUserId,
				prod:'dev',
				data:{
					userId:params.sendUserId,
					headPortrait:commonUtil.headPortrait({headPortrait:headPortrait}),
					chatType:1,
					officalType:0,
					action:'app',
					postId:params.topicId,
					nickName:nickName,
					replayNickName:'',
					replay:false,
					chatContent:nickName + ': 邀你去看看新发布的帖子 :'+params.messageText
				}
			};
			messagePushService.sendMessage(params2,function(){});
		}
	],function(err,results){
		res.redirect('/outside-admin/org-topic-list');
	});	
});
module.exports = router;