"use strict";
var express = require('express');
var router = express.Router();
var config = require('../config/config');
var apiUri = require('../config/apiUri');
var userService = require('../services/UserService');
var groupService = require('../services/groupService');
var async = require('async');
var moment = require('moment');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var messagePushService = require('../services/MessagePushService');
var addressService = require('../services/addressService');
var bagService = require('../services/BagService');
var beanRelationService = require('../services/BeanRelationService');
var messageService = require('../services/messageService');
var commonUtil = require('../utils/commonUtil');
var myClient = require('../utils/redisDB').myClient;
/**
 * 获取用户收货信息
 */
router.get(apiUri.addressUri + '/:user_id', function(req, res) {
	userService.getUserAddress(req.params, function(err, obj){
		res.json(obj);
	})
});

/**
 *组织审核列表
 * @param {Object} params
 * @param {Object} callback
 */
router.get('/admin/list/userVerify', function(req, res) {
	var stateFlag = req.query.stateFlag;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params = {
		verifyState: -1,
		postChoose: req.query.postChoose,
		keyWord: req.query.keyWord?req.query.keyWord:null,
		order:req.query.uorder,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	if (null != stateFlag && '' != stateFlag) {
		params.delState = stateFlag;
	}
	var arr = new Array;
	if (params.postChoose == 2) {
		groupService.likeGroupListAll(params, function(err, list) {
			for (var i = 0; i < list.length; i++) {
				arr.push(list[i].groupId);
			}
			var groupdIds = JSON.stringify(arr).replace("[", "(").replace("]",")");;
			params.groupIds = groupdIds;
			var totalCount = 0 ;
			userService.getUserVerifyCount(params,function(err,count){
				totalCount = count[0].count;
			userService.getUserVerifyList(params, function(err, list) {
				async.map(list, function(item, callback) {
					if (null != item.createDate) {
						item.createDate = dateUtils.formatDate(item.createDate);
					}
					if (null != item.verifyDate) {
						item.verifyDate = dateUtils.formatDate(item.verifyDate);
					}
					var params0 = {
						orgId: item.userId
					};
					var params2 = {
						userId: item.userId
					};
					var params3 = {
						groupState: 1,
						groupId: item.groupId,
						attributes: ['groupId','starName']
					};
					async.parallel([

						function(callback1) {//得到频道数和帖子数
							userService.getOrgTopicCount(params2, function(err, topicCount) {
								callback1(null, topicCount);
							})
						},
						function(callback2) {
							groupService.getGroupByParams(params3, function(err, obj) {//得到明星
								callback2(null, obj);
							});
						}
					], function(err, result) {
						//item.recordCount = result[0].count; //得到打卡数
						item.activeCount = Math.round((item.fansCount / 100)) + result[0]; //得到活跃度
						if (null != result[1]) {
							item.starName = result[1].starName; //得到明星
						} else {
							item.starName = null;
						}
						callback(null, item);
					});
				}, function(err, results) {
					res.render('admin/user/user_verify_list', {
						userList: results,currentPage:index,totalCount:totalCount,params:params
					});
				});
			});
			});
		});
	} else {
		var totalCount = 0 ;
		userService.getUserVerifyCount(params,function(err,count){
			totalCount = count[0].count;
		userService.getUserVerifyList(params, function(err, list) {
			async.map(list, function(item, callback) {
				if (null != item.createDate) {
					item.createDate = dateUtils.formatDate(item.createDate);
				}
				if (null != item.verifyDate) {
					item.verifyDate = dateUtils.formatDate(item.verifyDate);
				}
				var params0 = {
					orgId: item.userId
				};
				var params2 = {
					userId: item.userId
				};
				var params3 = {
					groupState: 1,
					groupId: item.groupId,
					attributes: ['groupId','starName']
				};
				async.parallel([

					function(callback1) {
						userService.getOrgTopicCount(params2, function(err, topicCount) {
							callback1(null, topicCount);
						})
					},
					function(callback2) {
						groupService.getGroupByParams(params3, function(err, obj) {
							callback2(null, obj);
						});
					}
				], function(err, result) {
					//item.recordCount = result[0].count; //得到打卡数
					item.activeCount = Math.round((item.fansCount / 100)) + result[0]; //得到活跃度
					if (null != result[1]) {
						item.starName = result[1].starName; //得到明星
					} else {
						item.starName = null;
					}
					callback(null, item);
				});
			}, function(err, results) {
				res.render('admin/user/user_verify_list', {
					userList: results,currentPage:index,totalCount:totalCount,params:params
				});
			});
		});
		});
	}
});

/**
 *组织审核UI
 * @param {Object} params
 * @param {Object} callback
 */
router.get('/admin/updateUI/userVerify', function(req, res) {
	var userId = req.query.userId;
	var params = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	};
	async.parallel([
		function(callback0){
			userService.getUserVerifyList({userId:userId},function(err,obj){
				callback0(null,obj);
			});
		},
		function(callback1){
			groupService.getGroupListAll(params,function(err,groupList){
				callback1(null,groupList);
			});
		}
	],function (err, result) {
		if(result[0][0].password && result[0][0].password.length == 32){
			result[0][0].password = commonUtil.decrypt(result[0][0].password);
		}
		res.render('admin/user/user_verify_update', {user:result[0],groupList:result[1],status:true, qntoken: qiniutoken});
	});
});

/**
 *组织审核
 * @param {Object} params
 * @param {Object} callback
 */
router.post('/admin/update/userVerify', function(req, res) {
			var userId = req.body.userId;
			var userName = req.body.userName;
			var password = commonUtil.encrypt(req.body.password);
			var headPortrait = req.body.starLogo?req.body.starLogo:'';
			var centerBackground = req.body.starBG?req.body.starBG:'';
			var groupId = req.body.groupId;
			var verifyState = req.body.verifyState;
			var verifier = req.session.sessionUser.userName;//得到session中的值
			var save = req.body.save;
			var condition = {
				userId: userId
			};
			var params = {
				nickName: userName,
				password: password,
				headPortrait: headPortrait,
				centerBackground: centerBackground,
				updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
			};
			var params2 = {
				verifyState:verifyState,
				verifier:verifier,
				groupId: groupId,
				updateDate:moment().format("YYYY-MM-DD HH:mm:ss"),
				verifyDate:moment().format("YYYY-MM-DD HH:mm:ss")
			};
			var params3 = {
				userId:userId,
				verifier:verifier,
				verifyState:verifyState,
				groupId: groupId,
				orgType:'outer',
				verifyDate:moment().format("YYYY-MM-DD HH:mm:ss")
			};
			
			async.parallel([
				function(callback0) {
					userService.updateUser(condition, params, function(err, obj) {
						callback0(null,obj);
					});
				},
				function(callback1){
					userService.getUserVerifyObj({userId:userId},function(obj){//判断用户审核表中是否存在当前用户，存在则修改，不存在则新增.
						if(obj){
							userService.updateUserVerify(condition,params2,function(err,obj){
								callback1(null,obj);
							});
						}else{
							userService.createOrgVerify(params3,function(err,obj){
								callback1(null,obj);
							});
						}
					});
				}
			], function(err, result) {
				if(save == 2){//表示保存并推送
				var params4 = {
					userId:"999999",
					attributes:['userId','headPortrait','nickName']
				};
				userService.getUserInfo(params4,function(err,userObj){
					var params5 = {
						userId : userId,//接受人
						prod:'dev',
						data : {
							userId : userObj.userId,//发送人
							headPortrait :commonUtil.headPortrait({headPortrait:userObj.headPortrait}),
							action:'app',
							chatType:2,
							postId:"",
							officalType:0,
							nickName : userObj.nickName,
							replayNickName:userName,
							replay:false
						}
					};
					if(verifyState == 1){//表示审核通过
						params5.data.chatContent = "恭喜你，账号已被认证成功，现在开始添加内容，吸引更多的粉丝吧~！请联系我们获取电脑版发帖后台地址。联系QQ:2106998046";
						messagePushService.sendMessage(params5);
					}else{
						params5.data.chatContent = req.body.pushDesc;
						messagePushService.sendMessage(params5);
					}
					var msgParams = {
						messageText:params5.data.chatContent,
						sendUserId:userObj.userId,
						reciveUserId:userId,
						pushGoal:'user',
						chatType:1,//表示官方消息
						officalType:3,//表示个人消息
						releaseDate:moment().format("YYYY-MM-DD HH:mm:ss")
					};
					messageService.createMessage(msgParams,function(obj){});
					res.redirect('/admin/list/userVerify');
				});
				
			}else{
				res.redirect('/admin/list/userVerify');
			}
	});
});

/**
 *修改状态 
 */
router.get('/admin/user/update-state', function(req, res) {
	var userId = req.query.userId;
	var state = req.query.userState;
	userService.updateUser({userId:userId},{state:state},function(err, obj){
		res.redirect('/admin/list/userVerify');
	});
});

/**
 *修改豆币值 
 */
router.get('/admin/user/update-bean', function(req, res) {
	var userId = req.query.userId;
	var bean = req.query.bean;
	var flag = req.query.flag;
	userService.updateUser({userId:userId},{bean:bean},function(err, obj){
		if(flag == 'user'){
			res.redirect('/admin/getUserList');
		}else{
			res.redirect('/admin/list/userVerify');
		}
	});
});	


/**
 *物理删除组织 
 */
router.get('/admin/user/delete-user',function(req,res){
	var userId = req.query.userId;
	var flag = req.query.flag;
	async.parallel([
		function(callback0){
			userService.deleteUser({userId:userId},function(err,obj){
				callback0(null,obj);
			});
		},
		function(callback1){
			userService.deleteUserVerify({userId:userId},function(err,obj){
				callback1(null,obj);
			})
		}
	], function(err, result) {
		if(flag == 'inner'){
			res.redirect('/admin/org');		
		}else{
			res.redirect('/admin/list/userVerify');		
		}
	});
});

/**
 * 查看组织每日打卡情况
 */
router.get('/admin/user/query-org-rec', function(req, res) {
	var userId = req.query.userId;
	var startDate =req.query.startDate;
	var endDate = req.query.endDate;
	var order = req.query.order;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params = {
		userId:userId,
		startDate:startDate,
		endDate:endDate,
		order:order,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	var totalCount = 0 ;
	userService.getUserRecordeCount(params,function(err,count){
		totalCount = count[0].count;
	});
	userService.getUserEverydayData(params,function(err,list){
		async.map(list, function(item, callback) {
			async.parallel([
				function(callback0){
					userService.getUserEverydayRecorde({userId:item.userId,createDate:item.createDate},function(err,obj){
						callback0(null,obj);
					});
				}
			], function(err, resul) {
				item.recordeCount = resul[0][0].recordeCount;
				callback(null,item);
			});	
		}, function(err, results) {
			res.render('admin/user/user_recorde_list', {
				list:list,userId:userId,totalCount:totalCount,currentPage:index,params:params
			});
		});	
	});
});	
/**
 *查询每日活跃度 
 */
router.get('/admin/user/query-org-active', function(req, res) {
	var userId = req.query.userId;
	var startDate =req.query.startDate;
	var endDate = req.query.endDate;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params = {
		userId:userId,
		startDate:startDate,
		endDate:endDate,
		order:req.query.order,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	var totalCount = 0 ;
	userService.getUserTipicByActiveCount(params,function(err,count){
		totalCount = count[0].count;
	});
	userService.getUserTipicByActive(params,function(err,list){
		async.map(list, function(item, callback) {//得到当前用户每日的发帖数
			var params2 = {
				userId:userId,
				createDate:item.createDate
			};
			async.parallel([
				function(callback1){
					userService.getUserEverydayActive(params2,function(err, count){
						callback1(null, count);
					});
				}
			], function(err, result) {
				//item.activeCount = Math.round((item.fansCount/100))+result[0][0].activeCount;//得到活跃度
				item.activeCount = result[0][0].activeCount;//得到活跃度
				if(result[0][0].activeCount<=0){
					item.createDate = dateUtils.formatBirthday(item.uDate);
				}
				if(item.activeCount>0){
					callback(null,item);
				}else{
					callback(null,[]);
				}
			});	
		}, function(err, results) {
			res.render('admin/user/user_active_list', {
				list:results,userId:userId,totalCount:totalCount,currentPage:index,params:params
			});
		});
	});
});

/**
 *修改组织登录密码UI        外部组织
 */
router.get('/outside-admin/org-update-pwdUI',function(req,res){
	res.render('outside/org_update_pwd',{});
});

/**
 *修改组织登录密码       外部组织
 */
router.post('/outside-admin/org-update-pwd',function(req,res){
	var password = req.body.password;
	var newpassword = req.body.newpassword;
	//var userId = "0000b5ff1a5345c5926ea69812e04894";
	var userId = req.session.outsideSessionUser.userId;
	var attrs = ['userId','userName','password'];
	var params = {
		password:newpassword
	};
	userService.getUserByParam({userId:userId},attrs,function(err,user){
		if(user){
			if(user.password != password){
				//输入的原密码不正确
				 res.json({message:'原密码输入不正确!',code:4005});
			}else{
				userService.updateUser({userId:userId},params,function(err, obj){
					res.json({message:'修改密码成功!',code:1111});
				});
			}
		}else{
			res.json({message:'组织不存在!',code:4010});
		}
	});
});

/**
 *验证用户名称是否已存在 
 */
router.post('/admin/check/userName',function(req,res){
	var userName = req.body.userName;
	var userId = req.body.userId;
	userService.checkUserName({userName:userName,userId:userId},function(err,count){
		if(count >0 ){
			res.json({message:'组织名称已存在!',code:1909});
		}else{
			res.json({message:'',code:1111});
		}
	})
});

/**
 * 外部组织登录
 */
router.get('/outside-admin/orglogin',function(req, res){
	res.render('outside/org_login',{});
});
/**
 * 外部组织登录
 */
router.post('/outside-admin/orglogin', function(req,res){
	var params = {
		userName:req.body.username,
		password:req.body.password
	};
	//var attrs = ['userId','userName','password','nickName','headPortrait'];
	userService.getOuterOrgLogin({nickName:params.userName},function(err,User){
	//userService.getUserByParam({nickName:params.userName},attrs,function(err,orgUser){	
		var orgUser = User[0];
		if(orgUser && orgUser.state ==1 && orgUser.verifyState ==1){
			// 如果组织用户存在则判断密码是否正确
			if(commonUtil.encrypt(params.password) == orgUser.password){
				// 登陆成功将用户设置到session中
				req.session.regenerate(function(){
					// 将用户信息存入session中
					req.session.outsideSessionUser = orgUser;
					req.session.save(function(err){
						if(err){
							console.log('会话保存失败!');
						} else {
							console.log('会话保存成功!');
						}
						res.json({message:'登陆成功!',code:1111});
					});
				});
			} else {
				// 密码不正确，返回提示用户
				res.json({message:'密码错误!',code:4005});
			}
		}else if(!orgUser){
			res.json({message:'组织不存在!',code:4010});
		}else if(orgUser && orgUser.state != 1){
			res.json({message:'组织已被锁定!',code:4010});
		}else if(orgUser && orgUser.verifyState != 1){
			res.json({message:'组织审核未通过!',code:4010});
		}
	});
});
/**
 * 外部组织管理后台首页
 */
router.get('/outside-admin/org-success',function(req,res){
		var userName = req.session.outsideSessionUser.nickName;
		var password = req.session.outsideSessionUser.password;
		var flag = req.query.flag;
		userService.getOuterOrgLogin({nickName:userName},function(err,User){
		var orgUser = User[0];
				// 登陆成功将用户设置到session中
			if(password == orgUser.password){
				req.session.regenerate(function(){
					// 将用户信息存入session中
					req.session.outsideSessionUser = orgUser;
					req.session.save(function(err){
						if(err){
							console.log('会话保存失败!');
						} else {
							console.log('会话保存成功!');
						}
						res.render('outside/index',{flag:flag});
					});
				});
			}else{
				res.json({message:'密码错误!',code:4005});
			}
	});
	//res.render('outside/index',{});
});

/**
 * 外部管理后台退出[销毁session]
 */
router.get('/outside-admin/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			console.log('session 销毁失败!');
		} else {
			console.log('session 销毁成功!');
			res.redirect('/outside-admin/orglogin');
		}
	});
});

/**
 *组织打卡记录
 */
router.get('/admin/org_record_list', function(req, res) {
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		pageSize: pageSize,
		pageIndex: pageIndex,
		startDate: req.query.startDate ? req.query.startDate : null,
		endDate: req.query.endDate ? req.query.endDate : null,
		postChoose: req.query.postChoose ? req.query.postChoose : null,
		keyWord: req.query.keyWord ? req.query.keyWord : null,
		state: req.query.state,
		type: req.query.type,
		order: req.query.order
	};
	var arr = new Array();
	if (params.postChoose == 3) {
		userService.likeOrg({
			state: 1,
			userType: 'org',
			nickName: params.keyWord
		}, function(err, list) {
			for (var i = 0; i < list.length; i++) {
				arr.push(list[i].userId);
			}
			var userIds = JSON.stringify(arr).replace("[", "(").replace("]", ")");
			params.userIds = userIds;
			var totalCount = 0;
			userService.getOrgRecordAllListCount(params, function(err, count) {
				if (null != count[0]) {
					totalCount = count[0].count;
				}
			userService.getOrgRecordAllList(params, function(err, list) {
				async.map(list, function(item, callback) {
					if (item.createDate != null) {
						item.createDate = dateUtils.formatDate(item.createDate);
					}
					callback(null, item);
				}, function(err, results) {
					res.render("admin/user/org_record_list", {
						orgList: results,
						totalCount: totalCount,
						currentPage: index,
						params:params
					});
				});
			});
			});
		});
	} else {
		var totalCount = 0;
		userService.getOrgRecordAllListCount(params, function(err, count) {
			if (null != count[0]) {
				totalCount = count[0].count;
			}
		userService.getOrgRecordAllList(params, function(err, list) {
			async.map(list, function(item, callback) {
				if (item.createDate != null) {
					item.createDate = dateUtils.formatDate(item.createDate);
				}
				callback(null, item);
			}, function(err, results) {
				res.render("admin/user/org_record_list", {
					orgList: results,
					totalCount: totalCount,
					currentPage: index,
					params:params
				});
			});
		});
		});
	}
});

/**
 *组织兑换 
 */
router.get('/admin/org_exchange_list',function(req,res){
	userService.getMoneyList({state:1},function(err,list){
		res.render("admin/user/money_list",{moneyList:list});
	});
});

/**
 *组织兑换ADD
 */
router.post('/admin/org-money-add',function(req,res){
	var sort = req.body.sort?req.body.sort:0;
	var bean = req.body.bean;
	var money = req.body.money;
	var params = {
		sort:sort,
		bean:bean,
		money:money,
		state:1
	};
	userService.addMoney(params,function(err,obj){
		res.redirect("/admin/org_exchange_list");
	});
});

/**
 *组织兑换记录 
 */
router.get('/admin/org_exchange_log_list',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var postChoose = req.query.postChoose;
	var keyWord = req.query.keyWord?req.query.keyWord:null;
	var state = req.query.state;
	var order = req.query.order;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		postChoose:postChoose,
		keyWord:keyWord,
		state:state,
		order:order
	};
	var totalCount = 0;
	userService.getOrgExchangeMoneyCount(params,function(err,count){
		totalCount = count[0].count;
	});
	userService.getOrgExchangeMoneyList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.createDate != null){
				item.createDate = dateUtils.formatDate(item.createDate);
			}
			if(item.updateDate != null){
				item.updateDate = dateUtils.formatDate(item.updateDate);
			}
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/org_exchange_log_list',{
				list:results,
				totalCount: totalCount,
				currentPage: index,
				params:params
			});
		});	
	});
});

/**
 *组织兑换记录修改UI 
 */
router.get('/admin/org_exchange_log_updateUi',function(req,res){
	var nickName = req.query.nickName;
	var id = req.query.id;
	userService.getOrgExchangeMoneyObj({id:id},function(err,obj){
		var updateDate = null;
		if(obj.updateDate != null){
			updateDate = dateUtils.formatDate(obj.updateDate);
		}
		obj.nickName = nickName;
		obj.setDataValue('updateDate',updateDate); 
		res.render('admin/user/org_exchange_log_update',{obj:obj});
	});
});

/**
 * 组织兑换记录修改
 */
router.post('/admin/org_exchange_log_update',function(req,res){
	var obj = req.body;
	var params = {
		money:obj.money,
		bean:obj.bean,
		state:obj.state,
		alipay:obj.alipay,
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	
	userService.updateExchangeLog({id:obj.id},params,function(err,obj){
		res.redirect('/admin/org_exchange_log_list');
	});
});

/**
 *物理删除组织兑换记录 
 */
router.get('/admin/deleteExchangeLog',function(req,res){
	var id = req.query.id;
	userService.deleteExchangeLog({id:id},function(err,obj){
		res.redirect('/admin/org_exchange_log_list');
	});
});

/**
 *删除豆币兑换金钱记录 
 */
router.get('/admin/delete-money',function(req,res){
	var moneyId = req.query.moneyId;
	userService.deleteMoney({moneyId:moneyId},function(err,obj){
		res.redirect("/admin/org_exchange_list");
	});
});

/**
 *排序操作 
 */
router.get('/admin/update-sort',function(req,res){
	var sort = req.query.sort;
	var moneyId = req.query.moneyId;
	userService.updateMoney({moneyId:moneyId},{sort:sort,updateDate:moment().format("YYYY-MM-DD HH:mm:ss")},function(err,obj){
		if(err){
			res.json({code:500});
		}else{
			res.json({code:200});
		}
	});
});

/**
 *背包管理列表 
 */
router.get('/admin/bag_list',function(req,res){
	bagService.getTicketList({},function(err,list){
		res.render('admin/user/bag_list',{list:list});
	});
});

/**
 *新增背包UI 
 */
router.get('/admin/bag_addui',function(req,res){
	res.render('admin/user/bag_add',{status:true, qntoken: qiniutoken});
});

/**
 *add bag 
 */
router.post('/admin/bag-add',function(req,res){
	var ticketType = req.body.ticketType;
	var ticketName = req.body.ticketName?req.body.ticketName:'每日打卡券';
	var parValue = req.body.parValue?req.body.parValue:0;
	var ticketUsage = req.body.ticketUsage;
	var ticketPictureUrl = req.body.starLogo;
	var isSubstance = req.body.isSubstance;
	var params = {
		ticketType:ticketType,
		ticketName:ticketName,
		parValue:parValue,
		ticketUsage:ticketUsage,
		isSubstance:isSubstance,
		ticketPictureUrl:ticketPictureUrl
	};
	bagService.createTicket(params,function(err,obj){
		res.redirect("/admin/bag_list");
	});
});
/**
 * bag updateUI
 */
router.get('/admin/bag-updateUI',function(req,res){
	var ticketId = req.query.ticketId;
	bagService.findTicketObj({ticketId:ticketId},function(err,obj){
		res.render('admin/user/bag_update',{status:true, qntoken: qiniutoken,ticket:obj});
	});
});
/**
 *bag update 
 */
router.post('/admin/bag-update',function(req,res){
	var ticketId = req.body.ticketId;
	var ticketType = req.body.ticketType;
	var ticketName = req.body.ticketName;
	var parValue = req.body.parValue?req.body.parValue:0;
	var ticketPictureUrl = req.body.starLogo?req.body.starLogo:null;
	var ticketUsage = req.body.ticketUsage;
	var isSubstance = req.body.isSubstance;
	var params = {
		ticketType:ticketType,
		parValue:parValue,
		ticketPictureUrl:ticketPictureUrl,
		isSubstance:isSubstance,
		ticketUsage:ticketUsage
	};
	if(null !=ticketName && '' !=ticketName){
		params.ticketName = ticketName;
	}
	bagService.updateTicket({ticketId:ticketId},params,function(err,obj){
		res.redirect("/admin/bag_list");
	});
});

/**
 *删除兑换券 
 */
router.get('/admin/delete-ticket',function(req,res){
	var ticketId = req.query.ticketId;
	bagService.deleteTicket({ticketId:ticketId},function(err,obj){
		res.redirect("/admin/bag_list");
	});
});
/**
 *专辑兑换管理列表 
 */
router.get('/admin/user_exchange_list',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		isFinish : -1,
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:req.query.startDate?req.query.startDate:null,
		endDate:req.query.endDate?req.query.endDate:null,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord?req.query.keyWord:null,
		state:req.query.state,
		order:req.query.order
	};
	var totalCount = 0;
	userService.getExchangeCount(params,function(err,count){
		totalCount = count[0].count;
	userService.getExchangeList(params,function(err,list){
		if(list.length>0){
			async.map(list, function(item, callback) {
				if (item.createDate != null) {
					item.createDate = dateUtils.formatDate(item.createDate);
				}
				var msg = item.exchangeInfo;
				var dataObj=eval("("+msg+")");
				if(null != dataObj){
					item.starName = dataObj.starName;
					item.albumName = dataObj.albumName;
				}
				var userId = item.userId;
				var addressState = 0;
				async.parallel([

					function(callbacl1) {
						addressService.getUserAddress({
							userId: userId
						}, function(err, obj) {
							if (null == obj) {
								addressState = 0;
							} else {
								addressState = 1;
							}
							callbacl1(null, addressState);
						});
					}
				], function(err, result) {
					item.addressState = addressState;
					callback(null, item);
				});
			}, function(err, results) {
				res.render("admin/user/user_exchange_list",{list:results,totalCount:totalCount,currentPage:index,params:params});
			});		
		}else{
			res.render("admin/user/user_exchange_list",{list:[],totalCount:totalCount,currentPage:index,params:params});
		}
	});
	});
});
/**
 *修改专辑兑换 
 */
router.get('/admin/user_exchange_update',function(req,res){
		var isFinish = req.query.isFinish;
		var operator = req.session.sessionUser.userName;//得到session中的值
		var date = moment().format("YYYY-MM-DD HH:mm:ss");
		var exchangeNo = req.query.exchangeNo;
		var params = {
			isFinish:isFinish,
			operator:operator,
			updateDate:date
		};
		bagService.updateUserExchange({exchangeNo:exchangeNo},params,function(err,obj){
			res.redirect('/admin/user_exchange_list');
		});
});

/**
 *用户签到情况 
 */
router.get('/admin/user_sign_list',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:req.query.startDate?req.query.startDate:null,
		endDate:req.query.endDate?req.query.endDate:null,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord
	};
	var totalCount = 0;
	userService.getUserSignCount(params,function(err,count){
		totalCount = count[0].count;
	userService.getUserSignList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.topDate == null){
				item.topDate = item.lastDate;
			}
			if(item.topDate != null){
				item.topDate = dateUtils.formatDate(item.topDate);
			}
			if(item.lastDate != null){
				item.lastDate = dateUtils.formatDate(item.lastDate);
			}
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/user_sign_list',{userList:results,totalCount:totalCount,currentPage:index,params:params});
		});			
	});
	});
});
/**
 *用户签到记录 
 */
router.get('/admin/user_sign_record_list',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:req.query.startDate?req.query.startDate:null,
		endDate:req.query.endDate?req.query.endDate:null,
		weekday:req.query.weekday
	};
	var totalCount = 0;
	userService.getUserSignRecordCount(params,function(err,count){
		totalCount = count.length;
	userService.getUserSignRecordList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.beanDate !=null){
				item.beanDate = dateUtils.formatBirthday(item.beanDate);
			}
			if(item.topWeekDate != null){
				item.topWeekDate = dateUtils.formatBirthday(item.topWeekDate);
			}
			if(item.topMonthDate != null){
				item.topMonthDate = dateUtils.formatBirthday(item.topMonthDate);
			}
			item.weedAddCount = item.signCount - item.topWeekCount;
			item.monthAddCount = item.signCount - item.topMonthCount;
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/user_sign_record_list',{userList:results,totalCount:totalCount,currentPage:index,params:params});
		});			
	});
	});
});

/**
 *豆币加倍管理列表 
 */
router.get('/admin/bean-double-list',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var postChoose = req.query.postChoose?req.query.postChoose:null;
	var startDate = req.query.startDate;
	var endDate = req.query.endDate;
	var beanMultiple = req.query.beanMultiple;
	var state = req.query.state;
	var params = {
		postChoose:postChoose,
		startDate:startDate,
		endDate:endDate,
		beanMultiple:beanMultiple,
		state:state,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var totalCount = 0;
	beanRelationService.getBeanDoubleCount(params,function(err,count){
		totalCount = count[0].count;
	beanRelationService.getBeanDoubleList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.beanStarTime != null){
				item.beanStarTime = dateUtils.formatDate(item.beanStarTime);
			}
			if(item.beanEndTime != null){
				item.beanEndTime = dateUtils.formatDate(item.beanEndTime);
			}
			if(item.createDate != null){
				item.createDate = dateUtils.formatDate(item.createDate);
			}
			if(item.beanStarTime >= date){
				item.state = -1;//未开始
			}else if (item.beanEndTime < date){
				item.state = 0;//已结束
			}else if(date >= item.beanStarTime && date <= item.beanEndTime){
				item.state = 1;//进行中
			}
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/bean_double_list',{doubleList:results,totalCount:totalCount,currentPage:index,params:params});
		});
	});
	});
});

/**
 *新增豆币加倍UI 
 */
router.get('/admin/bean-double-addUI',function(req,res){
	res.render('admin/user/bean_double_add');
});
/**
 *新增豆币加倍 
 */
router.post('/admin/bean-double-add',function(req,res){
	var beanStarTime = req.body.beanStarTime;
	var beanEndTime = req.body.beanEndTime;
	var type = req.body.type;
	var beanMultiple = req.body.beanMultiple;
	var beanMultipleValue = req.body.beanMultipleValue;
	var params = {
		beanDoubleState:1,
		beanStarTime:beanStarTime,
		beanEndTime:beanEndTime,
		type:type,
		beanMultiple:beanMultiple
	};
	if(beanMultiple == 0){
		params.beanMultiple = beanMultipleValue;
	}
	beanRelationService.createBeanDouble(params,function(err,obj){
		res.redirect('/admin/bean-double-list');
	});
});
/**
 *删除 豆币加倍列表记录
 */
router.get('/admin/delete-bean-double',function(req,res){
	var beanDoubleId = req.query.beanDoubleId;
	beanRelationService.deleteBeanDouble({beanDoubleId:beanDoubleId},function(err,obj){
		res.redirect('/admin/bean-double-list');
	});
});

/**
 *打卡礼品列表 
 */
router.get("/admin/recordGiftList",function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord,
		isSubstance:req.query.isSubstance,
		state:req.query.state,
		order:req.query.order?req.query.order:null
	};
	var totalCount = 0;
	userService.getRecordGiftCount(params,function(err,count){
		totalCount = count[0].count;
	userService.getRecordGiftList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.createDate != null){
				item.createDate = dateUtils.formatDate(item.createDate);
			};
			if(item.exchangeDate != null){
				item.exchangeDate = dateUtils.formatDate(item.exchangeDate);
			};
			var userId = item.userId;
			var addressState = 0;
			async.parallel([
				function(callbacl1) {
					addressService.getUserAddress({
						userId: userId
					}, function(err, obj) {
						if (null == obj) {
							addressState = 0;
						} else {
							addressState = 1;
						}
						callbacl1(null, addressState);
					});
				}
			], function(err, result) {
				item.addressState = addressState;
				callback(null, item);
			});
		}, function(err, results) {
			res.render('admin/user/record_gift_list',{list:results,totalCount:totalCount,currentPage:index,params:params});
		});
	});
	});
});
/**
 *打卡礼品   update 
 */
router.post('/admin/recordGiftUpdate',function(req,res){
	var id = req.body.id;
	var state = req.body.state;
	var ticketId = req.body.ticketId;
	var userId = req.body.userId;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var params = {
		updateDate:date,
		state:state
	};
	if(state == 0){
		userService.updateRecordGift({id:id},params,function(err,obj){
			res.redirect("/admin/recordGiftList");
		});
	}else if(state ==1){
		params.exchangeDate = date;
		userService.updateRecordGift({id:id},params,function(err,obj){
			res.redirect("/admin/recordGiftList");
		});
	}else if(state ==2){
		params.exchangeDate = date;
		async.parallel([
			function(callback0){
				userService.updateRecordGift({id:id},params,function(err,obj){
					callback0(null,obj);
				});	
			},
			function(callback1){
				bagService.getBag({userId:userId,ticketId:ticketId},function(err,list){
					var bag = list[0];
					if(bag != null){
						var ticketAmount = bag.ticketAmount;
						if(ticketAmount > 1){//修改操作
							bagService.updateBag({bagId:bag.bagId},{ticketAmount:(ticketAmount-1)},function(err,obj){
								callback1(null,obj);
							});
						}else{//删除操作
							bagService.deleteBag({bagId:bag.bagId},function(err,obj){
								callback1(null,obj);
							});
						}
					}
				});
			}
		], function(err, result) {
			res.redirect("/admin/recordGiftList");
		});	
	}else{
		res.redirect("/admin/recordGiftList");
	}
});
/**
 *删除打卡礼品表 
 */
router.get('/admin/deleteRecordGift',function(req,res){
	var id = req.query.id;
	userService.deleteRecordGift({id:id},function(err,obj){
		res.redirect("/admin/recordGiftList");
	});
});

/**
 *删除组织打卡记录 
 */
router.get('/admin/deleteOrgRecord',function(req,res){
	var recordId = req.query.recordId;
	userService.deleteOrgRecord({recordId:recordId},function(err,obj){
		res.redirect("/admin/org_record_list");
	});
});
/**
 *每日打卡情况列表 
 */
router.get("/admin/record", function(req, res) {
	var startDate = req.query.startDate;
	var endDate = req.query.endDate;
	var order = req.query.order;
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var params = {
		startDate: startDate,
		endDate: endDate,
		order: order,
		pageSize: pageSize,
		pageIndex: pageIndex
	};
	var totalCount = 0;
	userService.getUserEverydayCount(params, function(err, count) {
		totalCount = count.length;
		userService.getUserEverydayData(params, function(err, list) {
			async.map(list, function(item, callback) {
				async.parallel([
					function(callback0) {
						userService.getUserEverydayRecorde({
							userId: item.userId,
							createDate: item.createDate
						}, function(err, obj) {
							callback0(null, obj);
						});
					}
				], function(err, resul) {
					item.recordeCount = resul[0][0].recordeCount;
					callback(null, item);
				});
			}, function(err, results) {
				res.render('admin/everyday_recorde_list', {
					list: list,
					totalCount: totalCount,
					currentPage: index,
					params: params
				});
			});
		});
	});
});

/**
 *产生验证码 
 */
router.post("/identifying-code",function(req,res){
	var str = "",
 	arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9','q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j',
 				'k','l','z','x','c','v','b','n','m','Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L',
 				'Z','X','C','V','B','N','M'];
 	for(var i=0;i<4;i++){
		 var pos = Math.round(Math.random() * (arr.length-1));
	 	str += arr[pos];
 	}
 	myClient.setValue('identifyingCode', 60, str, null);
 	res.json(str);
});


module.exports = router;

