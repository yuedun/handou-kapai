var express = require('express');
var router = express.Router();
var async = require('async');
var config = require('../config/config');
var apiUri = require('../config/apiUri');
var Picture = require('../models/Picture');
var PictureZuJi = require('../models/PictureZuJi');
var ActivityPds = require('../models/ActivityPds');
var FeedbackPds = require('../models/FeedbackPds');
var http = require('http');
var https = require('https');
var urlencode = require('urlencode');
var uuid = require('../utils/uuid');
var moment = require('moment');//日期组件
var dateUtils = require('../utils/dateUtils');
var weixin = require('../services/weixinService');
var myClient = require('../utils/redisDB').myClient;
var sign = require('../services/sign.js');
var responseObj = require('../models/ResponseObj');
var queryStr = require('../models/sqlFile/queryStr'),
	query = new queryStr(),
	sequelize = require('../utils/sequelizeDB');

/**
 * 查询图片(所有图片，可根据穿如参数过滤查询)
 */
router.get(apiUri.pictureUri +'/:offset/:limit', function(req, res) {
	var params = req.query;
	params.picture_state = 0;
	params.picture_type = 0;
	params.picture_class = 11;
	PictureZuJi.findAll({
		where: params,
		attributes: ['picture_id', 'picture_original_name', 'picture_original_path'],
		offset: req.params.offset == null ? 0 : (req.params.offset-1) * req.params.limit,
		limit: req.params.limit == null ? 10 : req.params.limit,
		order: 'create_date DESC'}).then(function(list){
		var l = list.length;
		for(var i = 0; i < l; i++){
			var pic_path = config.qiniu.download_website + list[i].get('picture_original_path');
			list[i].setDataValue('picture_original_path', pic_path);
		}
		res.json(list);
	});
});
/**
 * 拍点啥首页背景图
 */
router.get('/background', function(req, res) {
	PictureZuJi.findOne({
		where: {picture_type:30},
		attributes: ['picture_original_path']
	}).then(function(obj){
		var pic_path = config.qiniu.download_website + obj.picture_original_path;
		obj.setDataValue('picture_original_path', pic_path);
		var resObj = new responseObj();
		resObj.command = req.query.command;
		resObj.object = obj;
		res.json(resObj);
	});
});
/**
 * 拍点啥活动信息列表
 */
router.get('/pdsMsg', function(req, res) {
	sequelize.query(query.pdsMsg(), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(list){
		list.forEach(function (item, index) {
			try {
				//是否获奖名单
				if (item.is_award_list == 1) {
					item.activity_state = 0;
				}
				if (item.activity_start_date != null) {
					if (item.activity_start_date.getTime() > (new Date().getTime())) {
						//活动预告，开始时间大于当前时间
						item.activity_state = 1;
					} else if (item.activity_start_date.getTime() < (new Date().getTime()) && (new Date().getTime()) < item.activity_end_date.getTime()) {
						//活动中，开始时间小于当前时间，当前时间大于结束时间
						item.activity_state = 2;
					} else if (item.activity_end_date.getTime() < (new Date().getTime())) {
						//活动结束，结束时间小于当前时间
						item.activity_state = 3;
					}
				}
			}catch (e){
				console.log("err:"+ e.message);
			}
		});

		var resObj = new responseObj();
		resObj.command = req.query.command;
		resObj.object = list;
		res.json(resObj);
	});
});
/**
 * 拍点啥与星合影粉丝团列表图
 */
router.get('/withStar', function(req, res) {
	sequelize.query(query.categoryList(), {
		type: sequelize.QueryTypes.SELECT
	}).then(function(list){
		var resObj = new responseObj();
		resObj.command = req.query.command;
		try {
			//asycn方式
			async.map(list, function(item, callback){
				item.picture_original_path = config.qiniu.download_website + item.picture_original_path;
				PictureZuJi.findAll({
					where:{picture_type:32, category_pid:item.category_id},
					attributes: ['picture_id', 'picture_original_path']
				}).then(function(list2){
					try {
						var l = list2.length;
						for(var i = 0; i < l; i++){
							var pic_path = config.qiniu.download_website + list2[i].get('picture_original_path');
							list2[i].setDataValue('picture_original_path', pic_path);
						}
						callback(null, list2);
					}catch (e){

					}
				});
			}, function(err, results){
				var l2 = results.length;
				for(var i = 0; i < l2; i++){
					list[i].pictures = results[i];
				}
				resObj.object = list;
				res.json(resObj);
			});
		}catch (e){
			resObj.code = '5001';
			resObj.object = {"msg": e.message};
		}
	});
});

/**
 * 拍点活动详情
 */
router.get('/activity/:activity_id', function(req, res) {
	ActivityPds.findOne({
		where: {activity_id:req.params.activity_id}
	}).then(function(obj){
		if (obj.activity_start_date != null) {
			obj.setDataValue("activity_start_date", dateUtils.format(obj.get("activity_start_date")));			
		}else{
			obj.setDataValue("create_date", dateUtils.format(obj.get("create_date")));
		}
		res.render('activityPds',{activity:obj});
	});
});
/**
 * 拍点啥问题反馈
 */
router.get(apiUri.feedbackPdsUri, function(req, res) {
	FeedbackPds.create({
            feedback_id: uuid.v1(),
            feedback: req.query.feedback,
            mobile_type: req.query.mobileType,
            user_qq: req.query.qq,
            create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            update_date: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(obj){
        	var resObj = new responseObj();
			resObj.object.msg = req.query.feedback;
			resObj.command = req.query.command;
			res.json(resObj);
	});
});
/**
 * 查询图片(所有图片，可根据穿如参数过滤查询)专用于Android客户端
 */
router.get('/getPictures/:command/:offset/:limit', function(req, res) {
	var params = req.query;
	params.picture_type = parseInt(params.picture_type);
	var resObj = new responseObj();
	PictureZuJi.findAll({
		where: params,
		attributes: ['picture_id', 'picture_name', 'picture_original_path', 'picture_screenshot_path'],
		offset: req.params.offset == null ? 0 : (req.params.offset-1) * req.params.limit,
		limit: req.params.limit == null ? 10 : req.params.limit,
		order: 'create_date DESC'}).then(function(list){
			var l = list.length;
			for(var i = 0; i < l; i++){
				var pic_ori_path = config.qiniu.download_website + list[i].get('picture_original_path');
				var pic_scree_path = config.qiniu.download_website + list[i].get('picture_screenshot_path');
				list[i].setDataValue('picture_original_path', pic_ori_path);
				list[i].setDataValue('picture_screenshot_path', pic_scree_path);
			}
			resObj.command = req.params.command;
			resObj.object = list;
			resObj.status = true;
			resObj.code = "0000";
			res.json(resObj);
	});
});

/**
 * 查询单独的图片
 */
router.get(apiUri.pictureUri + "/:pictureId", function(req, res){
	var params = req.query;
	params.picture_state = 0;
	params.picture_type = 0;
	params.picture_id = req.params.pictureId;
	Picture.findAll({
		where: params,
		attributes: ['picture_id', 'picture_original_name', 'picture_original_path'],
		offset: params.offset == null ? 0 : (params.offset-1) * params.limit,
		limit: params.limit == null ? 10 : params.limit,
		order: 'create_date DESC'}).then(function(list){
		var l = list.length;
		for(var i = 0; i < l; i++){
			var pic_path = config.qiniu.download_website + list[i].get('picture_original_path');
			list[i].setDataValue('picture_original_path', pic_path);
		}

		var myreq = https.request(weixin.getAccessToken(), function (result) {
			result.setEncoding('utf8');
			result.on('data', function (chunk) {
				//myClient.setValue('weixinToken', 60, chunk.access_token, null);
				var access_token = JSON.parse(chunk).access_token;
				var myreq2 = https.request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function (result2) {
					result2.on('data', function (chunk2) {
						var signstr = sign(JSON.parse(chunk2).ticket, 'http://hphsk.oicp.net'+req.url);
						var immm=list[0].toJSON();
						res.render('weixin/croppicture', {sign: signstr, img: immm.picture_original_path});
					});
				});
				myreq2.on('error', function (e) {
					console.log('problem with request: ' + e.message);
				});
				myreq2.end();
			});
		});
		myreq.on('error', function (e) {
			console.log('problem with request: ' + e.message);
		});
		myreq.end();
	});
});

module.exports = router;