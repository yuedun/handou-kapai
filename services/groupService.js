"use strict";
var async = require('async');
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var util = require('util');
var GroupModel = require('../models/app-models/GroupModel');
var UserModel = require('../models/app-models/UserModel');
var GroupUserModel = require('../models/app-models/GroupUserModel');
var TopicModel = require('../models/app-models/TopicModel');
var OrgUserRelationModel = require('../models/app-models/OrgUserRelationModel');
var Constants = require('../utils/constants');
var dateUtils = require('../utils/dateUtils');
var IdCard = require('../models/app-models/IdCardModel');
// 粉丝团模块SQL文件
var GroupMapper = require('../models/sqlFile/fansGroupStr'),
	groupMapper = new GroupMapper();

var factory = {};
/**
 * 频道页-粉丝团频道-明星列表5条数据
 * @param params
 * @param callback
 */
factory.getGroupListByChannelQuantity = function(params, callback) {
	sequelize.query(groupMapper.getGroupListByChannels(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	}).catch(function(err){
		callback(err);
	});

};
/**
 * edit by hp
 * 根据id查询明星
 * @param params
 * @param callback
 */
factory.getGroupById = function (params, callback) {
	GroupModel.findById(
		params.groupId,
		{
			attributes: params.attributes
		}
	).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * edit by hp
 * 根据id查询明星
 * @param params
 * @param callback
 */
factory.getGroupByParams = function (params, callback) {
	GroupModel.findOne({
		where:{
			groupId:params.groupId,
			groupState: params.groupState
		},
		attributes: params.attributes
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 创建明星
 * @param params
 * @param callback
 */
factory.createStar = function (params, callback) {
	GroupModel.create({
		starId: uuid.v1(),
		starName: params.starName,
		starState: params.starState,
		starLogo: params.starLogo,
		fanCount: params.fanCount,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(star){
		callback(null, star);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 修改明星信息
 * @param params
 * @param callback
 */
factory.updateStar = function(starId, params, callback) {
	GroupModel.update(params, {
		where: {
			groupId: starId
		}
	}).then(function(obj) {
		callback(null, obj);
	});
};
/**
 * by hp
 * 修改粉丝数
 */
factory.updateGroupFansCount = function(params, callback){
	sequelize.query(groupMapper.updateGroupFansCount(params), {
		type: Sequelize.QueryTypes.UPDATE,
		replacements: params
	}).spread(function(results, metadata){
		callback(null, results);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * by hp
 * 修改身份卡号
 */
factory.updateCardNum = function(params, callback){
	sequelize.query(groupMapper.updateCardNum(params), {
		type: Sequelize.QueryTypes.UPDATE,
		replacements: params
	}).then(function(results){
		var gparams = {
			groupId: params.groupId,
			attributes: ['cardNumber', 'groupName']
		};
		factory.getGroupById(gparams, function(err, obj){
			callback(null, obj);
		});
	}).catch(function(err){
		callback(err);
	});
};
/**
 * by hp
 * 首次订阅明星列表
 * @param params
 * @param callback
 */
factory.getStarList = function(params, callback) {
	GroupModel.findAll({
		attributes: params.attributes,
		include: [{model: GroupUserModel, where:{userId:params.userId}, attributes: ['groupRelationId', 'selectionState'], required:false}],
		offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
		limit: params.pageSize == null ? 10 : params.pageSize,
		order: [['fan_count', 'DESC']]
	}).then(function(list) {
		callback(null, list);
	});
};
/**
 * by hp
 * 我选择的明星列表
 * @param params
 * @param callback
 */
factory.getMyStarList = function(params, callback) {
	GroupUserModel.findAll({
		where: {
			userId:params.condition.userId,
			selectionState: params.condition.selectionState
		},
		attributes: [],
		include:[{model:GroupModel, attributes:params.attributes}],
		order: [['update_date','DESC']]
	}).then(function(list) {
		callback(null, list);
	});
};
/**
 * by hp
 * 禁用原有的明星与用户首次订阅关系
 * @param params
 * @param callback
 */
factory.upGroupUserRelation = function(params, callback) {
	GroupUserModel.update(params.upFields,{
		where: {userId:params.userId, groupId: params.groupId}
	}).then(function(int) {
		callback(null, int);
	});
};
/**
 * by hp
 * 查询粉丝团粉丝数和用户是否加入该粉丝团
 * @param params
 * @param callback
 */
factory.getGroupFansCount = function(params, callback) {
	GroupModel.findById(params.groupId, {
		attributes: ['groupName', 'fanCount'],
		include:[{model:GroupUserModel, where: {userId: params.userId}, attributes:['groupRelationState']}]
	}).then(function(obj) {
		callback(null, obj);
	});
};

/**
 * by hp
 * 绑定用户明星关系，先查询之前是否加入过
 * @param params
 * @param callback
 */
factory.setUserStarRelation = function(params, callback) {
	var newGroupId = params.groupId;//如果使用params.groupId会出现变量污染情况
	GroupUserModel.findOne({
		where: {
			userId: params.userId,
			groupId: params.groupId
		},
		attributes: ['groupRelationId', 'userId', 'groupId', 'groupRelationState']
	}).then(function(obj){
		if(obj) {
			//存在关系时修改选择状态
			GroupUserModel.update({selectionState: 1, updateDate: moment().format("YYYY-MM-DD HH:mm:ss")}, {
				where: {
					userId: params.userId,
					groupId: newGroupId
				}
			}).then(function(obj2){
				callback(null, obj2);
			}).catch(function(err){
				callback(err);
			});
		} else {
			//不存在时创建
			GroupUserModel.create({
				groupRelationId: uuid.v1(),
				userId: params.userId,
				groupId: newGroupId,
				selectionState: 1,
				userType: params.userType,
				createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
				updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
			}).then(function(obj3) {
				callback(null, obj3);
			}).catch(function(err){
				callback(err);
			});
		}
	});
};
/**
 * 用户加入粉丝团，已经选择了明星，此处为加入（修改加入状态）
 * @param groupId string 粉丝团id
 * @param params Object 修改的字段
 * @param callback
 */
factory.joinOrOutGroup = function(params, condition, callback) {
	GroupUserModel.update(params, {
		where: {
			userId: condition.userId,
			groupId: condition.groupId
		}
	}).then(function(obj) {
		callback(null, obj);
	});
};

/**
 * 添加身份卡
 * @param params
 * @param callback
 */
factory.addIDCard = function(params, callback) {
	IdCard.create({
		cardId: uuid.v1(),
		userId: params.userId,
		groupId: params.groupId,
		cardNumber: params.cardNumber,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	},{raw: true}).then(function(obj) {
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 回收身份卡
 * @param params
 * @param callback
 */
factory.recoverIDCard = function(params, condition, callback) {
	IdCard.update(params,{
		where:{
			userId: condition.userId,
			groupId: condition.groupId
		}
	}).then(function(obj) {
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	})
};


/**
 * 我的身份卡及详情
 */
factory.getIDCardAndDetail = function(params,callback){
	sequelize.query(groupMapper.getIdCard(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	});
};

/**
 * by Star
 * 粉丝团动态
 * @param {Object} params
 * @param {Object} callback
 */
factory.fansDynamic = function(params, callback){
	sequelize.query(groupMapper.fansTopic(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	});
};
/**
 * by hp
 * 粉丝团下的组织列表
 * @param params
 * @param callback
 */
factory.getGroupsOrg = function(params, callback){
	sequelize.query(groupMapper.getGroupsOrg(params), {
		type: sequelize.QueryTypes.SELECT,
		replacements:params
	}).then(function(results) {
		callback(null, results);
	});
};
/**
 * by hp
 * 用户退出粉丝团同时解除与组织的关系
 * @param params
 * @param callback
 */
factory.userQuitGroup = function(params, callback){
	OrgUserRelationModel.destroy({
		where:{orgId: params.orgId, userId: params.userId}
	}).then(function(int){
		callback(null, int);
	});
};

/**
 * 我关注的组织帖子
 * @param params
 * @param callback
 */
factory.iCareAboutOrg = function(params, callback){
	sequelize.query(groupMapper.iCareAbout(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	});
};
/**
 * by hp/admin
 * 后台管理获取明星列表
 * @param params
 * @param callback
 */
factory.getGroupList = function(params, callback) {
	async.waterfall([
		function(callback1) {
			//查询数量
			sequelize.query(groupMapper.getGroupListAndCount(params).count(), {
				type: sequelize.QueryTypes.SELECT,
				replacements: params
			}).then(function(counts) {
				callback1(null, counts[0]);
			}).catch(function(err){
				callback1(err);
			});
		},
		function(obj, callback2) {
			if(obj.count > 0){
				//查询数据列表
				sequelize.query(groupMapper.getGroupListAndCount(params).rows(), {
					type: sequelize.QueryTypes.SELECT,
					replacements: params
				}).then(function(result) {
					callback2(null, {rows:result, count: obj.count});
				}).catch(function(err){
					callback2(err);
				});
			} else {
				callback2(null, {rows: [], count: obj.count});
			}
		}
	], function (err, results) {
		if(err){
			callback(err);
		} else {
			callback(null, results);
		}
	});
};
/**
 * by hp /admin
 * @param params
 * @param callback
 */
factory.addGroup = function(params, callback){
	GroupModel.create({
		groupId: uuid.v1(),
		starName: params.starName,
		starLogo: params.starLogo,
		groupName: params.groupName,
		groupLogo: params.groupLogo,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj) {
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 韩豆后台         查询所有正常状态下的明星
 */
factory.getGroupListAll = function(params,callback){
	GroupModel.findAll({
		attributes: params.attributes,
		where:params.condition
	}).then(function(groupList){
		callback(null,groupList);
	});
};

factory.likeGroupListAll = function(params,callback){
	GroupModel.findAll({
		attributes:['groupId'],
		where:{
			groupState:1,
			starName:{
				like:'%'+params.keyWord+'%'
			}
		}
	}).then(function(groupList){
		callback(null,groupList);
	});
};

/**
 * by hp/admin
 * 用户粉丝团编号
 * @param params
 * @param callback
 */
factory.getGroupUser = function(params, callback){
	var userCon = {};
	if(params.condition.userName) userCon.userName = {$like: "%"+params.condition.userName+"%"};
	if(params.condition.nickName) userCon.nickName = {$like: "%"+params.condition.nickName+"%"};
	var cardCon = {cardState: 1};
	if(params.condition.cardNumber) cardCon.cardNumber = params.condition.cardNumber;
	IdCard.findAndCountAll({
		attributes: ['cardNumber', 'createDate'],
		where: cardCon,
		include: [{
			model: GroupModel,
			attributes: ['starName'],
			required: true
		}, {
			model: UserModel,
			where: userCon,
			attributes: ['nickName','userName'],
			required: true
		}],
		offset: params.offset,
		limit: params.limit,
		order: params.order
	}).then(function(groupList){
		callback(null, groupList);
	});
};
module.exports = factory;