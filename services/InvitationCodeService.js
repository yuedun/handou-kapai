"use strict";
/**
 * Created by Administrator on 2015/9/10.
 */
var async = require('async');
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var util = require('util');
var Constants = require('../utils/constants');
var dateUtils = require('../utils/dateUtils');
var invitationCode = require('../models/app-models/InvitationCodeModel');
var queryStr = require('../models/sqlFile/queryStr.js'), strQuery = new queryStr();
var factory = {};

/**
 * by Star / admin
 * 获取邀请码
 * @param params
 * @param callback
 */
factory.getInvitationCode = function(params, callback){
    // 瀑布流执行
    async.waterfall([
        // 获取邀请码条目
        function(callback0){
            sequelize.query(strQuery.getInvitationCode(params).count(),{
                type: sequelize.QueryTypes.SELECT
            }).then(function(counts){
                callback0(null, counts[0]);
            }).catch(function(err){
                callback0(err);
            });
        },
        // 获取邀请码集合
        function(counts,callback1){
            if(counts.count > 0 ){
                sequelize.query(strQuery.getInvitationCode(params).rows(),{
                    type: sequelize.QueryTypes.SELECT
                }).then(function(iclist){
                    callback1(null,{rows:iclist, count: counts.count});
                }).catch(function(err){
                    callback1(err);
                });
            } else {
                callback1(null,{rows:[], count: counts.count});
            }
        }
    ],function(err, results){
        if(err){
            callback(err);
        } else {
            callback(null, results);
        }
    });
};

/**
 * by Star / admin
 * 新增邀请码
 * @param params
 * @param callback
 */
factory.createInvitationCode = function(params, callback){
    invitationCode.create({
        invitationCodeId: uuid.v1(),
        userId: params.userId,
        nickName: params.nickName,
        phone: params.phone,
        userName: params.userName,
        code: params.code,
        useCount: params.useCount,
        state: 1,
        type: 1,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj) {
        callback(null, obj);
    }).catch(function(err){
        console.log('err = ' + err);
        callback(err);
    });
};

/**
 * by Star / admin
 * 修改邀请码
 * @param {Object} params
 * @param {Object} callback
 */
factory.editInvitationCode = function(setValue, params, callback){
    invitationCode.update(setValue,{
        where:params
    }).then(function(obj){
        callback(null,obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * by Star / admin
 * 获取邀请码基本信息
 * @param params
 * @param callback
 */
factory.getInvitationCodeInfo = function(params, callback){
    invitationCode.findOne({
        where:{
            invitationCodeId:params.invitationCodeId
        },
        attributes: params.attributes
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

module.exports = factory;
