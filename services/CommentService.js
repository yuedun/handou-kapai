'use strict';
/**
 * 评论服务处理
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var TopicCommentModel = require('../models/app-models/TopicCommentModel');
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();	
var commentService = function(){};

/**
 * ***********************************************************************
 * 以下为新版本V3.0数据库表
 * ***********************************************************************
 */

/**
 * 帖子评论列表
 * @param {Object} params
 * @param {Object} callback
 */
commentService.getNewPostCommentObj = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.myPostComment(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(newPostCommentlist){
			callback(null, newPostCommentlist);
		});
	}
};

/**
 * 帖子评论数
 * @param {Object} params
 * @param {Object} callback
 */
commentService.getNewPostCommentCountObj = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.myPostCommentCount(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(newPostCommentCount){
			callback(null, newPostCommentCount);
		});
	}
};

/**
 * 新增帖子评论 / 回复评论
 * @param {Object} params
 * @param {Object} callback
 */
commentService.createTopicComment = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		TopicCommentModel.create({
			commentId:uuid.v1(),
			topicId:params.topicId,
			commentContent:params.commentContent,
			replyUserId:params.replyUserId,
			replyCommentId:params.replyCommentId,
			replyNickName:params.replyNickName,
			isReply:params.isReply,
			commentState:1,
			userId:params.userId,
			audioAddress:params.audioAddress,
			audioTime:params.audioTime,
			likeCount:0,
			createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
			updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(TopicComment){
			callback(null,TopicComment);
		});
	}
};

/**
 * 删除用户评论
 * @param {Object} params
 * @param {Object} callback
 */
commentService.deleteUserTopicComment = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		TopicCommentModel.destroy({
			where:params
		}).then(function(){
			callback();
		});
	}
};

/**
 * by Star / admin
 * 修改帖子评论状态
 * @param {Object} params
 * @param {Object} callback
 */
commentService.updatePostComment = function(setValue, params, callback){
	TopicCommentModel.update(setValue,{
		where:{
			commentId:params.commentId
		}
	}).then(function(obj){
		callback(null, obj);
	});
};

/**
 * 根据评论ID获取评论信息
 * @param {Object} params
 * @param {Object} callback
 */
commentService.getCommentObjById = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		TopicCommentModel.findOne({
			where:params
		}).then(function(obj){
			callback(null, obj);
		});
	}
};

/**
 * by Star / admin
 * 帖子评论
 * @param {Object} params
 * @param {Object} callback
 */
commentService.getAdminPostComment = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid,						// 排序ID
		offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
		limit: params.pageSize == null ? 10 : params.pageSize
	};
	sequelize.query(postQuery.adminPostComment(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(PostComment){
		callback(null, PostComment);
	});
};

/**
 * by Star / admin
 * 帖子评论总数
 * @param {Object} params
 * @param {Object} callback
 */
commentService.getAdminPostCommentCount = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid						// 排序ID
	};
	sequelize.query(postQuery.adminPostCommentCount(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(PostCommentCount){
		callback(null, PostCommentCount);
	});
};

/**
 * 根据参数获取评论信息
 * @param {Object} params
 * @param {Object} attrs
 * @param {Object} callback
 */
commentService.getTopicCommentByParam = function (params, attrs, callback) {
    TopicCommentModel.findOne({
        where: params,
        attributes:attrs
    }).then(function(obj){
        callback(null, obj);
    });
};

module.exports = commentService;
