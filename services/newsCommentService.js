"use strict";
/**
 * create by hp 2015-05-18
 * @type {Address|exports}
 */
var async = require('async');
var uuid = require('../utils/uuid');
var moment = require('moment');//日期组件
var sequelize = require('../utils/sequelizeDB');
var NewsComment = require('../models/NewsComment');
var NewsCommentLikeRelation = require('../models/NewsCommentLikeRelation');
var User = require('../models/User');
var UserModel = require('../models/app-models/UserModel');
var UserInfo = require('../models/UserInfo');
var LogId = require('../models/NewsCommentLogId');
var queryStr = require('../models/sqlFile/queryStr'),
    query = new queryStr();
var newsComService = {};

/**
 * 根据资讯查询评论列表
 * @param params
 * @param callback
 */
newsComService.getCommentList = function(params, callback) {
    NewsComment.findAll({
        where:params,
        include:[{model: User, attributes:['user_identify'], include:[{model:UserInfo, attributes:['user_id', 'nick_name', 'head_portrait']}]}],
        offset: params.offset == null ? 0 : (params.offset - 1) * params.limit,
        limit: params.limit == null ? 50 : params.limit,
        order: [['create_date', 'DESC']]
    }).then(function(list) {
        callback(null, list);
    });
};
/**
 * 咖派
 * 根据资讯查询评论列表
 * @param params
 * @param callback
 */
newsComService.kpCommentList = function(params, callback) {
    NewsComment.findAll({
        where:params,
        include:[{model: UserModel, attributes:['nickName','headPortrait']}],
        offset: params.offset == null ? 0 : (params.offset - 1) * params.limit,
        limit: params.limit == null ? 50 : params.limit,
        order: [['create_date', 'DESC']]
    }).then(function(list) {
        callback(null, list);
    });
};
/**
 * 添加评论
 * @param params
 * @param callback
 */
newsComService.addComment = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        //limit取多少行，offset从第几行开始（index索引）
        NewsComment.create({
            comment_id: uuid.v1(),
            comment_content: params.comment_content,
            reply_user_id: params.reply_user_id,
            reply_comment_id: params.reply_comment_id,
            reply_nick_name: params.reply_nick_name,
            is_reply: params.is_reply!=1?0:1,
            comment_state: 0,
            comment_type: 'hd',
            user_id: params.user_id,
            news_id: params.news_id,
            voice_time: 0,
            like_count: 0,
            create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            update_date: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(obj) {
            NewsComment.findOne({
                where:{comment_id: obj.comment_id},
                include:[{model: User, attributes:['user_identify'], include:[{model:UserInfo, attributes:['user_id', 'nick_name', 'head_portrait']}]}]
            }).then(function(obj2) {
                callback(null, obj2);
            });
        });
    }
};
/**
 * 添加评论
 * @param params
 * @param callback
 */
newsComService.addKpComment = function(params, callback) {
    //limit取多少行，offset从第几行开始（index索引）
    NewsComment.create({
        comment_id: uuid.v1(),
        comment_content: params.comment_content,
        reply_user_id: params.reply_user_id,
        reply_comment_id: params.reply_comment_id,
        reply_nick_name: params.reply_nick_name,
        is_reply: params.is_reply,
        comment_state: 0,
        comment_type: 'kp',
        user_id: params.user_id,
        news_id: params.news_id,
        voice_time: 0,
        like_count: 0,
        create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
        update_date: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj) {
        NewsComment.findOne({
            where:{comment_id: obj.comment_id},
            include:[{model: UserModel, attributes:['userType', 'headPortrait', 'nickName']}]
        }).then(function(obj2) {
            callback(null, obj2);
        });
    });
};
/**
 * 同步多说评论
 * @param params
 * @param callback
 */
newsComService.addCommentFromDuoShuo = function(params, callback) {
    //limit取多少行，offset从第几行开始（index索引）
    NewsComment.create({
        comment_id: params.meta.post_id+'',
        comment_content: params.meta.message,
        reply_user_id: null,
        reply_comment_id: null,
        reply_nick_name: null,
        is_reply: 0,
        comment_state: 0,
        user_id: params.user_id + "",
        news_id: params.meta.thread_key,
        creator_ip: params.meta.ip,
        voice_time: 0,
        like_count: 0,
        create_date: moment(params.meta.created_at).format("YYYY-MM-DD HH:mm:ss"),
        update_date: moment(params.meta.date).format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj) {
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 修改评论数
 * @param params
 * @param callback
 */
newsComService.updateComLikeCount = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        sequelize.query(query.updateComLikeCount(params), {
                type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 获取评论点赞关系
 * @param params
 * @param callback
 */
newsComService.getCommentLikeRelation = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        NewsCommentLikeRelation.findOne({
            where:params
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 评论点赞关系
 * @param params
 * @param callback
 */
newsComService.updateCommentRelation = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        NewsCommentLikeRelation.upsert(
            {
                like_relation_id:params.like_relation_id || uuid.v1(),
                news_comment_id: params.news_comment_id,
                user_id: params.user_id,
                state: params.state,
                create_date:moment().format("YYYY-MM-DD HH:mm:ss"),
                update_date:moment().format("YYYY-MM-DD HH:mm:ss")
            },{validate:true}).then(function(obj) {
                callback(null, obj);
        });
    }
};
/**
 * 获取多说评论最后一次同步id
 * @param params
 * @param callback
 */
newsComService.getLastLogId = function(params, callback) {
    LogId.findOne({
        where: params
    }).then(function(obj) {
        callback(null, obj);
    });
};
/**
 * 更新最后一条同步id
 * @param params
 * @param callback
 */
newsComService.updateLastLogId = function(params, callback) {
    LogId.update({lastLogId: params.lastLogId},
        {
            where: {
                id: params.id
            }
        }
    ).then(function(obj) {
        callback(null, obj);
    });
};
module.exports = newsComService;
