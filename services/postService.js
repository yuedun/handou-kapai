"use strict";
/**
 * 帖子服务处理
 * @type {User|exports}
 */
var moment = require('moment');
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var queryStr = require('../models/sqlFile/queryStr'), query = new queryStr();
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();
var postModel = require('../models/app-models/PostModel');

var postService = function (){};

/**
 * ***********************************************************************
 * 注释里面包含了SNS的都为对旧版本的帖子数据操作。（新帖子不适用）
 * ***********************************************************************
 */


/**
 * 根据id查询用户-sequelize
 * @param params
 * @param callback
 */
postService.getPostById = function (params, callback) {
	sequelize.query(query.sharePost(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function (results) {
		if(results.length != 0){
			sequelize.query(query.pictures(params), {
				type: sequelize.QueryTypes.SELECT
			}).then(function (results2) {
				sequelize.query(query.comments(params), {
					type: sequelize.QueryTypes.SELECT
				}).then(function (results3) {
					results[0].pictureList = results2;
					results[0].commentList = results3;
					callback(results[0]);
				});
			});
		} else{
			callback(null);
		}
	});
};

/**
 * 根据帖子ID获取帖子对象信息
 * @param {Object} params
 * @param {Object} callback
 */
postService.getSnsPostById = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		postModel.findOne({
			where:{
				postId:params.topicId
			}
		}).then(function(obj){
			callback(null, obj);
		});
	}
};

/**
 * 获取SNS列表  
 * @param {Object} params
 * @param {Object} callback
 */
postService.getSnsObj = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.snsList(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(postlist){
			callback(null, postlist);
		});
	}
};

/**
 * 获取SNS帖子详情
 * @param {Object} params
 * @param {Object} callback
 */
postService.getSnsPostDetails = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.snsPostByPostId(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(postlist){
			callback(null, postlist);
		});
	}
};

/**
 * 修改SNS帖子的点赞数
 * @param {Object} params
 * @param {Object} callback
 */
postService.editPostLikeCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var params2 = {
			postId:params.postId,
			value:params.value
		};
		sequelize.query(postQuery.updatePostLikeCount(params2), {
            type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
	}
};


/**
 * 修改SNS帖子的分享数
 * @param {Object} params
 * @param {Object} callback
 */
postService.editPostShareCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var params2 = {
			postId:params.postId,
			value:1
		};
		sequelize.query(postQuery.updatePostShareCount(params2), {
                type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
	}
};


/**
 * ***********************************************************************
 * 以下为新版本V3.0数据库表
 * ***********************************************************************
 */


module.exports = postService;