'use strict';
/**
 * Created by admin on 2015/7/17.
 */
var moment = require('moment');
var uuid = require('../utils/uuid');
var videlModel = require('../models/app-models/VidelModel');
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();
var videoService = function (){};

/**
 * 条件查询
 * @param {Object} params
 * @param {Object} callback
 */
videoService.findOneVideo = function(params, callback){
	videlModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 获取视频的数量 和 列表
 * @param {Object} params
 * @param {Object} callback
 */
videoService.getVideoList = function(params, callback){
	// 条件
	var condition = {
		videoState:1
	};
	if(params.intro) condition.videoDesc = {$like: "%"+params.intro+"%"};
	videlModel.findAndCountAll({
		where: condition,
		offset: params.offset,
		limit: params.limit,
		order: params.order
	}).then(function(videoList){
		callback(null, videoList);
	});
}

/**
 * 创建视频
 * @param {Object} params
 * @param {Object} callback
 */
videoService.createVideo = function(params, callback){
	videlModel.create({
		videoId: params.videoId,
		videoDesc: params.videoDesc,
		videoAddress: params.videoAddress,
		picture: params.picture,
		videoTag: params.videoTag,
		likeCount: 0,
		shareCount: 0,
		readCount: 0,
		videoState: 1,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
    	updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null,obj);
	});
};

/**
 * 根据条件修改
 * @param {Object} setValue 要修改的值
 * @param {Object} params	条件
 * @param {Object} callback	回调
 */
videoService.updateVideoByParams = function(setValue, params, callback){
	videlModel.update(setValue, {
		where:params
	}).then(function(obj){
        callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 修改阅读量
 * @param {Object} params
 * @param {Object} callback
 */
videoService.editVideoInfo = function(params, callback){
	sequelize.query(postQuery.editVideoReadCountById(params),{
		type: Sequelize.QueryTypes.UPDATE
	}).then(function(obj){
		callback(null, obj);
	});
};

/**
 * 获取视频信息(热门 / 最新)
 * @param {Object} params	参数
 * @param {Object} callback 回调
 */
videoService.getVideoInfo = function(params, callback){
	sequelize.query(postQuery.getVideoInfo(params),{
		type: Sequelize.QueryTypes.SELECT
	}).then(function(videolist){
		callback(null, videolist);
	});
};

/**
 * 官网视频列表
 * @param {Object} params
 * @param {Object} callback
 */
videoService.officiaVideoList = function(params, callback){
	sequelize.query(postQuery.officiaVideoList(params),{
		type: Sequelize.QueryTypes.SELECT
	}).then(function(videolist){
		callback(null, videolist);
	});
};

/**
 * 官网相关视频列表
 * @param {Object} params
 * @param {Object} callback
 */
videoService.officiaTagVideoList = function(params, callback){
	sequelize.query(postQuery.officiaTagVideoList(params),{
		type: Sequelize.QueryTypes.SELECT
	}).then(function(videolist){
		callback(null, videolist);
	});
};

module.exports = videoService;