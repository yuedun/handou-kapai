var async = require('async');
var express = require('express');
var router = express.Router();
var config = require('../config/config');
var dateUtil = require('../utils/dateUtils');
var userService = require('../services/UserService');
var topicService = require('../services/TopicService');
var topicPostService = require('../services/topicPostService');
var groupService = require('../services/groupService');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var addressService = require('../services/addressService');
var invitationCodeService = require('../services/InvitationCodeService');
var commentService = require('../services/CommentService');
var commonService = require('../services/commonService');
var moment = require('moment');
var myClient = require('../utils/redisDB').myClient;
var commonUtil = require('../utils/commonUtil');
/**
 * 管理后台登陆页
 */
router.get('/login',function(req, res){
	res.render('admin/login',{});
});

/**
 * 管理后台首页
 */
router.get('/',function(req,res){
	res.render('admin/index',{});
});

/**
 * 管理后台登陆
 */
router.post('/login', function(req,res){
	var identifyingCode = req.body.identifyingCode;
	var params = {
		userName:req.body.username,
		password:req.body.password
	};
	myClient.select('identifyingCode', function(err, reply) {
	if(reply){
		if(identifyingCode.toLowerCase() == reply.toLowerCase()){
		var attrs = ['userId','userName','nickName','password','headPortrait'];
			userService.getUserByParam({userName:params.userName},attrs,function(err,kpUser){
				if(kpUser){
					console.log(" userName = "+kpUser.userName + "  , password = " + kpUser.password);
					// 如果组织用户存在则判断密码是否正确
					if(commonUtil.encrypt(params.password) == kpUser.password){
					//if(params.password == kpUser.password){
						// 登陆成功将用户设置到session中
						req.session.regenerate(function(){
							// 将用户信息存入session中
							req.session.sessionUser = kpUser;
							req.session.save(function(err){
								if(err){
									console.log('会话保存失败!');
								} else {
									console.log('会话保存成功!');
								}
								res.json({message:'登陆成功!',code:0000});
							});
						});
					} else {
						// 密码不正确，返回提示用户
						res.json({message:'密码错误!',code:4005});
					}
				} else {
					res.json({message:'组织不存在!',code:4010});
				}
			});
		}else{
			res.json({message:'验证码不正确!',code:4011});
		}
	}else{
		res.json({message:'验证码已过期!',code:4011});
	}
	});	
});

/**
 * 管理后台登出[销毁session]
 */
router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			console.log('session 销毁失败!');
		} else {
			console.log('session 销毁成功!');
			res.redirect('/admin/login');
		}
	});
});


/**
 * 删除七牛服务器文件
 */
router.get('/image/delete/:key',function(req, res){
	qiniu.delImage("handou-kapai",req.params.key, function(err){
		if(err){
			res.json(err.message);
		} else {
			res.send("success");
		}
	});
});

/**
 * by hp
 * 组织管理
 */
router.get('/org', function(req, res){
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params = {
		userType: "org",
		pageIndex :pageIndex,
		pageSize : pageSize,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord?req.query.keyWord:null,
		state:req.query.state,
		order:req.query.order
	};
	var totalCount = 0;
	userService.getInnerOrgCount(params,function(err,count){
		totalCount = count[0].count;
	});
	userService.getInnerOrgList(params, function(err, list){
		async.map(list, function(item, callback){
			if(item.createDate != null){
				item.createDate = dateUtil.formatDate(item.createDate);
			}
			if(item.updateDate != null){
				item.updateDate = dateUtil.formatDate(item.updateDate);
			}
			callback(null, item);
		}, function(err, results){
			res.render("admin/org_list", {objList:results, currentPage:index, totalCount:totalCount,params:params});
		});
	});
});
/**
 * by hp
 * 添加组织
 */
router.get('/org-add-ui', function(req, res){
	var params = {
		attributes:['groupId', 'starName'],
		condition: {groupState: 1}
	};
	groupService.getGroupListAll(params, function(err, list){
		res.render('admin/org_add',{status:true, qntoken: qiniutoken, groupList: list});
	});
});
/**
 * by hp
 * 创建组织
 */
router.post('/org', function(req, res){
	var object = req.body;
	var org = {
		nickName:object.nickName,
		headPortrait:object.starLogo,
		centerBackground:object.starBG,
		groupId:object.groupId,
		userName: object.userName,
		userPassword: commonUtil.encrypt(object.password),
		fansCount: 0,
		userType: "org",
		state: object.state? 1: 0
	};
	var paramsUser = {
		nickName: object.nickName,
		userName : object.userName,
		password: commonUtil.encrypt(object.password),
		headPortrait: object.starLogo,
		centerBackground: object.starBG,
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}
	if (object.userId){
		userService.updateUser({userId:object.userId}, paramsUser, function(err, obj){
			userService.updateUserVerify({userId:object.userId},{updateDate:moment().format("YYYY-MM-DD HH:mm:ss"),groupId:object.groupId},function(err,obj){
				if(err){
					res.render('admin/org_update', {status: false});
				} else{
					res.redirect('/admin/org');//跳转到列表
				}
			});
		});
	} else {
		userService.createUser(org, function(err, obj){
			var params2 = {
				userId: obj.getDataValue("userId"),
				groupId: object.groupId,
				orgType: "inner",
				verifyState: 1
			};
			userService.createOrgVerify(params2, function(err, obj2){
				if(err){
					var params3 = {
						attributes:['groupId','starName'],
						condition: {groupState: 1}
					};
					groupService.getGroupListAll(params3, function(err, list){
						res.render('admin/org_add',{status:true, qntoken: qiniutoken, groupList: list});
					});
				} else{
					res.redirect('/admin/org');//跳转到列表
				}
			});
		});
	}
});
/**
 * by hp
 * 组织帖子
 */
router.get('/org/:orgId/topic', function(req, res){
	var dateFlag = moment().format("YYYY-MM-DD HH:mm:ss");
	var stateFlag = req.query.stateFlag;
	var userId = req.params.orgId;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params ={
		userId:userId,
		topicType:3,
		topicState:-1,
		postChoose:req.query.postChoose?req.query.postChoose:null,
		keyWord:req.query.keyWord,
		order:req.query.order,
		isRecommend:req.query.isRecommend,
		startDate:req.query.startDate,
		endDate:req.query.endDate,
		pageSize:pageSize,
		pageIndex:pageIndex
	}
	
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
				item.createDate = dateUtil.formatDate(item.createDate);
			}
			if(null != item.updateDate){
				item.updateDate = dateUtil.formatDate(item.updateDate);
			}
			if(null != item.timedReleaseDate){
				item.timedReleaseDate = dateUtil.formatDate(item.timedReleaseDate);
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
			res.render('admin/org_topic_list', {
				objList: results,totalCount:totalCount,currentPage:index,orgId:userId,params:params
			});
		});	
	});
});
/**
 * by hp
 * 修改组织状态
 */
router.get('/orgUpdate/:userId', function(req, res){
	var paramsGroup = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	};
	var params = {};
	var action = req.query.action;
	//edit编辑  unpost取消发布  post发布  recover恢复删除  del删除
	if(action === "edit"){
		params.userId = req.params.userId;
		params.attributes = ['userId','userName','nickName'];
	} else if (action == "unpost"){
		params = {state: 0}
	} else if (action == "post"){
		params = {state: 1}
	} else if (action == "recover"){
		params = {state: 0}
	} else if (action == "del"){
		params = {state: -1}
	}
	if(action === "edit"){
		async.parallel([
			function(callback0){
				userService.getUserOrgInfo(params, function(err, obj){
					callback0(null,obj);
				});
			},
			function(callback1){
				groupService.getGroupListAll(paramsGroup,function(err,groupList){
					callback1(null,groupList);
				});
			}
		],function (err, result) {
			if(result[0][0].password && result[0][0].password.length == 32){
				result[0][0].password = commonUtil.decrypt(result[0][0].password);
			}	
			res.render("admin/org_update", {
				obj:result[0][0],groupList:result[1],status:true,qntoken: qiniutoken
			});
		});	
		
	} else {
		userService.updateUser({userId: req.params.userId}, params, function(err, obj){
			res.redirect("/admin/org");
		});
	}
});

/**
 * 用户管理列表
 */
router.get('/getUserList', function(req, res) {
	var totalCount = 0;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var stateFlag = req.query.stateFlag?req.query.stateFlag:null;
	var params = {
		state :-1,
		stateFlag:stateFlag,
		userType: 'user',
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate : req.query.startDate,
		endDate : req.query.endDate,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord,
		uorder:req.query.uorder
	};
	userService.getUserCount(params,function(err,count){
		totalCount = count[0].count;
	userService.getUserList(params, function(err, list) {
		async.map(list, function(item, callback) {
			if (item.createDate != null) {
				item.createDate = dateUtil.formatDate(item.createDate);
			}
			if (item.updateDate != null) {
				item.updateDate = dateUtil.formatDate(item.updateDate);
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
			res.render("admin/user/user_list", {
				userList: results,currentPage:index,totalCount:totalCount,params:params
			});
		});
	});
	});
});

/**
 * 修改用户状态
 */
router.get('/update-user-state',function(req,res){
	var state = req.query.userState;
	var userId = req.query.userId;
	userService.updateUser({userId:userId},{state:state},function(err, obj){
		res.redirect("/admin/getUserList");
	});
});

/**
 * 物理删除用户
 */
router.get('/chedidelete-user',function(req,res){
	var userId = req.query.userId;
	userService.deleteUser({userId:userId},function(err,obj){
		res.redirect("/admin/getUserList");
	});
});

/**
 * 得到用户地址
 */
router.get('/getAddressforUser',function(req,res){
	var userId = req.query.userId;
	var flag = req.query.flag;
	addressService.getUserAddress({userId:userId},function(err,obj){
		if(null != obj){
			res.render("admin/user/user_address", {user:obj,flag:flag});
		}else{
			
		}
	});
});

/**
 * by hp/admin
 * 每日打卡
 */
router.get('/record', function(req, res){
	var object = req.query;
	var params = {

	};
	userService.getRecordList(params, function(err, result){
		res.render('admin/org_record_list', {objList: result.rows, currentPage: 1, totalCount: 21});
	});
});

/**
 * by Star / admin
 * 邀请码列表
 */
router.get('/invitationCodeList', function(req, res){
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;
	var params = {
		choose: object.choose,
		keyword: object.keyword,
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order:"create_date desc"
	};
	if(object.order === "timeasc"){
		params.order = "create_date asc";
	}
	if(object.order === "timedesc"){
		params.order = "create_date desc";
	}
	invitationCodeService.getInvitationCode(params, function(err, invitationCodeList){
		if(err){
			res.render('error',{message:err.message});
		} else {
			res.render('admin/invitationCode_list',{
				invitationCodeList:invitationCodeList.rows,currentPage:pageIndex, totalCount:invitationCodeList.count,params:params
			});
		}
	});
});

/**
 * by Star / admin
 * 新增邀请码
 */
router.post('/invitationCodeAdd', function(req, res){
	var object = req.body;
	var userId = req.session.sessionUser.userId;
	var params = {
		userId:userId,
		nickName:object.NickName,
		phone:object.Phone,
		userName:object.NickName,
		code:object.Code,
		useCount:0
	};
	invitationCodeService.createInvitationCode(params, function(err, obj){
		res.redirect("/admin/invitationCodeList");
	});
});

/**
 * by Star / admin
 * 邀请码编辑页面
 */
router.get('/invitationCode-edit-ui', function(req, res){
	var object = req.query;
	var params = {
		invitationCodeId:object.invitationCodeId,
		attributes:['invitationCodeId','useCount','state']
	};
	// 获取邀请码基本信息
	invitationCodeService.getInvitationCodeInfo(params, function(err, obj){
		res.render("admin/invitationCode_edit",{
			ic:obj
		});
	});
});

/**
 * by Star / admin
 * 修改邀请码
 */
router.post('/invitationCodeEdit', function(req, res){
	var object = req.body;
	// 需要修改的值
	var setValue = {
		useCount:object.useCount,
		state:object.state
	};
	// 条件
	var params = {
		invitationCodeId:object.invitationCodeId
	};
	invitationCodeService.editInvitationCode(setValue, params, function(err, obj){
		res.redirect("/admin/invitationCodeList");
	});
});

/**
 * 获取用户日志信息
 */
router.get('/getUserLogs',function(req,res){
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var postChoose = req.query.postChoose;
	var keyWord = req.query.keyWord;
	var startDate = req.query.startDate?req.query.startDate:null;
	var endDate = req.query.endDate?req.query.endDate:null;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		postChoose:postChoose,
		keyWord:keyWord,
		startDate:startDate,
		endDate:endDate
	};
 	var totalCount = 0;
	commonService.getUserLogsCount(params,function(err,count){
		totalCount = count[0].count;
		commonService.getUserLogs(params,function(err,logList){
			logList.forEach(function(item,index){
				item.createDate = dateUtil.formatDate(item.createDate);
			});
			res.render('admin/user/log_list',{logList:logList,currentPage:index,totalCount:totalCount,params:params});
		});
	});
});

/**
 * 删除用户日志
 */
router.get('/deleteUserLogs',function(req,res){
	var lid = req.query.lid;
	commonService.deleteUserLogs({lid:parseInt(lid)},function(err,obj){
		qiniu.delImage("handou-kapai",req.query.key, function(err){
			res.redirect("/admin/getUserLogs");
		});
	});
});	

/**
 * 批量删除用户日志
 */
router.get('/batchDeleteLogs', function(req, res) {
	var ids = [];
	ids.push(req.query.ids);
	var keys = req.query.keys.toString();
	var qiniuKeys = keys.split(',');
	var idsLength = ids.length - 1;
	var keysLength = qiniuKeys.length-1;
	async.parallel([

		function(callback1) {
			ids.forEach(function(item, index) {
				commonService.deleteUserLogs({
					lid: item
				}, function(err, obj) {
					if (index == idsLength) {
						callback1(null, obj)
					}
				});
			});
		},
		function(callback2) {
			qiniuKeys.forEach(function(item,index){
				qiniu.delImage("handou-kapai",item, function(err) {
					if (index == keysLength) {
						callback2(null, null);
					}
				});
			})
		}
	], function(err, result) {
		res.redirect("/admin/getUserLogs");
	});
});


module.exports = router;
