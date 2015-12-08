'use strict';
/**
 * Created by admin on 2015/10/14.
 */
var http = require("https");
var uuid = require('../utils/uuid');
var moment = require('moment');
var WeiboTopicModel = require('../models/app-models/WeiboTopicModel');
var orgTopic = require('../models/sqlFile/orgTopic'), query = new orgTopic();
var async = require('async');
var sequelize = require('../utils/sequelizeDB');
var sqlUser = require("../models/sqlFile/User.js");
var userService = require('./UserService');
var TopicModel = require('../models/app-models/TopicModel');
var sizeOf = require('image-size');
var url = require('url');
var hp = require("http");
var weiboDataService = function (){};
/**
 * 定义新浪微博应用中的App Key 与 App Secret
 */
weiboDataService.weiboParams = {
	APP_KEY: "2851583478",
	APP_SECRET: "cf738a31d1ac5c1aaa6bcfad9c74ddb9",
	REDIRECT_URI:"http://nodeapi.handouer.cn:9000/outside-admin/getAccessToken",
	//REDIRECT_URI: "http://handouer.wicp.net/outside-admin/getAccessToken",
	AUTHORIZATION_CODE: "authorization_code"
};
/**
 * 获取用户微博最新列表
 *
 * @param {Object} params
 */
weiboDataService.getWeiboData = function(params, callback) {
	var path = "";
	var imageSize = "";
	sequelize.query(query.getWeiboTopicList(params), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(list) {
		var obj = list[0];
		if (obj == null) {
			path = "/2/statuses/user_timeline.json?access_token=" + params.accessToken + "&uid=" + params.uId + "&count=" + params.count + "&page=" + params.page + "&feature=" + params.feature + ""
		} else {
			path = "/2/statuses/user_timeline.json?access_token=" + params.accessToken + "&uid=" + params.uId + "&count=" + params.count + "&page=" + params.page + "&feature=" + params.feature + "&since_id=" + obj.sinceId;
		}

		var options = {
			"method": "GET",
			"hostname": "api.weibo.com",
			"port": null,
			"path": path,
			"headers": {
				"access-token": params.accessToken
			}
		};
		var req = http.request(options, function(res) {
			var chunks = [];

			res.on("data", function(chunk) {
				chunks.push(chunk);
			});

			res.on("end", function() {
				var body = Buffer.concat(chunks); //用户最新微博列表
				body = eval('(' + body + ')');
				var tokenState = body.error_code == 10006 ? 0 : 1;//判断AccessToken是否已过期
				if (body.error_code == 10006) {
					userService.getUserByParam({orgToken: params.uId}, ['userId', 'orgToken'], function(err, userObj) {
						userService.updateUserVerify({userId: userObj.userId},{tokenState: tokenState}, function(err, obj) {
							callback(null,obj);
						});
					});
				} else if (body.statuses.length > 0) {
					body.statuses.forEach(function(item, index) { //遍历微博列表
						var topicParams = {//公共参数--------topic and weibotopic
							id: item.id,
							topicName: item.text,
							topicDesc: item.text,
							topicState: 1,
							topicType: 3,
							sinceId:item.id,
							uId:item.user.idstr,
							createdAt: item.created_at,
							createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
							updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
						};
						var pic_urls = item.pic_urls; //获取图片对象
						if (pic_urls.length > 0) {//如果有pic  那就获取其尺寸
							var sb = "";
							pic_urls.forEach(function(item, index) {//遍历pic
								if ((index + 1) == pic_urls.length) {
									sb = sb + item.thumbnail_pic;
								} else {
									sb = sb + item.thumbnail_pic + ',';
								}
							});
							sb = sb.replace(/thumbnail/g, 'large');//图换成高清原图
							topicParams.topicPics = sb;
							var arr = sb.split(',');
							weiboDataService.getImageSize(arr, function(err, _picsSize) {//获取图片尺寸
							 if(_picsSize){//获取正常就添加其尺寸             否则省略其尺寸直接进行ADD操作
								imageSize = _picsSize;
								topicParams.picsSize = imageSize;
								async.auto({
									get_user:function(callback){//根据微博用户uid获取其user_id
										userService.getUserByParam({orgToken: item.user.idstr}, ['userId'], function(err, user) { //根据微博uid查询用户userId
											topicParams.userId = user.userId;
											callback(null,user);
										});	
									},
									get_org:['get_user', function(callback, user){//根据user_id获取其所属粉丝段id
										var op = {condition: {userId: user.get_user.userId},attr: ['groupId']};
								       userService.getOrgsGroup(op, function(err, orgObj) { //根据用户ID查询用户所属粉丝团ID
								       		topicParams.groupId = orgObj.groupId;
								       		callback(null, orgObj);
								       });		
							    	}],
							    	create_weibo:function(callback){//ADD topicweibo      非依赖操作
							    		weiboDataService.addWeiboTopic(topicParams,function(err,weibotopic){
							    			callback(null, weibotopic);
							    		});
							    	},
							    	create_topic:['get_user','get_org', function(callback, user){//ADD TOPIC    依赖操作 ~~~~get_user and get_org
							    		weiboDataService.addTopic(topicParams, function(err, topic) {
											callback(null, topic);
										});
							    	}]
							    	
								},function(err, results){
									callback(null, results);//callback
								});	
							}else{
								async.auto({//此操作说明获取pic尺寸有error       省略其pic尺寸
									get_user:function(callback){
										userService.getUserByParam({orgToken: item.user.idstr}, ['userId'], function(err, user) { //根据微博uid查询用户userId
											topicParams.userId = user.userId;
											callback(null,user);
										});	
									},
									get_org:['get_user', function(callback, user){
										var op = {condition: {userId: user.get_user.userId},attr: ['groupId']};
								       userService.getOrgsGroup(op, function(err, orgObj) { //根据用户ID查询用户所属粉丝团ID
								       		topicParams.groupId = orgObj.groupId;
								       		callback(null, orgObj);
								       });		
								        
							    	}],
							    	create_weibo:function(callback){
										weiboDataService.addWeiboTopic(topicParams,function(err,weibotopic){
							    			callback(null, weibotopic);
							    		});
							    	},
							    	create_topic:['get_user','get_org', function(callback, user){
							    		weiboDataService.addTopic(topicParams, function(err, topic) {
											callback(null, topic);
										});
							    	}]
							    	
								},function(err, results){
									callback(null, results);
								});	
							}
						  });
						} else {
							async.auto({//此操作说明爬取过来的微博数据没有图片信息
								get_user:function(callback){
									userService.getUserByParam({orgToken: item.user.idstr}, ['userId'], function(err, user) { //根据微博uid查询用户userId
										topicParams.userId = user.userId;
										callback(null,user);
									});	
								},
									get_org:['get_user', function(callback, user){
										var op = {condition: {userId: user.get_user.userId},attr: ['groupId']};
								       	userService.getOrgsGroup(op, function(err, orgObj) { //根据用户ID查询用户所属粉丝团ID
								       		topicParams.groupId = orgObj.groupId;
								       		callback(null, orgObj);
								       	});		
						    	}],
							    	create_weibo:function(callback){
										weiboDataService.addWeiboTopic(topicParams,function(err,weibotopic){
							    			callback(null, weibotopic);
							    		});
							    	},
							    	create_topic:['get_user','get_org', function(callback, user){
							    		weiboDataService.addTopic(topicParams, function(err, topic) {
											callback(null, topic);
										});
							    	}]
							},function(err, results){
								callback(null, results);
							});
						}
					});
				} else {
					callback(null, null);
				}
			});
		});
		req.end();
	});
};


/**
 * 获取accessTopken
 */
weiboDataService.getAccessToken = function(params,callback) {
	var options = {
		"method": "POST",
		"hostname": "api.weibo.com",
		"port": null,
		"path": "/oauth2/access_token?client_id="+weiboDataService.weiboParams.APP_KEY+"&client_secret="+weiboDataService.weiboParams.APP_SECRET+"&grant_type="+weiboDataService.weiboParams.AUTHORIZATION_CODE+"&code="+params.code+"&redirect_uri="+weiboDataService.weiboParams.REDIRECT_URI
	};

	var req = http.request(options, function(res) {
		var chunks = [];

		res.on("data", function(chunk) {
			chunks.push(chunk);
		});

		res.on("end", function() {
			var body = Buffer.concat(chunks);
			body = eval('(' + body + ')');
			callback(null,body);
		});
	});

	req.end();

};

/**
 * 获取组织token
 * @param {Object} callback
 */
weiboDataService.getOrgTokenList = function(callback){
	sequelize.query(sqlUser.getOrgToken(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(tokenList){
        callback(null, tokenList);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 获取微博帖子列表
 */
weiboDataService.getWeiboList = function(params,callback){
    sequelize.query(query.getWeiboList(params).rows(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    });
};
/**
 * 获取微博帖子列表count
 */
weiboDataService.getWeiboCount = function(params,callback){
    sequelize.query(query.getWeiboList(params).count(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    });
};

/**
 * 单值查询微博帖子
 */
weiboDataService.getWeiboObj = function(params,callback){
	WeiboTopicModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 修改微博帖子
 */
weiboDataService.updateWeiboTopic = function(con,params,callback){
	WeiboTopicModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};


/**
 * 获取微薄图片尺寸
 */
weiboDataService.getImageSize = function(images, callback) {
	var imagesArr = [];
	async.map(images, function(item, callback) {
		var imgUrl = item;
		var options = url.parse(imgUrl);
		var req = hp.get(options, function(response) {
			var chunks = [];
			response.on('data', function(chunk) {
				chunks.push(chunk);
			}).on('end', function() {
				var buffer = Buffer.concat(chunks);
				imagesArr.push(sizeOf(buffer).width + "*" + sizeOf(buffer).height);
				callback(null, imagesArr);
			});
		});
		req.on('error', function(e) {
			imagesArr.push(400+"*"+602);
			callback(null,imagesArr);
		});
	}, function(err, results) {
			var wAndh = JSON.stringify(results[0]);
			var _picsSize = wAndh.replace(/\"/g, "").replace("[", "").replace("]", "");
			callback(null, _picsSize);
	});
};


/**
 * 新增weibotopic
 */
weiboDataService.addWeiboTopic = function(params,callback){
	WeiboTopicModel.create({
		topicId: uuid.v1(),
		topicName: params.topicName,
		topicDesc: params.topicDesc,
		topicState:params.topicState,
		uId: params.uId,
		topicPics: params.topicPics ? params.topicPics : null,
		sinceId: params.id,
		createdAt: params.createdAt,
		createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(topic) {
		callback(null, topic);
	}).catch(function(err) {
		callback(err);
	});
};									

/**
 * 新增topic
 */
weiboDataService.addTopic = function(params,callback){
	TopicModel.create({
		topicId:params.id,
		topicName:params.topicName,
		topicDesc:params.topicDesc,
        parentTopicId: params.parentTopicId,
		audioAddress:params.audioAddress,
		audioTime:params.audioTime,
		topicPics:params.topicPics,		// 图片
		picsSize:params.picsSize?params.picsSize:null,		// 原图片尺寸
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
module.exports = weiboDataService;