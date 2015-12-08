'use strict';
var sequelize = require('../utils/sequelizeDB');
var TopicModel = require('../models/app-models/TopicModel');
var UserModel = require('../models/app-models/UserModel');
var uuid = require('../utils/uuid');
var Constants = require('../utils/constants');
var util = require('util');
var dateUtils = require('../utils/dateUtils');
var config = require('../config/config.json');
// 频道模块SQL文件
var ChannelMapper = require('../models/sqlFile/channelStr'),
	channelMapper = new ChannelMapper();

var factory = {};

/**
 * by hp
 * 创建频道
 * @param params
 * @param callback
 */
factory.createChannel = function(params, callback) {
	TopicModel.findAll({
		where: {
			topicName: params.name
		}
	}).then(function(data) {
		if (data.length > 0) {
			callback('频道名称重复了~~~');
		} else {
			TopicModel.create({
				topicId: uuid.v1(),
				topicName: params.name,
				topicScope: params.scope,
				topicDesc: params.desc,
				userId: params.userId,
				groupId: params.groupId,
				topicType: params.topicType,
				topicState: Constants.STATE.ACTIVE,
				createDate: dateUtils.formatDate(),
				updateDate: dateUtils.formatDate()
			}).then(function(data) {
				callback(null, data);
			}).catch(function(err){
				callback(err);
			});
		}
	});
};

/**
 * 粉丝团下频道列表
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
factory.getGroupChannels = function(params, callback) {
	sequelize.query(channelMapper.getGroupChannels(params), {
		type: sequelize.QueryTypes.SELECT,
		replacements: params
	}).then(function(results) {
		callback(null, results);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 查询推荐频道列表
 * 以热度排序分页
 * @param params
 * @param callback
 */
factory.getRecommendedChannelList = function(params, callback) {
	sequelize.query(channelMapper.getTopChannelList(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	}).catch(function(err){
		callback(err);
	});

};

/**
 * 查询最新频道列表
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
factory.getChannels = function(params, callback) {
	sequelize.query(channelMapper.getChannels(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	});
};
/**
 * by hp
 * 获取频道下发帖数
 * @param params
 * @param callback
 */
factory.getChannelsPostCount = function(params, callback) {
	TopicModel.count({
		where:{parentTopicId: params.pTopicId, topicState: params.topicState}
	}).then(function(c){
		callback(null, c);
	});
};
/**
 * by hp
 * 官网频道列表
 * @param params
 * @param callback
 */
factory.portalTopic = function(params, callback) {
	sequelize.query(channelMapper.portalTopic(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(null, results);
	});
};

module.exports = factory;