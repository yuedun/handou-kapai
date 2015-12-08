'use strict';
/**
 * Created by admin on 2015/1/19.
 */
var uuid = require('../utils/uuid');
var moment = require('moment');
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var sqlQuery = require('../models/sqlFile/queryStr'), query = new sqlQuery();
var User = require('../models/User');
var UserModel = require('../models/app-models/UserModel');
var UserInfo = require('../models/UserInfo');
var InvitationCode = require('../models/app-models/InvitationCodeModel');
var OrgUserRelationModel = require('../models/app-models/OrgUserRelationModel');
var OrgUserRecordModel = require('../models/app-models/OrgUserRecordModel');
var TopicModel = require('../models/app-models/TopicModel');
var Address = require('../models/Address');
var AddressModel = require('../models/app-models/AddressModel');
var UserGift = require('../models/UserGift');
var OrgVerifyModel = require('../models/app-models/OrgVerifyModel');
var GroupUserModel = require('../models/app-models/GroupUserModel');
var GroupModel = require('../models/app-models/GroupModel');
var sqlUser = require("../models/sqlFile/User.js");
var async = require('async');
var MoneyModel = require('../models/app-models/MoneyModel');
var RecordGiftModel = require('../models/app-models/RecordGiftModel');
var ExchangeMoneyModel = require('../models/app-models/OrgExchangeMoneyModel');
var userService = function (){};
var config = require('../config/config');
/**
 * by hp
 * 根据id查询用户-sequelize,此方法用于老版本user表查询
 * @param params
 * @param callback
 */
userService.getUserById = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        User.findOne({
            where:{user_id:params.user_id,user_state:0},
            attributes: ['user_id','user_name'],
            include:[UserInfo]
        }).then(function(user){
            callback(null, user);
        }).catch(function(err){
            callback(err);
        });
    }
};
/**
 * by hp
 * 创建用户或组织
 * @param params
 * @param callback
 */
userService.createUser = function (params, callback) {
    UserModel.create({
        userId: uuid.v1(),
        userName: params.userName,
        nickName: params.nickName,
        userType: params.userType,
        orgToken: params.orgToken,
        approve: params.approve,
        headPortrait: params.headPortrait,
        password: params.userPassword,
        state: params.userState,
        bean: params.bean,
        fansCount: params.fansCount,
        createIp: params.creatorIp,
        country: params.country,
        countryCode: params.countryCode,
        deviceId: params.deviceId,
        osVersion:params.osVersion,
        softwareVersion: params.softwareVersion,
        platformType: params.platformType,
        mobileType: params.mobileType,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(user){
        callback(null, user);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 获取用户地址 老版本方法
 * @param params
 * @param callback
 */
userService.getUserAddress = function (params, callback) {
    Address.find({
        where: params
    }).then(function(address){
        callback(null, address);
    });
};
/**
 * 咖派
 * 获取用户地址 老版本方法
 * @param params
 * @param callback
 */
userService.getKpUserAddress = function (params, callback) {
    AddressModel.find({
        where: params
    }).then(function(address){
        callback(null, address);
    });
};
/**
 * by hp
 * 根据参数查询用户
 * @param params
 * @param callback
 */
userService.getUserByParam = function (params, attrs, callback) {
    UserModel.findOne({
        where: params,
        attributes:attrs
    }).then(function(obj){
        callback(null, obj);
    });
};
/**
 * by hp
 * @param condition Object where条件
 * @param params Object 需要修改的字段键值对
 * @param callback(err, obj)
 */
userService.updateUser = function(condition, params, callback) {
    UserModel.update(params, {
        where: condition
    }).then(function(obj) {
        callback(null, obj);
    }).catch(function(err) {
        callback(err);
    });
};

/**
 * 得到用户信息 ---账号管理
 * @param params
 * @param callback
 */
userService.getUserInfo = function(params, callback) {
	UserModel.findOne({
        where: {
            userId: params.userId
        },
        attributes: params.attributes
    }).then(function(obj) {
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 修改密码 ---账号管理
 * @param params
 * @param callback
 */
userService.updateUserPassword = function(params,callback){
	if(params === ''){
		callback('参数为空');
	}else{
		UserModel.update(params,{
			where:{userId:params.userId}
		}).then(function(obj){
			callback(null,obj);
		});
	}
};
/**
 * by hp
 * 查询手机号或设备号是否注册过
 * @param params
 * @param callback
 */
userService.getUserByDeviceOrPhone = function(params,callback){
    UserModel.findOne({
        where:{ userType: params.userType, state: params.state, $or:[{userName:params.userName}, {deviceId: params.deviceId}]},
        attributes: ['userName', 'deviceId']
    }).then(function(obj){
        callback(null,obj);
    });
};
/**
 * by hp
 * 查询邀请码
 * @param params
 * @param callback
 */
userService.getInvitationCode = function(params, callback){
    InvitationCode.findOne({
        where:{ code: params.code, state: 1},
        attributes:['code']
    }).then(function(obj){
        callback(null,obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 修改邀请码使用次数
 * @param params
 * @param callback
 */
userService.updateCodeUserCount = function(params, callback){
    sequelize.query(sqlUser.updateCodeUserCount(params),{
        type: Sequelize.QueryTypes.UPDATE
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 修改积分
 * @param {Object} params        userId:object.userId,attributes:['userId','bean'],beanValue
 * @param {Object} callback
 */
userService.updateUserBean = function(params, callback){
	sequelize.query(sqlUser.updateUserBean(params),{
        type: Sequelize.QueryTypes.UPDATE
    }).then(function(obj){
    	 userService.getUserInfo(params,function(err, obj3){
            callback(null, obj3);
         });
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 查看昵称是否已存在
 * @param {Object} params
 * @param {Object} callback
 */
userService.getUserInfoByNameCount = function(params,callback){
	 if(params === ''){
        callback('参数为空');
    }else{
    	UserModel.count({
    		where:{nickName:params.nickName,
    			userId:{
    				not:params.userId
    			}
    		}
    	}).then(function(count){
    		callback(null,count);
    	});
    }
};

/**
 * by hp
 * 根据id查询
 * @param params{userId, attrs}
 * @param callback
 */
userService.getOrgById = function (params, callback) {
    UserModel.findById(params.userId, {attributes: params.attrs}).then(function(obj){
        callback(null, obj);
    });
};

/**
 * by hp
 * 根据参数查询我的组织列表
 * @param params
 * @param callback
 */
userService.getMyOrgList = function (params, callback) {
    sequelize.query(query.getMyOrgList(params),{
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function(orgList){
        callback(null, orgList);
    });
};
/**
 * by hp
 * 首页查看更多组织列表,根据粉丝数排序
 * @param params
 * @param callback
 */
userService.getOrganizationList = function (params, callback) {
    params.offset = (params.pageIndex == null ? 0 : (params.pageIndex - 1) * params.pageSize);
    params.limit = (params.pageSize == null ? 10 : params.pageSize);
    UserModel.findAll({
        where: {userType: params.userType, state: params.state},
        attributes: params.attrs,
        include: [{model: OrgVerifyModel, where: {groupId: params.groupId, verifyState: 1}, attributes: [], required: true}],
        offset: params.offset,
        limit: params.limit,
        order: [['fans_count', 'desc']]
    }).then(function(obj){
        callback(null, obj);
    });
};
/**
 * by hp/admin
 * 内部组织列表
 * @param params
 * @param callback
 */
userService.getOrgList = function (params, callback) {
    params.offset = (params.pageIndex == null ? 0 : (params.pageIndex - 1) * params.pageSize);
    params.limit = (params.pageSize == null ? 10 : params.pageSize);
    UserModel.findAndCountAll({
        where:{userType: params.userType},
        attributes: params.attrs,
        include: [{
            model: OrgVerifyModel,
            where:{orgType:"inner"},
            attributes:['groupId'],
            include:[{
                model: GroupModel,
                attributes:['starName'],
                required: true
            }],
            required: true
        }],
        offset: params.offset,
        limit: params.limit,
        order:[['fans_count','DESC']]
    }).then(function(obj){
        callback(null, obj);
    });
};

/**
 * by hp
 * 统计打卡数
 * @param params Object
 * @param callback(err, obj)
 */
userService.getRecordCount = function(params, callback) {
    sequelize.query(query.todayRecord(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count[0]);
    });
};

/**
 * by hp
 * 获取用户在该组织今日是否打卡
 * @param params Object 需要修改的字段键值对
 * @param callback(err, obj)
 */
userService.getRecord = function(params, callback) {
    sequelize.query(query.todayIsRecord(params),{
       type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
       callback(null, count[0]);
    });
    // OrgUserRecordModel.findOne({
    //     where: {
    //         orgId: params.orgId,
    //         userId: params.userId
    //     },
    //     order: [['create_date','desc']]
    // }).then(function(obj) {
    //     callback(null, obj);
    // }).catch(function(err){
    //     callback(err);
    // });
};
/**
 * by hp
 * 组织信息和用户关注信息（用户是否关注该组织）
 * @param params Object 需要修改的字段键值对
 * @param callback(err, obj)
 */
userService.getOrgAndUser = function(params, callback) {
    OrgUserRelationModel.findOne({
        attributes:['relationId','orgId','userId'],
        where: {userId: params.userId, orgId:params.orgId}
    }).then(function(obj) {
        callback(null, obj);
    })
};
/**
 * by hp
 * 新增打卡记录
 * @param params Object 需要修改的字段键值对
 * @param callback(err, obj)
 */
userService.createRecord = function(params, callback) {
    OrgUserRecordModel.create({
        recordId: uuid.v1(),
        orgId: params.orgId,
        userId: params.userId,
        createDate:  moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(count) {
        callback(null, count);
    })
};

/**
 * by hp
 * 用户取消关注组织
 * @param params
 * @param callback
 */
userService.userUnfollowOrg = function (params, callback) {
    OrgUserRelationModel.destroy({
        where:{orgId: params.orgId, userId: params.userId}
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by ls
 * 得到组织粉丝
 * @param params Object
 * @param callback(err, obj)
 */
userService.getOrgFens = function(params, callback){
    var orgSql = {};
    if(params === ''){
        callback('参数为空');
    }else{
        if(params.direction === 'refresh') {
            orgSql.where = {orgId:params.userId};
        }else{
            orgSql.where = {orgId:params.userId,
                createDate:{
                    lt:params.lastDate
                }
            };
        }
        if(params.pageSize != null) {
            orgSql.limit = params.pageSize;
        }else{
            orgSql.limit = Constants.DEFAULT_PAGE_SIZE;
        }
        OrgUserRelationModel.findAll({
            attributes:['userId','createDate'],
            where:orgSql.where,
            include:[{model: UserModel, where: {state:1}, attributes:['userId', 'nickName', 'headPortrait']}],
            //offset: params.offset == null ? 0 : (params.offset - 1) * params.limit,
            limit: orgSql.limit,
            order: [
                ['create_date','DESC']
            ]
        }).then(function(list){
            callback(null,list);
        });
    }
};
/**
 * by ls
 * 新增组织与用户的关系      -->> 关注组织
 * @param params Object
 * @param callback(err, obj)
 */
userService.createOrgUserRel = function(params, callback){
    OrgUserRelationModel.create({
        relationId:uuid.v1(),
        orgId:params.orgId,
        userId:params.userId,
        createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj){
        callback(null, obj);
    });
};

/**
 * by hp
 * 查询组织今日发帖数
 * @param params Object
 * @param callback(err, obj)
 */
userService.getOrgPostCount = function(params, callback) {
    sequelize.query(query.orgPostCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(obj){
        callback(null, obj);
    });
};
/**
 * by hp
 * 发帖数和频道数
 * @param params{userId, attrs}
 * @param callback
 */
userService.getOrgTopicCount = function (params, callback) {
    TopicModel.count({
        where:{userId: params.userId, topicState: 1}
    }).then(function(obj){
        callback(null, obj);
    });
};
/**
 * by hp
 * 昨日最活跃组织
 * @param params{userId, attrs}
 * @param callback
 */
userService.getMostActiveOrg = function (params, callback) {
    sequelize.query(query.getMostActiveOrg(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(obj){
        callback(null, obj);
    });
};

/**
 * 通过条件查询组织审核记录
 * 组织用户登陆时需要判断是否通过审核，通过的传递groupId到前端
 * @param params
 * @param callback
 */
userService.getUserVerifyByParam = function(params, callback){
    OrgVerifyModel.findOne({
        where: params
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 韩豆后台         组织审核
 */
userService.getUserVerifyList = function(params,callback){
	 sequelize.query(query.getUserVerifyList(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    });
};
/*
 * 查询组织审核记录数     韩豆后台
 */
userService.getUserVerifyCount = function(params,callback){
	sequelize.query(query.getUserVerifyCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    });
};
/**
 * 统计总打卡数          韩豆后台
 */
userService.getOrgCount = function(params,callback){
	OrgUserRecordModel.count({
		where:params
	}).then(function(count){
		callback(null,count);
	});
};
/**
 * 修改组织审核           韩豆后台
 */
userService.updateUserVerify = function(con,params,callback){
	OrgVerifyModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
        callback(err);
    });
};
/**
 * 查询组织审核        韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
userService.getUserVerifyObj = function(params, callback){
	OrgVerifyModel.findOne({
		where:params
	}).then(function(obj){
		callback(obj);
	});
};

/**
 * 新增组织审核        韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
userService.createOrgVerify = function(params, callback){
	OrgVerifyModel.create({
		orgVerifyId:uuid.v1(),
		userId:params.userId,
		verifier:params.verifier,
		orgType:params.orgType,
		groupId:params.groupId,
		verifyState:params.verifyState,
		verifyDate:params.verifyDate,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * 查询组织每日打卡数及活跃度         韩豆后台
 */
userService.getUserEverydayData = function(params,callback){
	sequelize.query(query.getUserEverydayData(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    });
};

/**
 * 查询记录数       打卡      韩豆后台
 */
userService.getUserRecordeCount = function(params,callback){
	sequelize.query(query.getUserRecordeCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    });
};

/**
 * 查询每日打卡数          韩豆后台
 */
userService.getUserEverydayRecorde = function(params,callback){
	sequelize.query(query.getUserEverydayRecorde(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    });
};
/**
 * 查询组织每日发帖           韩豆后台
 */
userService.getUserTipicByActive = function(params,callback){
	sequelize.query(query.getUserTipicByActive(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    });
};

/**
 * 统计记录数       韩豆后台
 */
userService.getUserTipicByActiveCount = function(params,callback){
	sequelize.query(query.getUserTipicByActiveCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 统计每日活跃度         韩豆后台
 */
userService.getUserEverydayActive = function(params,callback){
	sequelize.query(query.getUserEverydayActive(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    });
};
/**
 * by hp/admin
 * 明星下组织数         韩豆后台
 */
userService.getGroupOrgCount = function(params,callback){
    GroupUserModel.count({
        where: params
    }).then(function(c){
        callback(null, c);
    });
};

/**
 * 验证userName是否已存在           韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
userService.checkUserName = function(params,callback){
	 if(params === ''){
        callback('参数为空');
    }else{
    	UserModel.count({
    		where:{nickName:params.userName,
    			userId:{
    				not:params.userId
    			}
    		}
    	}).then(function(count){
    		callback(null, count);
    	});
    }
};

/**
 * 物理删除组织          韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
userService.deleteUser = function(params, callback){
	UserModel.destroy({where:params}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * 物理删除组织        韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
userService.deleteUserVerify =function(params, callback){
	OrgVerifyModel.destroy({where:params}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
        callback(err);
    });
};
/**
 * 得到用户
 */
userService.getUserList = function(params,callback){
	sequelize.query(query.getUserList(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
//得到用户的记录数
userService.getUserCount = function(params,callback){
	sequelize.query(query.getUserCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 组织打卡记录
 */
userService.getOrgRecordAllList = function(params,callback){
	sequelize.query(sqlUser.getOrgRecordAllList(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 记录数
 * @param {Object} params
 * @param {Object} callback
 */
userService.getOrgRecordAllListCount = function(params,callback){
	sequelize.query(sqlUser.getOrgRecordAllListCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 模糊查询组织
 */
userService.likeOrg = function(params,callback){
	UserModel.findAll({
		attributes:['userId'],
		where:{
			state:params.state,
			userType:params.userType,
			nickName:{
				like:'%'+params.nickName+'%'
			}
		}
	}).then(function(list){
		callback(null,list);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * by hp/admin
 * 组织每日打卡
 * @param params
 * @param callback
 */
userService.getRecordList = function (params, callback){
    sequelize.query(query.getOrgRecordListAndCount(params),{
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function(result){
        callback(null, result);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 新增豆币兑换金钱记录      韩豆后台
 */
userService.addMoney = function(params,callback){
	MoneyModel.create({
		moneyId:uuid.v1(),
		bean:params.bean,
		money:params.money,
		state:params.state,
		sort:params.sort,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 豆币兑换金钱列表          韩豆后台
 */
userService.getMoneyList = function(params,callback){
	MoneyModel.findAll({
		where:params,
		order: [['sort', 'DESC'],['create_date', 'DESC']]
	}).then(function(list){
		callback(null, list);
	}).catch(function(err){
		callback(err);
	});
};
/**
 *  by hp
 *  添加兑换记录
 */
userService.cashRecord = function(params, callback){
    ExchangeMoneyModel.create({
        id: uuid.v1(),
        orgId: params.orgId,
        money: params.money,
        bean: params.bean,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 删除豆币兑换金钱记录
 */
userService.deleteMoney = function(params,callback){
	MoneyModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 修改豆币兑换金钱记录
 */
userService.updateMoney = function(con,params,callback){
	MoneyModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/***
 * 得到专辑券兑换列表
 */
userService.getExchangeList = function(params,callback){
	sequelize.query(sqlUser.getExchangeList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
//得到专辑兑换记录数
userService.getExchangeCount = function(params,callback){
	sequelize.query(sqlUser.getExchangeList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 用户签到情况
 */
userService.getUserSignList = function(params,callback){
	sequelize.query(sqlUser.getUserSignList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 用户签到记录数
 */
userService.getUserSignCount = function(params,callback){
	sequelize.query(sqlUser.getUserSignList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 签到记录
 */
userService.getUserSignRecordList = function(params,callback){
	sequelize.query(sqlUser.getUserSignRecordList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 签到记录count
 */
userService.getUserSignRecordCount = function(params,callback){
	sequelize.query(sqlUser.getUserSignRecordList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by hp
 * 修改组织粉丝数
 */
userService.updateOrgFansCount = function(params, callback){
	sequelize.query(sqlUser.updateOrgFansCount(params), {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: params
    }).spread(function(results, metadata){
        callback(null, results);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 外部组织登录
 */
userService.getOuterOrgLogin = function(params,callback){
	sequelize.query(sqlUser.getOuterOrgLogin(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 打卡礼品列表
 */
userService.getRecordGiftList = function(params,callback){
	sequelize.query(sqlUser.getRecordGiftList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null,list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 打卡礼品列表count
 */
userService.getRecordGiftCount = function(params,callback){
	sequelize.query(sqlUser.getRecordGiftList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null,count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 修改打卡礼品
 */
userService.updateRecordGift = function(con,params,callback){
	RecordGiftModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
        callback(err);
    });
};
/**
 * 删除打卡礼品
 */
userService.deleteRecordGift = function(params,callback){
	RecordGiftModel.destroy({
        where:{id:params.id}
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 删除打卡记录
 */
userService.deleteOrgRecord = function(params,callback){
	OrgUserRecordModel.destroy({
		where:params	
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 组织兑换记录   money
 */
userService.getOrgExchangeMoneyList = function(params,callback){
	sequelize.query(sqlUser.getOrgExchangeMoneyList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null,list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 组织兑换记录count   money
 */
userService.getOrgExchangeMoneyCount = function(params,callback){
	sequelize.query(sqlUser.getOrgExchangeMoneyList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null,count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 查询组织兑换记录
 */
userService.getOrgExchangeMoneyObj = function(params,callback){
	ExchangeMoneyModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 物理删除组织兑换记录
 */
userService.deleteExchangeLog = function(params,callback){
	ExchangeMoneyModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 修改组织兑换记录
 */
userService.updateExchangeLog = function(con,params,callback){
	ExchangeMoneyModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * by hp/admin
 * 查询组织绑定的粉丝团
 */
userService.getOrgsGroup = function(params, callback){
	OrgVerifyModel.findOne({
		where:params.condition,
        attributes: params.attr
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 查询组织审核
 * @param {Object} params
 * @param {Object} callback
 */
userService.getUserOrgInfo = function(params,callback){
	sequelize.query(sqlUser.getUserOrgInfo(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(obj){
        callback(null,obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 内部组织列表
 */
userService.getInnerOrgList = function(params,callback){
	sequelize.query(sqlUser.getInnerOrgList(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null,list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 内部组织列表count
 */
userService.getInnerOrgCount = function(params,callback){
	sequelize.query(sqlUser.getInnerOrgList(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null,count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 内部组织列表count
 */
userService.getUserEverydayCount = function(params,callback){
	sequelize.query(query.getUserEverydayCount(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null,count);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 获取所有激活组织列表
 * @param {Object} params
 * @param {Object} callback
 */
userService.getActivateOrgList = function(params, callback){
	sequelize.query(sqlUser.getActivateOrgList(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(activateOrgList){
        callback(null,activateOrgList);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * in手机号码匹配查询多个
 * (个人)用户信息(适合少量数据查询)
 * @param {Object} params
 * @param {Object} callback
 */
userService.getUserByPhones = function(params, callback){
	sequelize.query(sqlUser.getUserByPhones(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(useridList){
        callback(null,useridList);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 我的组织  接口
 * @param {Object} params
 * @param {Object} callback
 */
userService.getUserByOrg = function(params, callback){
	sequelize.query(sqlUser.getUserByOrg(params),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null,list);
    }).catch(function(err){
        callback(err);
    });
};

module.exports = userService;