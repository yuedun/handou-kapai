var async = require('async');
var moment = require('moment');
var express = require('express');
var router = express.Router();
var apiUri = require('../config/apiUri');
var config = require('../config/config.json');
var newsService = require('../services/newsService');
var userService = require('../services/UserService');
var newsComService = require('../services/newsCommentService');
var myClient = require('../utils/redisDB').myClient;
var responseObj = require('../models/ResponseObj');
var dateUtils = require('../utils/dateUtils');

/**
 * 资讯首页
 * 首先区分首页和加载也内容，如果为首页再区分缓存和数据库查询，加载也同理
 */
router.get(apiUri.newswxUri, function(req, res){
	var key = config.redis_cache.news_list.key+"_" + req.query.offset;//不同请求的缓存key值
	var expires = config.redis_cache.news_list.expires;//过期时间
	var pageIndex = req.query.offset;
	myClient.select(key, function(err, reply) {
		//缓存
		if (reply) {
			if(req.query.offset){
				console.log("**************微信第"+req.query.offset+"页缓存");
				res.render('morenewswx', JSON.parse(reply));
			}else{
				console.log("**************微信首页缓存");
				res.render('newswx', JSON.parse(reply));
			}
		}else{
			var dateStr = "";
			var dateStr2 = "";
			//普通资讯列表
			newsService.getNewsList(req.query, function (err, list1) {
				var length = list1.length;
				for (var i = 0; i < length; i++) {
					dateStr = dateUtils.format(list1[i].create_date);
					list1[i].create_date = dateStr;
					if(list1[i].release_date){
						dateStr2 = dateUtils.format(list1[i].release_date);
						list1[i].release_date = dateStr2;
					}
				}
				//offset=null为首页，需查询推荐资讯，否则为加载页(getNewsList执行以后offset被修改)
				if(pageIndex==null || pageIndex==0){
					//推荐资讯列表
					newsService.getRecommendNewsList(req.params, function (err, list2) {
						var rs = {
							recommendNewsList: list2,
							newsList: list1
						};
						console.log("**********微信首页");
						res.render('newswx', rs);
						//资讯列表缓存600秒,缓存内容包括普通资讯与推荐资讯
						myClient.setValue(key, expires, JSON.stringify(rs), null);
					});
				}else{
					console.log("**********微信第"+pageIndex+"页");
					res.render('morenewswx', {newsList: list1});
					//资讯列表缓存600秒
					myClient.setValue(key, expires, JSON.stringify({newsList: list1}), null);
				}
			});
		}
	});
});
/**
 * 资讯详情
 */
router.get(apiUri.newswxUri + "/:news_id", function(req, res) {
	var news_id = req.params.news_id;
	myClient.select(news_id, function(err, reply) {
		if (reply) {
			var params = {};
			params.userId = req.query.user_id;
			params.newsId = req.params.news_id;
			newsService.getLikeRelation(params, function (err, obj2) {
				//当翻译小编存在时获取身份标示和头像
				if (JSON.parse(reply).editor_id != null) {
					newsService.getUserById(JSON.parse(reply).editor_id, function (err, obj3) {
						res.render('newsdetailwx', {
							news: JSON.parse(reply),
							user_id: req.query.user_id,
							urlType: req.query.urlType,
							user_identify: obj3.user_identify,
							user_head: obj3.get("user_info").get("head_portrait"),
							// 如果点赞关系为空则未点赞，否则取点赞值
							isLiked: (obj2 == null ? -1 : obj2.state)
						});
					});
				}else{
					res.render('newsdetailwx', {
						news: JSON.parse(reply),
						user_id: req.query.user_id,
						urlType: req.query.urlType,
						// 如果点赞关系为空则未点赞，否则取点赞值
						isLiked: (obj2 == null ? -1 : obj2.state)
					});
				}
			});
		} else {
			newsService.getNewsById(req.params, function (err, obj) {
				try{
					obj.setDataValue("create_date", dateUtils.format(obj.get("create_date")));
					if(obj.get("release_date")){
						obj.setDataValue("release_date", dateUtils.format(obj.get("release_date")));
					}
				}catch (e){
					res.render("error",{message: e.message});
				}
				//获取是否点赞
				var params = {};
				params.userId = req.query.user_id;
				params.newsId = req.params.news_id;
				newsService.getLikeRelation(params, function (err, obj2) {
					//当翻译小编存在时获取身份标示和头像
					if (null != obj.editor_id) {
						newsService.getUserById(obj.editor_id, function (err, obj3) {
							res.render('newsdetailwx', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								user_identify: obj3.user_identify,
								user_head:obj3.get("user_info").get("head_portrait"),
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
						//翻译小编不存在
					} else {
						//获取是否点赞
						newsService.getLikeRelation(params, function (err, obj2) {
							res.render('newsdetailwx', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
					}
				});
				//缓存资讯详情
				myClient.setValue(obj.news_id, 600, JSON.stringify(obj), null); //setValue(key, expire, value, callback)
			});
		}
	});
	//只要有请求就修改阅读数
	newsService.getReadCountById(news_id, function(err, obj){
		newsService.updateNews(news_id,{read_count:obj.read_count+1}, function(err, obj){});
	});
});

module.exports = router;