'use strict';
/**
 * Created by admin on 2015/7/17.
 */
var adverModel = require('../models/app-models/AdverModel');
var uuid = require('../utils/uuid');
var moment = require('moment');
var sequelize = require('../utils/sequelizeDB');
var orgTopic = require('../models/sqlFile/orgTopic'), query = new orgTopic();
var adverService = function (){};

/**
 * 新增广告
 * @param params
 * @param callback
 */
adverService.addAdver = function(params, callback) {
	adverModel.create({
		adverId: uuid.v1(),
		adverTitle: params.adverTitle,
		adverPic: params.adverPic,
		groupId: params.groupId,
		linkType: params.linkType,
		linkValue: params.linkValue,
		state: params.state,
		releaseDate: params.releaseDate,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj) {
		callback(null, obj);
	}).catch(function(err) {
		callback(err);
	});
};

/**
 * 修改广告
 */
adverService.updateAdver = function(conn,params,callback){
	adverModel.update(params,{
		where:conn
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err) {
		callback(err);
	});
};

/**
 * 单个查询广告
 */
adverService.getAdverObj = function(params,callabck){
	adverModel.findOne({
		where:params
	}).then(function(obj){
		callabck(null,obj);
	}).catch(function(err) {
		callback(err);
	});
};

/**
 * 查询广告列表
 */
adverService.getAdverList = function(params, callback) {
	sequelize.query(query.getAdverList(params),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err) {
		callback(err);
	});
};
/**
 * 查询广告记录数
 */
adverService.getAdverCount = function(params, callback) {
	sequelize.query(query.getAdverCount(params),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err) {
		callback(err);
	});
};

/**
 * 删除广告
 */
adverService.deleteAdver = function(params,callback){
	adverModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

module.exports = adverService;