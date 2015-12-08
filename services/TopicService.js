'use strict';
/**
 * Created by thinkpad on 2015/7/22.
 */
var async = require('async');
var moment = require('moment');
var http = require("http");
var sequelize = require('../utils/sequelizeDB');
var dateFormat = require('../utils/DateFormat');
var dateUtils = require('../utils/dateUtils');
var Topic = require('../models/sqlFile/channelStr'), topicQuery = new Topic();
var orgTopic = require('../models/sqlFile/orgTopic'), query = new orgTopic();
var TopicModel = require('../models/app-models/TopicModel');
var UserTopicRelationModel = require('../models/app-models/UserTopicRelationModel');
var UserModel = require('../models/app-models/UserModel');
var GroupModel = require('../models/app-models/GroupModel');
var uuid = require('../utils/uuid');
var config = require('../config/config');
var TopicService = function () {
};

/**
 * edit by hp
 * 组织频道和用户频道
 * @param params
 * @param callback
 */
TopicService.getUserTopicList = function (params, callback) {
    sequelize.query(topicQuery.getUserChannel(params), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (list) {
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by hp
 * 我的频道：普通频道和粉丝团频道
 * @param params
 * @param callback
 */
TopicService.getMyTopicList = function (params, callback) {
    sequelize.query(topicQuery.getMyTopicList(params), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (list) {
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 *  by hp
 * 频道下帖子分享，帖子详情
 * @param params
 * @param callback
 */
TopicService.getTopicToShare = function (params, callback) {
    sequelize.query(topicQuery.getTopicToShare(params), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (list) {
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 根据组织编号查询帖子          韩豆后台
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.getOrgTopic = function(params,callback){
    sequelize.query(query.getOrgTopic(params),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 查询记录数             韩豆后台
 */
TopicService.getOrgTopicCount = function(params,callback){
	sequelize.query(query.getOrgTopicCount(params),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 根据帖子编号查询帖子          韩豆后台
 */
TopicService.getTopicObj = function(conn,params,callback){
	TopicModel.findOne({
		attributes:params.attributes,
		where:conn
	}).then(function(obj){
		callback(null,obj);		
	}).catch(function(err){
        callback(err);
    });
};

/**
 * 修改帖子状态         韩豆后台
 */
TopicService.updateTopic = function(con,params,callback){
	TopicModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * 删除帖子           韩豆后台
 */
TopicService.deleteTopic = function(params,callback){
	TopicModel.destroy({where:params}).then(function(obj){
		callback(obj);
	}).catch(function(err){
        callback(err);
    });
};
/**
 * 添加组织帖子            韩豆后台
 */
TopicService.addTopic = function(params,callback){
	TopicModel.create({
		topicId:uuid.v1(),
		topicName:params.topicName,
		topicDesc:params.topicDesc,
        parentTopicId: params.parentTopicId,
		audioAddress:params.audioAddress,
		audioTime:params.audioTime,
		topicPics:params.topicPics,		// 图片
		picsSize:params.picsSize,		// 原图片尺寸
		topicState:params.topicState,
		isRecommend:params.isRecommend,
		topicType:params.topicType,
		topicScope:params.topicScope,
		userId:params.userId,
		groupId:params.groupId,
		timedReleaseDate:params.timedReleaseDate,
		createDate:params.createDate,
		updateDate:params.updateDate
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
        callback(err);
    });
};
/**
 * 关注频道
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.followTopic = function(params, callback){
    UserTopicRelationModel.create({
        relationId: uuid.v1(),
        topicId: params.topicId,
        userId: params.userId,
        relationState: params.relationState,
        isHost: params.isHost,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 取消关注修改状态
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.upFollowTopic = function(params, callback){
    UserTopicRelationModel.update({
        relationState: params.relationState,
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    },{
        where:{
            userId: params.userId,
            topicId: params.topicId
        }
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 取消关注修改状态
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.getUserTopicRelation = function(params, callback){
    UserTopicRelationModel.findOne({
        where:{
            userId: params.userId,
            topicId: params.topicId
        },
        attributes:['relationId','userId','topicId','relationState']
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by hp/admin
 * 频道列表
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.getTopicList = function(params, callback){
	var topicCon = {};
	var starCon = {};
	var userCon = {};
	if(params.condition.topicName) topicCon.topicName = {$like: "%"+params.condition.topicName+"%"};
	if(params.condition.starName) starCon.starName = {$like: "%"+params.condition.starName+"%"};
	if(params.condition.topicUser) userCon.nickName = {$like: "%"+params.condition.topicUser+"%"};
	if(params.topicState){
		topicCon.topicState = params.topicState;
	}else{
		topicCon.topicState = {ne:-1};
	}
	var flag = null;
	if(params.condition.starName){
		flag = true;
	}else{
		flag = false;
	}
	var topicType = params.condition.topicType;
	var $topicType = "";
	if("文字" == topicType){
		$topicType = '0';
	}else if("图片" == topicType){
		$topicType = 1;
	}else if("语音" == topicType){
		$topicType = 2;
	}else if("动图" == topicType){
		$topicType = 3;
	}
	if($topicType) topicCon.topicScope = $topicType;
	var $order = params.order?params.order:[['create_date', 'desc']];
	if(params.isRecommend)	topicCon.isRecommend = params.isRecommend;
    TopicModel.findAndCountAll({
        where:{
            $or: [{topicType: params.topicTypes[0]},{topicType: params.topicTypes[1]}],$and:topicCon
        },
        offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
        limit: params.pageSize == null ? 10 : params.pageSize,
        attributes: params.attrs,
        include: [
            {model: UserModel, attributes: ['nickName'],where:{$and:userCon}},
            {model: GroupModel, attributes: ['groupId', 'starName'], where:starCon, required: flag}
        ],
        order: $order
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by hp/admin
 * 频道下帖子列表
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.getTopicPostList = function(params, callback){
    if(params.condition.topicDesc) params.condition.topicDesc = {$like: "%"+params.condition.topicDesc+"%"};
    if(!params.topicState){
        params.condition.topicState = {ne:-1};
    }
    var $order = params.order?params.order:[['create_date', 'desc']];
    TopicModel.findAndCountAll({
        where:params.condition,
        offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
        limit: params.pageSize == null ? 10 : params.pageSize,
        attributes: params.attrs,
        include: [{model: UserModel, attributes: ['nickName']}],
        order: $order
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * by hp/admin
 * 组织帖子
 * @param params
 * @param callback
 */
TopicService.getOrgTopicList = function(params, callback){
    TopicModel.findAndCountAll({
        where:params.condition,
        offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
        limit: params.pageSize == null ? 10 : params.pageSize,
        attributes: params.attrs,
        include: [{model: UserModel, attributes: ['nickName']},{model: GroupModel, attributes: ['starName']}],
        order: [["update_date", "desc"]]
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 查询帖子count
 */
TopicService.getTopicCount = function(params,callback){
	TopicModel.count({
		where:params
	}).then(function(obj){
		callback(null,obj);		
	}).catch(function(err){
        callback(err);
    });
};


/**
 * 获取图片的原尺寸
 * @param {Object} params
 * @param {Object} callback
 * return "100*200,200*300"
 */
TopicService.topicSize = function(picSize, callback) {
	var imgsSize = [];
	async.map(picSize, function(item, callback) {
		var options = {
			"method": "GET",
			"hostname": "7xl3sp.com2.z0.glb.qiniucdn.com",
			"port": null,
			"path": "/" + item + "?imageInfo",
			"headers": {}
		};
		var req = http.request(options, function(res) {
			var chunks = [];
			res.on("data", function(chunk) {
				chunks.push(chunk)
			});
			res.on("end", function() {
				var picInfo = JSON.parse(Buffer.concat(chunks));
				imgsSize.push(picInfo.width + '*' + picInfo.height);
				callback(null, imgsSize);
			});
			req.on('error', function(e) {
				callback(err.message);
			});
		});
		req.end();
	}, function(err, results) {
		if (!err) {
			// 序列化
			var wAndh = JSON.stringify(results[0]);
			// 替换掉不用的符号,转换成正常字符串
			var _picsSize = wAndh.replace(/\"/g, "").replace("[", "").replace("]", "");
			callback(null,_picsSize);
		}
	});

};

/**
 * 当天有没有创建过频道
 * @param {Object} params
 * @param {Object} callback
 */
TopicService.isUpTopic = function (params, callback) {
    sequelize.query(topicQuery.isUpTopic(params), {
        type: sequelize.QueryTypes.SELECT
    }).then(function (count) {
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};

module.exports = TopicService;
