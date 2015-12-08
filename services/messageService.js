"use strict";
/**
 * 推送服务接口
 */
var async = require('async');
var moment = require('moment');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var sequelize = require('../utils/sequelizeDB');
var messageModel = require('../models/app-models/MessageModel');
var SecretaryModel = require('../models/app-models/SecretaryModel');
var messageStr = require('../models/sqlFile/Message.js'), messageQuery = new messageStr();
var messageService = function(){};

/**
 * 新增推送消息
 * @param {Object} params
 * @param {Object} callback
 */
messageService.createMessage = function(params, callback){
	messageModel.create({
		messageId:uuid.v1(),
		messageText:params.messageText,
		sendUserId:params.sendUserId,
		reciveUserId:params.reciveUserId,
		topicId:params.topicId,
		pushGoal:params.pushGoal,			// 推送目标
		chatType:params.chatType, 
		officalType:params.officalType,
		releaseDate:params.releaseDate,		// 记录定时时间
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(message){
		callback(message);
	});
};


/** ******************管理后台****************** */

/**
 * by Star / admin
 * 推送列表
 * @param {Object} params
 * @param {Object} callback
 */
messageService.getAdminPushList = function(params, callback){
	// 瀑布流执行
	async.waterfall([
		// 获取推送条目
		function(callback0){
			sequelize.query(messageQuery.pushList(params).count(),{
				type: sequelize.QueryTypes.SELECT
			}).then(function(push){
				callback0(null, push[0]);
			}).catch(function(err){
				callback0(err);
			});
		},
		// 获取推送集合
		function(pushCount,callback1){
			if(pushCount.count > 0 ){
				sequelize.query(messageQuery.pushList(params).rows(),{
					type: sequelize.QueryTypes.SELECT
				}).then(function(pushlist){
					callback1(null,{rows:pushlist, count: pushCount.count});
				}).catch(function(err){
					callback1(err);
				});
			} else {
				callback1(null,{rows:[], count: pushCount.count});
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
 * 删除推送消息
 * @param {Object} params
 * @param {Object} callback
 */
messageService.adminDelPush = function(params, callback){
	messageModel.destroy({
		where:params
	}).then(function(obj){
		callback(obj);
	});
}


/**
 * by Star / admin
 * 常见问题列表
 * @param {Object} params
 * @param {Object} callback
 */
messageService.getCommonQuestionList = function(params, callback){
	// 瀑布流执行
	async.waterfall([
		// 获取常见问题条目
		function(callback0){
			sequelize.query(messageQuery.commonQuestion(params).count(),{
				type: sequelize.QueryTypes.SELECT
			}).then(function(push){
				callback0(null, push[0]);
			}).catch(function(err){
				callback0(err);
			});
		},
		// 获取常见问题集合
		function(commonQuestionCount,callback1){
			if(commonQuestionCount.count > 0 ){
				sequelize.query(messageQuery.commonQuestion(params).rows(),{
					type: sequelize.QueryTypes.SELECT
				}).then(function(commonQuestionlist){
					callback1(null,{rows:commonQuestionlist, count: commonQuestionCount.count});
				}).catch(function(err){
					callback1(err);
				});
			} else {
				callback1(null,{rows:[], count: commonQuestionCount.count});
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
 * 删除常见问题
 * @param {Object} params
 * @param {Object} callback
 */
messageService.adminDelCommonQuestion = function(params, callback){
	SecretaryModel.destroy({
		where:{
			$or:[
				{secretaryId: params.secretaryId}, 
				{answerFor: params.answerFor}
			]
		}
	}).then(function(obj){
		callback(obj);
	});
}

/**
 * by Star / admin
 * 新增问题
 * @param {Object} params
 * @param {Object} callback
 */
messageService.adminAddQuestion = function(params, callback){
	SecretaryModel.create({
        content: params.content,
        type: params.type,
        userId: params.userId,
        answerUserId: params.answerUserId,
        answerFor: params.answerFor,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function (obj) {
        callback(null, obj);
    })['catch'](function (err) {
        callback(err);
    });
};

/**
 * by Star / admin
 * 修改问题
 * @param {Object} params
 * @param {Object} callback
 */
messageService.adminEditQuestion = function(value, params, callback){
	SecretaryModel.update(value,{
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * by Star / admin
 * 根据参数获取问题数据
 * @param {Object} params
 * @param {Object} callback
 */
messageService.getQuestionByParam = function(params, attrs, callback){
	SecretaryModel.findOne({
        where: params,
        attributes:attrs
    }).then(function(obj){
        callback(null, obj);
    });
};

/**
 * 自连接查询常见问题单条数据
 * @param {Object} params
 * @param {Object} callback
 */
messageService.commonQuestionById = function(params, callback){
	sequelize.query(messageQuery.commonQuestionById(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(result){
		callback(null, result);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * by Star / admin
 * 用户问题集合
 * @param {Object} params
 * @param {Object} callback
 */
messageService.userQuestionRows = function(params, callback){
	sequelize.query(messageQuery.userQuestionRows(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(result){
		callback(null, result);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * by Star / admin
 * 用户问题总数
 * @param {Object} params
 * @param {Object} callback
 */
messageService.userQuestionCount = function(params, callback){
	sequelize.query(messageQuery.userQuestionCount(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(result){
		callback(null, result);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * by Star / admin
 * 获取该用户最近的一条提问
 * @param {Object} params
 * @param {Object} callback
 */
messageService.findOneQuestion = function(params, callback){
	sequelize.query(messageQuery.findOneQuestion(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(result){
		callback(null, result);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * by Star / admin
 * 用户提问和回答
 * @param {Object} params
 * @param {Object} callback
 */
messageService.userQuestionAndAnswer = function(params, callback){
	sequelize.query(messageQuery.userQuestionAndAnswer(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(result){
		callback(null, result);
	}).catch(function(err){
		callback(err);
	});
};

module.exports = messageService;
