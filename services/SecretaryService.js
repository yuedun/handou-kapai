'use strict';
/**
 * Created by admin on 2015/7/9.
 * 韩豆小秘书
 */
var moment = require('moment');
var travelSchedule = require('../models/sqlFile/TravelSchedule');
var Secretary = require('../models/app-models/SecretaryModel.js');
var UserModel = require('../models/app-models/UserModel.js');
var MessageModel = require('../models/app-models/MessageModel.js');
var sequelize = require('../utils/sequelizeDB');
var SecretaryService = function SecretaryService() {};

/**
 * 小秘书，常见问题
 * @param params
 * @param callback
 */
SecretaryService.getCommonQuestion = function (params, callback) {
    sequelize.query(travelSchedule.commonQuestion(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (obj) {
        callback(null, obj);
    })['catch'](function (err) {
        callback(err);
    });
};

/**
 * 提问
 * @param params
 * @param callback
 */
SecretaryService.addQuestion = function (params, callback) {
    Secretary.create({
        content: params.content,
        type: params.type,
        userId: params.userId,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function (obj) {
        callback(null, obj);
    })['catch'](function (err) {
        callback(err);
    });
};

/**
 * 小秘书，我的提问
 * @param params
 * @param callback
 */
SecretaryService.getMyQuestion = function (params, callback) {
    var condition = {};
    condition.userId = params.userId;
    if (params.direction === 'refresh') {
        condition.createDate = { $lt: new Date() };
    } else if (params.direction === 'loadmore') {
        condition.createDate = { $lt: params.lastDate };
    }
    Secretary.findAll({
        attributes: ['secretaryId', 'content', 'createDate', 'type'],
        where: condition,
        include: [{ model: UserModel, attributes: ['headPortrait'], as: 'User'}, {model: UserModel, attributes: ['headPortrait'], as: 'AnswerUser'}],
        limit: params.pageSize,
        order: [['create_date', 'DESC']]
    }).then(function (list) {
        callback(null, list);
    })['catch'](function (err) {
        callback(err);
    });
};
/**
 * 我的消息
 * @param params
 * @param callback
 */
SecretaryService.getMyMessage = function (params, callback) {
    MessageModel.findAll({
        attributes: params.attrs,
        where: params.condition,
        include: [{model: UserModel, attributes: ["nickName","headPortrait","userType"], as: "sendUser"},{model: UserModel, attributes: ["nickName"], as: "reciveUser"}],
        offset: params.offset,
        limit: params.pageSize,
        order: [['create_date', 'DESC']]
    }).then(function (list) {
        callback(null, list);
    })['catch'](function (err) {
        callback(err);
    });
};

/**
 * 官方推送的消息
 * @param params
 * @param callback
 */
SecretaryService.getofficiaMessage = function (params, callback) {
    MessageModel.findAll({
        attributes: params.attrs,
        where: params.condition,
        include: [{model: UserModel, attributes: ["nickName","headPortrait","userType"], as: "sendUser"}],
        offset: params.offset,
        limit: params.limit,
        order: [['create_date', 'DESC']]
    }).then(function (list) {
        callback(null, list);
    })['catch'](function (err) {
        callback(err);
    });
};

/**
 * 删除消息
 * @param {Object} params
 * @param {Object} callback
 */
SecretaryService.deleteMessage = function(params, callback){
    MessageModel.destroy({
        where:params
    }).then(function(){
        callback();
    });
};

module.exports = SecretaryService;