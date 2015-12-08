'use strict';
/**
 * Created by huopan on 2015/7/9.
 */
var async = require('async');
var responseObj = require('../../models/ResponseObj.js');
var userService = require('../../services/UserService.js');
var channelService = require('../../services/ChannelService.js');
var smsUtil = require('../../utils/SmsUtil.js');
var dateUtils = require('../../utils/dateUtils.js');
var myClient = require('../../utils/redisDB').myClient;
var moment = require('moment');
var config = require('../../config/config');
var beanRelationService = require('../../services/BeanRelationService.js');
var qiniu = require('../../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var Constants = require('../../utils/constants');
var commonUtil = require('../../utils/commonUtil');
var messagePushService = require("../../services/MessagePushService.js");
var bagService = require("../../services/BagService.js");
var commonService = require("../../services/commonService.js");
var myClient = require('../../utils/redisDB').myClient;
var messageService = require('../../services/messageService');
var UserController = function(){};

/**
 * by hp
 * 用户注册
 * @param req
 * @param res
 */
UserController.register = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
		userName : object.userName,
		userType : 'user',
		nickName : "hd_" + object.userName.substring(0, 3) + object.userName.substring(7, 11),
		userPassword: object.userPassword,
		creatorIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		country: object.country,
		countryCode: object.countryCode,
		deviceId:req.body.deviceId,
		osVersion:req.body.osVersion,
		softwareVersion: req.body.softwareVersion+"",
		platformType: req.body.platformType,
		mobileType: req.body.mobileType
	};
	var resObj = responseObj();
	resObj.command = command;
	//手机号或设备号是否注册
	var findParam = {userName: object.userName, deviceId: req.body.deviceId, userType: "user", state: 1};
	userService.getUserByDeviceOrPhone(findParam, function(err, obj){
		if(obj){
			if(obj.getDataValue('userName') === object.userName){
				resObj.errMsg(4014, "手机号已注册！");
				res.send(resObj);
			} else if(obj.getDataValue('deviceId') === req.body.deviceId){
				resObj.errMsg(4013, "设备号已注册！");
				res.send(resObj);
			}
		} else {
			//用户填写了邀请码加积分
			if(object.invitationCode && object.invitationCode !== ''){
				params.bean = 300;//初始化用户逗比为300分
				userService.getInvitationCode({code: object.invitationCode}, function(err, codeObj){
					if(codeObj){
						async.parallel([
							function(callback){
								//创建用户
								userService.createUser(params, function(err, obj){
									callback(null, obj);
								});
							},
							function(callback){
								var codeParam = {
									code: codeObj.getDataValue("code")
								};
								//修改邀请码使用次数
								userService.updateCodeUserCount(codeParam, function(err, obj){
									callback(null, obj);
								});
							}
						], function(err, result){
							if(err){
								resObj.errMsg(5001, JSON.stringify(err.message));
								res.send(resObj);
							}else{
								res.send(resObj);
							}
						});
					} else {
						resObj.errMsg(4015, "邀请码不存在！");
						res.send(resObj);
					}
				});
			}else{
				userService.createUser(params, function(err, obj){
					if(err){
						resObj.errMsg(5001, "数据读写异常"+err.message);
						res.send(resObj);
					}else{
						res.send(resObj);
					}
				});
			}
		}
	});
};
/**
 * by hp
 * 用户登陆
 * @param req
 * @param res
 */
UserController.login = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {};
	var condition = ['userId','userName','nickName','headPortrait','password','gender', 'birthday','centerBackground','fansCount','bean','userType','thisLife'];
	var resObj = responseObj();
	resObj.command = command;
	if(object.userType == Constants.USER_TYPE.USER){
		params.user_name = object.userName;
		params.password = object.userPassword;
		params.state = 1; //用户可用
		userService.getUserByParam(params, condition, function(err, obj){
			if(null == obj){
				resObj.errMsg(4010, '用户名或密码错误！');
				res.send(resObj);
			}else{
				resObj.object = {
					userId: obj.getDataValue("userId"),
					userName: obj.getDataValue("userName"),
					nickName: obj.get("nickName"),
					headPortrait: commonUtil.headPortrait(obj),
					userPassword: obj.getDataValue("password"),
					userType: 3,
					gender: obj.getDataValue("gender"),
					birthday: obj.getDataValue("birthday")?obj.getDataValue("birthday"):'',
					centerBackground: obj.get("centerBackground")?config.qiniu.kp_site + obj.get("centerBackground"): config.qiniu.kp_site + config.qiniu.def_kp_bg,
					bean: obj.getDataValue("bean"),
					thisLife: obj.getDataValue("thisLife")?obj.getDataValue("thisLife"):'',
					qntoken: qiniutoken
				};
				res.send(resObj);
				// 往LeanCloud上面注册
				var messageParams = {
					userId:obj.getDataValue("userId"),
					installationId:object.installationId,
					deviceToken:object.deviceToken,
					deviceType:req.body.platformType,
					softwareVersion: req.body.softwareVersion+""
				};
				messagePushService.registerUser(messageParams);
			}
		});
	}else if(object.userType == Constants.USER_TYPE.ORGANIZATION){
		//登陆用户是组织的时候先注册再返回注册后的信息
		params= {
			userType : 'org',
			nickName : object.nickName,
			headPortrait : object.headPortrait,
			orgToken : object.userId,
			approve: 0,//是否认证
			fansCount: 0,
			creatorIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			deviceId:req.body.deviceId,
			osVersion:req.body.osVersion,
			softwareVersion: req.body.softwareVersion+"",
			platformType: req.body.platformType,
			mobileType: req.body.mobileType
		};
		//登陆用户是组织的时候先注册再返回注册后的信息
		userService.getUserByParam({orgToken:object.userId}, condition, function(err, obj){
			if(obj){
				resObj.object = {
					userId: obj.getDataValue("userId"),
					userName: object.userId,
					nickName:  obj.getDataValue("nickName"),
					headPortrait: commonUtil.headPortrait(obj),
					centerBackground: obj.get("centerBackground")?config.qiniu.kp_site + obj.get("centerBackground"): config.qiniu.kp_site + config.qiniu.def_kp_bg,
					bean: obj.getDataValue("bean"),
					userType: 1,
					groupId: '',
					firstSign:false,
					qntoken: qiniutoken
				};
				//不是第一次登陆，需要groupId
				userService.getUserVerifyByParam({userId: obj.userId}, function(err, verifyObj){
					if(verifyObj){
						resObj.object.groupId = verifyObj.getDataValue("groupId");//通过审核的组织才有粉丝团id
						resObj.object.approve =  verifyObj.getDataValue("verifyState"); //审核过使用数据库值，未审核默认未通过
					}
					res.send(resObj);
				});
				var messageParams = {
					userId:obj.getDataValue("userId"),
					installationId:object.installationId,
					deviceToken:object.deviceToken,
					deviceType:req.body.platformType,
					softwareVersion: req.body.softwareVersion+""
				};
				messagePushService.registerUser(messageParams);
			}else {
				//第一次登陆，先注册
				userService.createUser(params, function (err, obj) {
					if(err){
						resObj.errMsg(5001, "数据读写异常"+err.message);
						res.send(resObj);
					}else{
						resObj.object = {
							userId: obj.getDataValue("userId"),
							userName: object.userId,
							nickName: obj.getDataValue("nickName"),
							headPortrait: commonUtil.headPortrait(obj),
							centerBackground: obj.get("centerBackground") ? config.qiniu.kp_site + obj.get("centerBackground") : config.qiniu.kp_site + config.qiniu.def_kp_bg,
							bean: obj.getDataValue("bean"),
							userType: 1,
							groupId: '',//新注册用户未通过审核没有粉丝团id
							approve: 0,//第一次注册审核未通过
							firstSign:true,
							qntoken: qiniutoken
						};
						res.send(resObj);
						// 往LeanCloud上面注册
						var messageParams = {
							userId:obj.getDataValue("userId"),
							installationId:object.installationId,
							deviceToken:object.deviceToken,
							deviceType:req.body.platformType,
							softwareVersion: req.body.softwareVersion+""
						};
						messagePushService.registerUser(messageParams);
					}
				});
			}
		});
	}
};

/**
 * 得到用户信息 ---账号管理      by ls
 * @param req
 * @param res
 */
UserController.getUserInfo = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var resObj = responseObj();
	resObj.command = command;
	async.parallel([
		function(callback) {
			var params = {
				userId: object.userId,
				attributes:['userId','userName','nickName','gender','birthday','thisLife','headPortrait','centerBackground','bean','userType','state']
			};
			userService.getUserInfo(params, function(err, obj) {
				if (err) {
					console.error(object.userId+">>>>>>>>>>>>>>>>"+err);
					callback(err);
				} else {
					console.log(object.userId+">>>>>>>>>>>>>>>>正常调用");
					callback(null, obj);
				}
			});
		},
		function(callback) {
			var params2 = {
				userId: object.userId,
				beanType: 3007,
				beanDate: moment().format("YYYY-MM-DD")
			};
			beanRelationService.getBeanRelation(params2, function(err, count) {
				if (err) {
					callback(err);
				} else {
					callback(null, count);
				}
			});
		}
	], function(err, result) {
		if (err) {
			resObj.errMsg(5001, "数据读取异常"+err);
			res.send(resObj);
		} else {
			resObj.object = {
				userId: result[0].getDataValue('userId'),
				nickName: result[0].getDataValue('nickName')?result[0].getDataValue('nickName'):'',
				gender: result[0].getDataValue('gender') == 0?'女':'男',
				birthday: result[0].getDataValue('birthday') ? dateUtils.formatBirthday(result[0].getDataValue('birthday')) : '',
				thisLife: result[0].getDataValue('thisLife') ? result[0].getDataValue('thisLife') : '',
				phone: result[0].getDataValue('userName'),
				userType: Constants.USER_TYPE.USER,
				bean: result[0].getDataValue('bean'),
				headPortrait: result[0].get('headPortrait')?config.qiniu.kp_site + result[0].get('headPortrait'):config.qiniu.kp_site + config.qiniu.defaul_user_head,
				centerBackground: result[0].get('centerBackground')?config.qiniu.kp_site + result[0].get('centerBackground'): config.qiniu.kp_site + config.qiniu.def_kp_bg,
				signInState: result[1] == 0 ? 0 : 1
			};
			res.send(resObj);
		}
	});
};

/**
 * 修改密码 ---账号管理   by ls
 * @param req
 * @param res
 */
UserController.updateUserPassword = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId: object.userId,//用户编号
		password:object.userOldPassword//旧密码
	};
	var params2 = {
		userId: object.userId,//用户编号
		password:object.userPassword,//新密码
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	var condition = ['userId','userName','password'];
	var resObj = responseObj();
	resObj.command = command;
	userService.getUserByParam(params,condition,function(err,obj){
		if(null == obj){
			resObj.errMsg( 4005, "密码错误！");
			res.send(resObj);
		}else{
			userService.updateUserPassword(params2,function(err,obj){
				resObj.object = obj;
				res.send(resObj);
			});
		}
	});
};

/**
 * by hp
 * 发送短信验证码
 * @param req
 * @param res
 */
UserController.sendMsg = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		destMobile: object.userName
	};
	var resObj = responseObj();
	resObj.command = command;
	//查询该验证手机是否注册
	userService.getUserByParam({userName:object.userName}, ['userId', 'userName'], function(err, obj){
		if(null == obj){
			resObj.errMsg( 4010, '用户不存在！');
			res.send(resObj);
		}else{
			//发送验证码
			smsUtil.sendCommon(params, function(err, result){
				if(result < 0){
					resObj.errMsg( 5002, '发送失败');
					res.send(resObj);
				}else{
					res.send(resObj);
				}
			});
		}
	});
};
/**
 * by hp
 * 找回密码,根据用户名user_name修改密码
 * @param req
 * @param res
 */
UserController.retrieve = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ['userName', 'userPassword', 'validateCode'])){
		return;
	}
	var params = {
		password: object.userPassword
	};
	var condition = {
		userName: object.userName
	};
	var resObj = responseObj();
	resObj.command = command;
	myClient.select(object.userName, function(err, reply){
		if(reply == object.validateCode){
			userService.updateUser(condition, params, function(err, obj){
				res.send(resObj);
			});
		}else{
			resObj.errMsg(4017, "验证码失效");
			res.send(resObj);
		}
	});
};


/**
 * 修改用户信息   ----账号管理      by ls
 * @param req
 * @param res
 */
UserController.updateUserInfo = function(req, res) {
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId: object.userId,
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		attributes:['userId','userName','nickName','gender','birthday','thisLife','headPortrait','centerBackground','bean','state']
	};
	if ('' != object.headPortrait && null != object.headPortrait && undefined != object.headPortrait) {
		params.headPortrait = object.headPortrait;
	}
	if ('' != object.centerBackground && null != object.centerBackground && undefined != object.centerBackground) {
		params.centerBackground = object.centerBackground
	}
	if ('' != object.nickName && undefined != object.nickName) {
		params.nickName = object.nickName.trimRight();
	}
	if (undefined != object.gender) {
		if('男' == object.gender){
			params.gender = 1;
		}
		if('女' == object.gender){
			params.gender = 0;
		}
	}
	if ('' != object.birthday && undefined != object.birthday) {
		params.birthday = object.birthday;
	}
	if (undefined != object.thisLife) {
		params.thisLife = object.thisLife;
	}
	var condition = {
		userId: object.userId
	};
	var params2 = {
		userId: object.userId,
		attributes:['userId','state']
	};
	var resObj = responseObj();
	resObj.command = command;
			userService.getUserInfoByNameCount(params, function(err, count) {
				if (count <= 0) {
					userService.updateUser(condition, params, function(err, obj) {
						userService.getUserInfo(params, function(err, obj2) {
							if (null == obj2) {
								resObj.errMsg(4010, '用户不存在！');
								res.send(resObj);
							} else {
								resObj.object = {
									userId: obj2.getDataValue('userId'),
									nickName: obj2.getDataValue('nickName')?obj2.getDataValue('nickName'):'',
									gender: obj2.getDataValue('gender')==0?'女':'男',
									birthday: obj2.getDataValue('birthday')?dateUtils.formatBirthday(obj2.getDataValue('birthday')):'',
									thisLife: obj2.getDataValue('thisLife')?obj2.getDataValue('thisLife'):'',
									phone: obj2.getDataValue('userName')?obj2.getDataValue('userName'):'',
									bean:obj2.getDataValue('bean'),
									headPortrait:  obj2.get('headPortrait')?config.qiniu.kp_site + obj2.get('headPortrait'):config.qiniu.kp_site + config.qiniu.defaul_user_head,
									centerBackground: obj2.get('centerBackground')?config.qiniu.kp_site + obj2.get('centerBackground'): config.qiniu.kp_site + config.qiniu.def_kp_bg
								};
								res.send(resObj);
							}
						});
					});
				} else {
					resObj.errMsg(5004, '昵称已存在,请重新输入！');
					res.send(resObj);
				}
			})
};


/**
 * by ls
 * 签到加豆币
 * @param req
 * @param res
 */
UserController.signIn = function(req, res) {
	var signInStateTemp = 0;
	var command = req.body.command;
	var object = req.body.object;
	var startOfDateTemp = moment(moment().format("YYYY-MM-DD")).startOf('month').format("YYYY-MM-DD");
	var endOfDateTemp = moment().format("YYYY-MM-DD");

	var params = {
		userId: object.userId,
		attributes: ['userId', 'bean','state'],
		beanType: Constants.BEAN_TYPE.SIGN,
		beanValue: 5
	};
	var params2 = {
		userId: object.userId,
		beanType: Constants.BEAN_TYPE.SIGN,
		beanDate: moment().format("YYYY-MM-DD")
	};
	var params3 = {
		userId: object.userId,
		beanType: Constants.BEAN_TYPE.SIGN,
		startOfDate: startOfDateTemp,
		endOfDate: endOfDateTemp
	};
	var resObj = responseObj();
	resObj.command = command;
	beanRelationService.getBeanRelation(params2, function(err, count) {
		if (count <= 0) {
			async.waterfall([
				function(callback0){
					beanRelationService.addOrUpdateSignCount(params3,function(signobj){
						callback0(null,signobj);
					});
				},
				function(signobj,callback){
					beanRelationService.findSignIn(params3,function(err,beanValue){
						if(0 != beanValue){
							params.beanValue = beanValue;
						}
						callback(null,beanValue);
					});
				},
				function(beanValue,callback1){
					beanRelationService.getBeanDouble(params.beanValue,{type:'sign'},function(beanValue){
						if (0 != beanValue) {
							params.beanValue = beanValue;
						}
						callback1(null,beanValue);
					});
				},
				function(beanValue,callback2){
					beanRelationService.createBeanRealtion(params,function(obj){
						userService.updateUserBean(params,function(err,obj2){
							callback2(null,obj2);
						});
					});
				}
			],function(err, result){
				if(err){
					resObj.errMsg(5001, "数据读取异常"+err);
				}else{
					signInStateTemp = 1;
					resObj.object ={
						signInState:signInStateTemp,
						userId:result.userId,
						bean:result.bean
					};
					var params6 = {
						userId:object.userId,			// 接受推送的人
						data:{
							userId:'999999',			// 发起推送的人
							headPortrait:commonUtil.headPortrait({headPortrait:""}), // 发起推送人的头像
							action:'app',					// 推送信息让客户端显示执行
							chatContent:"恭喜您签到成功,获得"+params.beanValue+"豆币!",	// 发起推送人昵称及推送内容
							officalType:3,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
							chatType:1,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
							postId:'',		// 帖子ID
							nickName:'韩豆官方',		// 发起人的用户昵称
							replayNickName:"",				// 接收方昵称
							replay:false					//
						}
					};
					// 调用推送方法
					messagePushService.sendMessage(params6);
					var params7 = {
						messageText:'恭喜您签到成功,获得'+params.beanValue+"豆币",
						sendUserId:'999999',		// 发起推送人
						reciveUserId:params.userId,	// 接收推送人
						topicId:'',		// 帖子ID
						pushGoal:"user",					// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
						chatType:1,							// 官方推送
						officalType:3,						// 0、评论 1、点赞 2、回复
						releaseDate:object.releaseDate ? object.releaseDate : new Date()
					};
					messageService.createMessage(params7, function(message){});
				}
				res.send(resObj);
			});
		} else {
			resObj.errMsg(5003, '已经签过到了！');
			res.send(resObj);
		}
	});
};

/**
 * by hp
 * 普通用户-我的组织，我关注的组织列表 改为明星下我所加入的组织，提出的bug要求
 * 明星首页中查看我的组织，查询字段：logo,name，今天发帖数
 * @param req
 * @param res
 */
UserController.viewOrganizationList = function(req, res){
	var object = req.body.object;
	if (commonUtil.paramsIsNull(req, res, ['userId', "groupId"])) return;
	var params= {
		userId: object.userId,
		groupId: object.groupId
	};
	var resObj = responseObj();
	resObj.command = req.body.command;
	userService.getMyOrgList(params, function(err, list){
		async.map(list, function(item, callback){
			//查询组织今日发帖量
			userService.getOrgPostCount({orgId: item.orgId }, function(err, obj){
				item.postCount = obj[0].count;
				callback(null, item);
			});
		}, function(err, results){
			resObj.object = [];
			results.forEach(function(item, index){
				var headPortrait = "";
				if(item.headPortrait) {
					//头像存在并且是微博头像
					if(item.headPortrait.indexOf("http") > -1){
						headPortrait =  item.headPortrait;
					} else {
						//修改后的头像
						headPortrait = config.qiniu.kp_site + item.headPortrait;
					}
				} else {
					headPortrait = config.qiniu.kp_site + config.qiniu.defaul_user_head;
				}
				resObj.object.push({
					userId: item.orgId,
					nickName: item.nickName,
					headPortrait: headPortrait,
					todayPostCount: item.postCount
				});
			});
			res.send(resObj);
		});
	});
};
/**
 * by hp
 * 更多组织
 * 明星首页中查看更多组织信息，查询字段：logo,name，粉丝数，按粉丝数排序
 * 需要在加入粉丝团后才能加入频道，groupId必须
 * @param req
 * @param res
 */
UserController.moreOrganizationList = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ['groupId'])){
		//如果有空值则retrun不继续往下执行
		return;
	}
	var params= {
		userType: "org",
		state: 1,
		groupId: object.groupId,
		pageIndex: object.pageIndex,
		pageSize: object.pageSize,
		attrs: ['userId', 'headPortrait', 'nickName', 'fansCount']
	};
	var resObj = responseObj();
	resObj.command = command;
	//组织信息
	userService.getOrganizationList(params, function(err, list){
		list.forEach(function(item, index){
			item.setDataValue("headPortrait", commonUtil.headPortrait(item));
		});
		resObj.object = list;
		res.send(resObj);
	});
};
/**
 * by hp
 * 普通用户查看单个组织信息
 * 1.组织基本信息，2.是否关注，3.是否打卡，4.打卡数
 * @param req
 * @param res
 */
UserController.userViewOrganization = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
		userId: object.userId,
		orgId: object.orgId
	};
	var attrs = ['userId','nickName','headPortrait','centerBackground','bean','fansCount'];
	var resObj = responseObj();
	resObj.command = command;
	async.auto({
		orgInfo: function (callback) {
			//查询组织基本信息
			userService.getOrgById({userId: object.orgId, attrs: attrs}, function (err, obj) {
				callback(null, obj);
			});
		},
		postCount: function (callback) {
			//发帖数+频道数
			userService.getOrgTopicCount({ userId: object.orgId }, function (err, obj) {
				callback(null, obj);
			});
		},
		orgVerify: ['orgInfo', function(callback, obj){
			userService.getUserVerifyByParam({userId: obj.orgInfo.getDataValue("userId")}, function(err, obj){
				callback(null, obj);
			});
		}],
		record:function (callback) {
			//今日已打卡数, 返回值为数字
			userService.getRecordCount({orgId: object.orgId}, function (err, obj) {
				callback(null, obj);
			});
		},
		userFollowOrg: function (callback) {
			if(object.userId !== object.orgId){
				//查询用户是否关注组织，非自己查看
				userService.getOrgAndUser(params, function (err, obj) {
					callback(null, obj);
				});
			}else{
				callback(null);
			}
		},
		todayRecord:['userFollowOrg',function (callback, result) {
			//此用户已关注则存在关联数据，再判断是否打卡
			if (result.userFollowOrg) {
				result.isFollow = true;//已关注
				userService.getRecord({orgId: object.orgId, userId: object.userId}, function (err, obj) {
					//有打卡记录，判断当日是否打卡
					if (obj) {
						result.isRecord = false;//是否可打卡
					} else {
						result.isRecord = true;
					}
					callback(null, result);
				});
			} else {
				result.isFollow = false;
				result.isRecord = false;
				callback(null, result);
			}
		}]
	},function(err, results){
		var fansCount = results.orgInfo.getDataValue("fansCount");//粉丝数
		var postCount = results.postCount;
		//组织信息和打卡数
		resObj.object = {
			userId: results.orgInfo.getDataValue("userId"),
			nickName: results.orgInfo.getDataValue("nickName"),
			headPortrait: commonUtil.headPortrait(results.orgInfo),
			centerBackground: results.orgInfo.getDataValue("centerBackground")?
			config.qiniu.kp_site + results.orgInfo.getDataValue("centerBackground"): config.qiniu.kp_site + config.qiniu.def_kp_bg,
			approve: results.orgVerify? results.orgVerify.getDataValue("verifyState"): 0,
			bean: results.orgInfo.getDataValue("bean"),
			fanCount: results.orgInfo.getDataValue("fansCount"),
			activeDegree: Math.round((fansCount/100) + postCount),//需要统计:总活跃=总粉丝数/100+发帖总数+创建频道总数（粉丝数除不进时，按四舍五入方式进行判断）
			recordCount: results.record.count,
			follow: results.isFollow,
			record: results.todayRecord.isRecord,//true可打卡，false不可打卡
			userType: Constants.USER_TYPE.ORGANIZATION
		};
		res.send(resObj);
	});
};

/**
 * by hp
 * 修改组织信息：头像，昵称，背景图
 * @param req
 * @param res
 */
UserController.orgUpdate = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
		nickName: object.nickName,
		headPortrait: object.headPortrait,
		centerBackground: object.centerBackground
	};
	var condition = {
		userId: object.userId
	};
	var resObj = responseObj();
	resObj.command = command;
	userService.updateUser(condition, params, function(err, obj){
		if (err) {
			resObj.errMsg(5000, err.err_msg);
		} else {
			res.send(resObj);
		}
	});
};

/**
 * by hp
 * 个人用户在关注的组织打卡
 * @param req
 * @param res
 */
UserController.userRecord = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ["userId", "orgId"])){
		//返回true代表有空值
		return;
	}
	var params= {
		orgId: object.orgId,
		userId: object.userId
	};
	var resObj = responseObj();
	resObj.command = command;
	//使用打卡券
	var params2 = {
		userId:object.userId,
		ticketId: 1,
		ticketAmount: 1
	};
	bagService.useDakaExchange(params2, function(err, obj){
		if(err){
			resObj.errMsg(5016, err.err_msg);
			res.send(resObj);
		} else {
			async.parallel([
				function(callback){
					//创建打卡记录:创建返回true，更新返回false
					userService.createRecord(params, function(err, obj){
						callback(err, obj);
					});
				},
				function(callback){
					var userParam = {
						userId: object.orgId,
						beanValue: 1,
						attributes:['userId']
					};
					//给组织加积分
					userService.updateUserBean(userParam, function(err, obj){
						callback(err, obj);
					});
				}
			], function(err, result){
				if(err){
					resObj.errMsg(5000, err.message);
					res.send(resObj);
				} else {
					res.send(resObj);
				}
			});
		}
	});
};
/**
 * by ls
 * 得到组织粉丝
 * @param req
 * @param res
 */
UserController.getOrgFens = function(req, res){
	var command = req.body.command;
	var params = req.body.object;
	/*var params= {
	 orgId: object.organizationId,
	 offset:object.offset,
	 limit:object.limit
	 };*/
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
	var resObj = responseObj();
	resObj.command = command;
	userService.getOrgFens(params,function(err,list){
		if(list.length <= 0){
			//resObj.errMsg(4001, "查询结果为空");
			resObj.object = [];
			res.send(resObj);
		}else{
			resObj.object = [];
			list.forEach(function(i,index){
				resObj.object.push({
					userId:i.getDataValue('user').getDataValue('userId'),
					nickName:i.getDataValue('user').getDataValue('nickName')?i.getDataValue('user').getDataValue('nickName'):Constants.NULL_NICK_NAME,
					headPortrait: i.getDataValue('user').getDataValue('headPortrait')?config.qiniu.kp_site + i.getDataValue('user').getDataValue('headPortrait'):config.qiniu.kp_site + config.qiniu.defaul_user_head,
					createDate:i.getDataValue('createDate')?dateUtils.formatDate(i.getDataValue('createDate')):i.getDataValue('createDate')
				});
			});
			res.send(resObj);
		}
	});
};
/**
 * by ls
 * 新增组织与用户的关系 -->> 关注组织或取消关注
 * @param req
 * @param res
 */
UserController.followOrUnFollowOrg = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ["orgId", "userId"])){
		//返回true代表有空值
		return;
	}
	var params= {
		orgId: object.orgId,
		userId:object.userId
	};
	var resObj = responseObj();
	resObj.command = command;
	if(object.action === 'follow'){
		//关注操作，需要修改组织粉丝数
		async.parallel([
			function(callback){
				//关注操作，需要修改组织粉丝数 创建关注记录
				userService.createOrgUserRel(params, function(err, obj){
					callback(null, obj);
				});
			},
			function(callback){
				//修改组织粉丝数
				userService.updateOrgFansCount({action: 1, orgId: object.orgId}, function(err, obj){
					callback(null, "");
				});
			},
			function(callback){
				//获取用户是否可打卡
				userService.getRecord(params, function (err, recordObj) {
					//有打卡记录，判断当日是否打卡
					var record = false;
					if (recordObj) {
						record = false;
					} else {
						record = true;
					}
					callback(null, record);
				});
			}
		], function(err, result){
			if(err){
				resObj.errMsg(5000, err.message);
				res.send(resObj);
			} else {
				messagePushService.subscribeChannel({userId:object.userId, channels:object.orgId});
				resObj.object = {
					record: result[2],
					action : "follow"
				};
				res.send(resObj);
			}
		});
	} else if(object.action === 'unFollow'){
		//取消关注组织，需要修改组织粉丝数
		async.parallel([
			function(callback){
				userService.userUnfollowOrg(params, function(err, obj){
					callback(null, obj);
				});
			},
			function(callback){
				userService.updateOrgFansCount({action: -1, orgId: object.orgId}, function(err, obj){
					callback(null, obj);
				});
			}
		], function(err, result){
			var arr = [];
			arr.push(object.orgId);
			if(err){
				resObj.errMsg(5000, err.message);
				res.send(resObj);
			} else {
				messagePushService.unsubscribeChannel({userId:object.userId, channels:arr});
				resObj.object.action = "unFollow";
				res.send(resObj);
			}
		});
	}
};

/**
 * by hp
 * 组织贴置顶/取消置顶
 * @param req
 * @param res
 */
UserController.topOrgTopic = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
		userId: object.userId
	};
	var resObj = responseObj();
	resObj.command = command;
	userService.userUnfollowOrg(params, function(err, obj){
		res.send(resObj);
	});
};
/**
 * by hp
 * 组织中心，我的豆币
 * @param req
 * @param res
 */
UserController.myBean = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var resObj = responseObj();
	resObj.command = command;
	userService.getMoneyList({state: 1}, function(err, list){
		resObj.object = list;
		res.send(resObj);
	});
};
/**
 * by hp
 * 豆币提现
 * @param req
 * @param res
 */
UserController.cashBean = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		orgId: object.userId,
		bean: object.bean,
		money: object.money
	};
	var resObj = responseObj();
	resObj.command = command;
	userService.cashRecord(params, function(err, obj){
		//提现减用户豆币
		var userParam = {
			userId: object.userId,
			attributes: ['bean'],
			beanValue: -(parseInt(object.bean))
		};
		userService.updateUserBean(userParam, function(err, obj){
			resObj.object = obj;
			res.send(resObj);
		});
	});
};
/**
 * by hp
 * 昨日最活跃组织
 * @param req
 * @param res
 */
UserController.mostActive = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	if(commonUtil.paramsIsNull(req, res, ["groupId"])) return;
	var params = {
		groupId: object.groupId
	};
	var cacheKey = "mostActive:"+object.groupId;
    var expire = 600;//单位秒
	var resObj = responseObj();
	resObj.command = command;
	myClient.select(cacheKey, function(err, obj){
		if (obj) {
			resObj.object = {
				userId: obj[0].userId,
				nickName: obj[0].nickName? obj[0].nickName: "暂无",
				active: obj[0].active,
				userType: obj[0].userType == 'org' ? 1: 3
			};
			res.send(resObj);
		} else {
			userService.getMostActiveOrg(params, function(err, obj){
				if(err){
					resObj.errMsg(5001, "数据读写异常");
					res.send(resObj);
				} else {
					resObj.object = {
						userId: obj[0].userId,
						nickName: obj[0].nickName? obj[0].nickName: "暂无",
						active: obj[0].active,
						userType: obj[0].userType == 'org' ? 1: 3
					};
					myClient.setValue(cacheKey, expire, resObj, null);
					res.send(resObj);
				}
			});
		}
	});
};

/**
 * by Star
 * 生产日志
 * @param req
 * @param res
 */
UserController.createLoginfo = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
		userId : object.userId,
		log : object.log,
		mobileType: req.body.mobileType,
		platformType: req.body.platformType,
		softwareVersion: req.body.softwareVersion+"",
		osVersion:req.body.osVersion
	};
	commonService.createLog(params, function(err, loginfo){
		console.log('loginfo = ' + loginfo);
	});
	var resObj = responseObj();
	resObj.command = command;
	res.send(resObj);
};


/**
 * 用户个人中心      我的组织
 */
UserController.getUserByOrg = function(req, res) {
	var command = req.body.command;
	var params = req.body.object;
	var resObj = responseObj();
	resObj.command = command;
	if(commonUtil.paramsIsNull(req, res, ['userId','pageSize','direction'])){
		return;
	}
	userService.getUserByOrg(params, function(err, list) {
		if(err){
			resObj.errMsg(5001, "数据读取异常"+err);
			res.send(resObj);
		}else{
			list.forEach(function(i, index) {
				i.headPortrait = commonUtil.headPortrait({headPortrait: i.headPortrait});
				i.lastDate=dateUtils.formatDate(i.lastDate);
				i.createDate=dateUtils.formatDate(i.createDate);
			});
			resObj.object = list;
			res.send(resObj);
		}
	});
};

module.exports = UserController;