"use strict";
/**
 * 点赞关系服务处理
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var LikeRelationModel = require('../models/app-models/LikeRelationModel');
var CommentLikeRelationModel = require('../models/app-models/CommentLikeRelationModel');
var UserLikeRelationModel = require('../models/app-models/UserLikeRelationModel');

var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();

var likeRelationService = function(){};

/**
 * ***********************************************************************
 * 注释里面包含了SNS的都为对旧版本的帖子数据操作。（新帖子不适用）
 * ***********************************************************************
 */


/**
 * SNS帖子点赞数
 * @param {Object} params
 * @param {Object} callback
 */
likeRelationService.getPostLikeCountObj = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.postLikeCount(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(postLikeCount){
			callback(null, postLikeCount);
		});
	}
};

/**
   * 用户是否对SNS帖子点过赞
   * @param {Object} params
   * @param {Object} callback
   */
likeRelationService.getPostLikeRelation = function(userId,params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		LikeRelationModel.findOne({
			where:{
				postId:params.postId,
				userId:userId
			}
		}).then(function(results){
			callback(null, results);
		});
	}
};

/**
   * 创建用户对SNS帖子的点赞关系
   * @param {Object} params
   * @param {Object} callback
   */
likeRelationService.createPostLikeRelation = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		LikeRelationModel.create({
			likeRelationId:uuid.v1(),
			postId:params.postId,
			userId:params.userId,
			likeRelationState:1,
			createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
			updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(likeRelation){
			callback(likeRelation);
		});
	}
};

/**
   * 修改用户对SNS帖子的点赞关系
   * @param {Object} setValue	要修改的值
   * @param {Object} params 条件
   * @param {Object} callback 返回
   */
likeRelationService.updatePostLikeRelation = function(setValue,params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		LikeRelationModel.update(setValue,{
			where:{
				userId:params.userId,
				postId:params.postId
			}
		}).then(function(obj){
			callback(null, obj);
		});
	}
};

/**
   * (SNS)用户对评论是否存在点赞关系
   * @param {Object} params
   * @param {Object} callback
   */
likeRelationService.getCommentLikeRelation = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		CommentLikeRelationModel.findOne({
			where:{
				commentId:params.commentId,
				userId:params.userId
			}
		}).then(function(commentLikeRelation){
			callback(null,commentLikeRelation);
		});
	}
};

/**
   * (SNS)新增评论的点赞关系
   * @param {Object} params
   * @param {Object} callback
   */
likeRelationService.createCommentLikeRelation = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		CommentLikeRelationModel.create({
			id:uuid.v1(),
			commentId:params.commentId,
			userId:params.userId,
			state:1,
			createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
			updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(commentLikeRelation){
			callback(commentLikeRelation);
		});
	}
};

/**
   * (SNS)修改评论的点赞关系
   * @param {Object} setValue 要修改得值
   * @param {Object} params	条件
   * @param {Object} callback
   */
likeRelationService.editCommentLikeRelation = function(setValue,params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		CommentLikeRelationModel.update(setValue,{
			where:{
				commentId:params.commentId,
				userId:params.userId
			}
		}).then(function(obj){
			callback(null, obj);
		});
	}
};


/**
   * (SNS)修改帖子评论的点赞数
   * @param params
   * @param callback
   */
likeRelationService.updatePostComLikeCount = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        sequelize.query(postQuery.updateCommentLikeRelationCount(params), {
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



/**
 * 用户是否点过赞 [type标识符   0为帖子点赞 、 1为评论的点赞]
 * @param {Object} params
 * @param {Object} callback
 */
likeRelationService.getTopicLikeRelation = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		UserLikeRelationModel.findOne({
			where:{
				postId:params.postId,
				userId:params.userId,
				type:params.type
			}
		}).then(function(results){
			callback(null, results);
		});
	}
};

/**
 * 创建用户点赞关系 [type标识符   0为帖子点赞 、 1为评论的点赞]
 * @param {Object} params
 * @param {Object} callback
 */
likeRelationService.createTopicLikeRelation = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		UserLikeRelationModel.create({
			likeId:uuid.v1(),
			postId:params.postId,
			userId:params.userId,
			state:1,
			type:params.type,
			createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
			updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(likeRelation){
			callback(likeRelation);
		});
	}
};


/**
 * 修改用户点赞关系 [type标识符   0为帖子点赞 、 1为评论的点赞]
 * @param {Object} setValue	要修改的值
 * @param {Object} params 条件
 * @param {Object} callback 返回
 */
likeRelationService.updateTopicLikeRelation = function(setValue,params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		UserLikeRelationModel.update(setValue,{
			where:{
				userId:params.userId,
				postId:params.postId
			}
		}).then(function(obj){
			callback(null, obj);
		});
	}
};

module.exports = likeRelationService;













