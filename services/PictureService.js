"use strict";
/**
 * 图片服务接口
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var uuid = require('../utils/uuid');
var moment = require('moment');
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();	
var pictureService = function(){};

/**
 * 帖子图片列表 
 * @param {Object} params
 * @param {Object} callback
 */
pictureService.getPostImgObj = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.postImgList(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(postImglist){
			callback(null, postImglist);
		});
	}
};

module.exports = pictureService;














