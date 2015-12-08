'use strict';
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var LogModel = require('../models/app-models/LogModel');
var sqlUser = require("../models/sqlFile/User.js");
var commonService = function(){};

/**
 * 新创建日志信息
 * @param {Object} params
 * @param {Object} callback
 */
commonService.createLog = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		LogModel.create({
			lid: params.lid,		// 不需要赋值，但是必须给这个参数
			userId: params.userId,
			log: params.log,
			state: 1,
			mobileType: params.mobileType,
			platformType: params.platformType,
			softwareVersion: params.softwareVersion,
			osVersion: params.osVersion,
			createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
			updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(loginfo){
			callback(null,loginfo);
		});
	}
};

/**
 * 获取用户日志列表
 * @param {Object} params
 * @param {Object} callback
 */
commonService.getUserLogs = function(params,callback){
	 sequelize.query(sqlUser.getUserLog(params).rows(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(logList){
        callback(null, logList);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 获取用户日志列表count
 * @param {Object} params
 * @param {Object} callback
 */
commonService.getUserLogsCount = function(params,callback){
	 sequelize.query(sqlUser.getUserLog(params).count(),{
        type: Sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};


/**
 * 删除用户日志
 */
commonService.deleteUserLogs = function(params,callback){
	LogModel.destroy({where:params}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
        callback(err);
    });
}	

module.exports = commonService;

