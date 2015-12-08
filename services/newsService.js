"use strict";
/**
 * create by hp 2015-03-13
 * @type {Address|exports}
 */
var sequelize = require('../utils/sequelizeDB');
var News = require('../models/News');
var User = require('../models/User');
var UserInfo = require('../models/UserInfo');
var Category = require('../models/Category');
var CategoryRelation = require('../models/CategoryRelation');
var NewsLikeRelation = require('../models/NewsLikeRelation');
var UserTranslateRelation = require('../models/UserTranslateRelation');
var uuid = require('../utils/uuid');
var moment = require('moment');
var queryStr = require('../models/sqlFile/queryStr'),
    query = new queryStr();
var newsService = {};

/**
 * 推荐资讯列表
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getRecommendNewsList = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        News.findAll({
            where: {
                recommend_state: 0,
                state:0
            },
            attributes: ['news_id', 'title_kor','title_zh','summary_kor','summary_zh',
                'picture_mini','picture_preview','translate_state','recommend_state','user_id',
                'read_count','create_date','release_date'],
            order:[['sort_field','DESC']]
        }).then(function(results) {
            callback(null, results);
        });
    }
};
/**
 * 普通资讯列表
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getNewsList = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        //limit取多少行，offset从第几行开始（index索引）
        params.offset = (params.offset == null ? 0 : (params.offset - 1) * params.limit);
        params.limit = (params.limit == null ? 20 : params.limit);
        sequelize.query(query.news(params), {
            type: sequelize.QueryTypes.SELECT
        }).then(function(results) {
            callback(null, results);
        });
    }
};

newsService.getNewsFilterResultList = function(params, callback) {
    if (params === '' || params.categoryIds == null) {
        callback('参数为空');
    } else {
        //limit取多少行，offset从第几行开始（index索引）
        params.offset = (params.offset == null ? 0 : (params.offset - 1) * params.limit);
        params.limit = (params.limit == null ? 10 : params.limit);
        sequelize.query(query.newsfilter(params), {
            type: sequelize.QueryTypes.SELECT
        }).then(function(results) {
            callback(null, results);
        });
    }
};

/**
 * 获取所有粉丝团列表
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getNewsFilter = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        Category.findAll({
            where: {
                category_state: 0
            },
            attributes: ['category_id', 'category_name'],
            order:'category_name'
        }).then(function(list) {
            callback(null, list);
        });
    }
};
/**
 * 获取所有粉丝团列表
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getMyCategory = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        sequelize.query(query.myCategory(params), {
            type: sequelize.QueryTypes.SELECT
        }).then(function(results) {
            callback(null, results);
        });
    }
};
/**
 * 根据id获取资讯详情
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getNewsById = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        News.findOne({
            where: {
                news_id: params.news_id
            }
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 根据参数获取资讯
 * @param params
 * @param callback
 */
newsService.getNewsByParam = function(params, callback) {
    News.findOne({
        where: params.condition,
        attributes: params.attr
    }).then(function(obj) {
        callback(null, obj);
    });
};
/**
 * 根据id获取资讯详情
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getReadCountById = function(params, callback) {
    News.findOne({
        where: {
            news_id: params
        },
        attributes:['read_count']
    }).then(function(obj) {
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 获取访问最多资讯
 * @param {Object} params
 * @param {Object} callback
 */
newsService.getHotNewsList = function(params, callback) {
    News.findAll({
        limit:params.limit,
        order:[['read_count','DESC']]
    }).then(function(obj) {
        callback(null, obj);
    });
};
/**
 * 查询用户点赞是否存在
 * @param params
 * @param callback
 */
newsService.getLikeRelation = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        NewsLikeRelation.findOne({
            where: {
                news_id: params.newsId,
                user_id: params.userId
            }
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 查询用户信息
 * @param params
 * @param callback
 */
newsService.getUserById = function(id, callback) {
    if (id === '') {
        callback('参数为空');
    } else {
        User.findOne({
            attributes:['user_identify'],
            include:[{model:UserInfo, attributes:['head_portrait']}],
            where: {
                user_id: id
            }
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 创建用户点赞关系
 * @param params
 * @param callback
 */
newsService.createNewsLike = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        NewsLikeRelation.create({
            like_relation_id: uuid.v1(),
            user_id: params.userId,
            news_id: params.newsId,
            state: 0,
            create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            update_date: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(obj) {
            callback(obj);
        })
    }
};
/**
 * 用户点赞
 * @param params
 * @param callback
 */
newsService.updateNewsLike = function(updateKV, params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        NewsLikeRelation.update(updateKV, {
            where: {
                news_id: params.newsId,
                user_id: params.userId
            }
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 修改资讯信息
 * @param id
 * @param params修改的字段和值
 * @param callback
 */
newsService.updateNews = function(id, kv, callback) {
    if (id === '') {
        callback('参数为空');
    } else {
        News.update(kv, {
            where: {
                news_id: id
            }
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};
/**
 * 登录用户奖赏翻译小编
 * @param params
 * @param callback
 */
newsService.createTransLike = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        UserTranslateRelation.create({
            like_relation_id: uuid.v1(),
            user_id: params.user_id,
            news_id: params.news_id,
            translate_user_id: params.editor_id,
            type: params.type,
            create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            update_date: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(obj) {
            callback(obj);
        })
    }
};

module.exports = newsService;