"use strict";
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
 */
router.get(apiUri.newsUri, function(req, res){
	var key = config.redis_cache.news_list.key+"_" + req.query.offset;//不同请求的缓存key值
	var expires = config.redis_cache.news_list.expires;//过期时间
	var pageIndex = req.query.offset;
	myClient.select(key, function(err, reply) {
		//缓存
		if (reply) {
			if(req.query.offset){
				res.render('morenews', JSON.parse(reply));
			}else{
				res.render('news', JSON.parse(reply));
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
						res.render('news', rs);
						//资讯列表缓存600秒,缓存内容包括普通资讯与推荐资讯
						myClient.setValue(key, expires, JSON.stringify(rs), null);
					});
				}else{
					res.render('morenews', {newsList: list1});
					//资讯列表缓存600秒
					myClient.setValue(key, expires, JSON.stringify({newsList: list1}), null);
				}
			});
		}
	});
});
/**
 * 过滤后资讯列表
 *
 * @param {[type]}
 *            req [description]
 * @param {[type]}
 *            res) { if (req.query.offset ! [description]
 * @return {[type]} [description]
 */
router.post(apiUri.newsUri + '/filter', function(req, res) {
	var params = req.body;
	var key = 'filter_news_list_' + JSON.stringify(params);
	myClient.select(key, function(err, reply) {
		if (reply) {
			res.json(JSON.parse(reply));
		} else {
			newsService.getNewsFilterResultList(params, function(err, list) {
				var length = list.length;
				var dateStr = "";
				for (var i = 0; i < length; i++) {
					dateStr = moment(list[i].create_date).format('YYYY-MM-DD HH:mm:ss');
					list[i].create_date = dateStr;
				}
				res.json(list);
				//myClient.setValue(key, 20, JSON.stringify(list), null);
			});
		}
	});
});

/**
 * 资讯过滤条件界面数据
 */
router.get(apiUri.newsFilterUri, function(req, res) {
	var resObj = new responseObj();
	newsService.getNewsFilter(req.params, function(err, list) {
		newsService.getMyCategory(req.query, function(err, list2) {
			try {
				var ls1 = list.length;
				var ls2 = list2.length;
				for (var i = 0; i < ls1; i++) {
					for (var j = 0; j < ls2; j++) {
						if (list[i].getDataValue("category_id") == list2[j].category_id) {
							list.splice(i, 1);
							ls1 = list.length;
						}
					}
				}
			}catch(e){
				console.error(e.message);
			}
			resObj.command = req.query.command;
			resObj.object.myCategorys = list2;
			resObj.object.otherCategorys = list;
			resObj.status = true;
			resObj.code = "0000";
			res.json(resObj);
		});
	});
});
/**
 * 资讯详情
 */
router.get(apiUri.newsUri + "/:news_id", function(req, res) {
	if (req.query.user_id == undefined) {
		res.json({
			action: "jumpConsultationDetail",
			data: {
				err: "user_id参数无效"
			}
		});
		return;
	}
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
						res.render('newsdetail', {
							news: JSON.parse(reply),
							user_id: req.query.user_id,
							urlType: req.query.urlType,
							user_identify: obj3.user_identify?obj3.user_identify: 0,
							user_head: obj3.get("user_info").get("head_portrait") || "",
							// 如果点赞关系为空则未点赞，否则取点赞值
							isLiked: (obj2 == null ? -1 : obj2.state)
						});
					});
				}else{
					res.render('newsdetail', {
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
					if (obj.editor_id != null) {
						newsService.getUserById(obj.editor_id, function (err, obj3) {
							res.render('newsdetail', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								user_identify: obj3.user_identify? obj3.user_identify: 0,
								user_head:obj3.get("user_info").get("head_portrait") || "",
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
						//翻译小编不存在
					} else {
						//获取是否点赞
						newsService.getLikeRelation(params, function (err, obj2) {
							res.render('newsdetail', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
					}
				});
				myClient.setValue(obj.news_id, 600, JSON.stringify(obj), null); //setValue(key, expire, value, callback)
			});
		}
	});
	//只要有请求就修改阅读数
	newsService.getReadCountById(news_id, function(err, obj){
		newsService.updateNews(news_id,{read_count:obj.read_count+1}, function(err, obj){});
	});
});
/**
 * 咖派资讯首页
 */
router.get('/lofti/api/kpnews', function(req, res){
	var key = config.redis_cache.news_list.key+"_" + req.query.offset;//不同请求的缓存key值
	var expires = config.redis_cache.news_list.expires;//过期时间
	var pageIndex = req.query.offset;
	myClient.select(key, function(err, reply) {
		//缓存
		if (reply) {
			if(req.query.offset){
				console.log("**************咖派第"+req.query.offset+"页缓存");
				res.render('kpmorenews', JSON.parse(reply));
			}else{
				console.log("**************咖派首页缓存");
				res.render('kpnews', JSON.parse(reply));
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
						console.log("**********咖派首页");
						res.render('kpnews', rs);
						//资讯列表缓存600秒,缓存内容包括普通资讯与推荐资讯
						myClient.setValue(key, expires, JSON.stringify(rs), null);
					});
				}else{
					console.log("**********咖派第"+pageIndex+"页");
					res.render('kpmorenews', {newsList: list1});
					//资讯列表缓存600秒
					myClient.setValue(key, expires, JSON.stringify({newsList: list1}), null);
				}
			});
		}
	});
});

/**
 * 咖派资讯详情
 */
router.get("/lofti/api/kpnews/:news_id", function(req, res) {
	if (req.query.user_id == undefined) {
		res.json({
			action: "jumpConsultationDetail",
			data: {
				err: "user_id参数无效"
			}
		});
		return;
	}
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
						res.render('kpnewsdetail', {
							news: JSON.parse(reply),
							user_id: req.query.user_id,
							urlType: req.query.urlType,
							user_identify: obj3? obj3.user_identify: 0,
							user_head: obj3.get("user_info").get("head_portrait") || "",
							// 如果点赞关系为空则未点赞，否则取点赞值
							isLiked: (obj2 == null ? -1 : obj2.state)
						});
					});
				}else{
					res.render('kpnewsdetail', {
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
					if (obj.editor_id != null) {
						newsService.getUserById(obj.editor_id, function (err, obj3) {
							res.render('kpnewsdetail', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								user_identify: obj3? obj3.user_identify: 0,
								user_head:obj3.get("user_info").get("head_portrait") || "",
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
						//翻译小编不存在
					} else {
						//获取是否点赞
						newsService.getLikeRelation(params, function (err, obj2) {
							res.render('kpnewsdetail', {
								news: obj,
								user_id: req.query.user_id,
								urlType: req.query.urlType,
								isLiked: (obj2 == null ? -1 : obj2.state) //如果点赞关系为空则未点赞，否则取点赞值
							});
						});
					}
				});
				myClient.setValue(obj.news_id, 600, JSON.stringify(obj), null); //setValue(key, expire, value, callback)
			});
		}
	});
	//只要有请求就修改阅读数
	newsService.getReadCountById(news_id, function(err, obj){
		newsService.updateNews(news_id,{read_count:obj.read_count+1}, function(err, obj){});
	});
});
/**
 * 翻译：赏，踩
 * 1.修改资讯中的赞，踩值，2.并且建立点赞关系，3.减少点赞者的分值
 */
router.get(apiUri.zanbianUri + "/:news_id", function(req, res) {
	var news_id = req.params.news_id;
	var kv = {};
	newsService.getNewsById(req.params, function(err, obj) {
		if(req.query.type == 1){
			//赞赏
			kv.like_count = obj.like_count + 1;
			//并行
			async.parallel([
				//修改资讯汇中的值赞贬值
				function(callback){
					newsService.updateNews(news_id, kv, function(err, obj1) {
						callback(null, obj1);
					});
				},
				//创建赞贬关系
				function(callback){
					var params = {
						news_id: req.params.news_id,
						user_id: req.query.user_id,
						editor_id: obj.editor_id,
						type: req.query.type
					};
					newsService.createTransLike(params, function(err, obj2){
						callback(null, obj2);
					});
				},
				//修改被赏用户分值+分
				function(callback){
					userService.getUserById({user_id:obj.editor_id}, function(obj3){
						var params = {
							user_integral:obj3.get("user_info").get("user_integral") + 1
						};
						userService.updateUser(obj.editor_id, params, function(err, obj6){
							callback(null, obj6);
						});
					});
				},
				//修改赞赏用户分值-分
				function(callback){
					userService.getUserById(req.query, function(obj4){
						var params = {
							user_integral:obj4.get("user_info").get("user_integral") - 1
						};
						//积分大于0修改，否则无操作
						if(obj4.get("user_info").get("user_integral")>0){
							userService.updateUser(req.query.user_id, params, function(err, obj5){
								callback(null, obj5);
							});
						}
					});
				}
			], function (err, result) {
				res.end();
			});
		}else if(req.query.type == -1){
			//踩贬
			kv.belittle_count = obj.belittle_count + 1;
			//并行
			newsService.updateNews(news_id, kv, function(err, obj1) {
				res.end();
			});
		}
	});
});
/**
 * 资讯点赞
 */
router.get(apiUri.isLikeUri, function(req, res) {
	newsService.getLikeRelation(req.query, function(err, obj) {
		// 查询是否存在
		if (obj) {
			var updateKV = {
				state: req.query.isLiked,
				update_date: moment().format("YYYY-MM-DD HH:mm:ss")
			};
			newsService.updateNewsLike(updateKV, req.query, function(err, obj) {
				// 更新点赞状态
				var resObj = new responseObj();
				resObj.command = req.query.command;
				resObj.object.isLiked = req.query.isLiked;
				resObj.status = true;
				resObj.code = "0000";
				res.json(resObj);
			});
		} else {
			newsService.createNewsLike(req.query, function(err, obj) {
				// 创建点赞关系
				var resObj = new responseObj();
				resObj.command = req.query.command;
				resObj.object.isLiked = req.query.isLiked;
				resObj.status = true;
				resObj.code = "0000";
				res.json(resObj);
			});
		}
	});
});
/**
 * 评论列表
 */
router.get(apiUri.commentsUri + '/' + ':newsId', function(req, res) {
	// 缓存机制需要修改
	var cacheKey = 'comments-' + req.params.newsId;
	var params = {
		news_id:req.params.newsId,
		comment_state : 0,
		comment_type: "hd"
	};
	myClient.select(cacheKey, function(err, reply) {
		if (reply) {
			res.send(reply);//直接发送json字符串,不能使用json()方法
		} else {
			newsComService.getCommentList(params, function(err, list) {
				//async循环start
				async.map(list, function(item, callback){
					//日期格式化
					item.setDataValue("create_date", dateUtils.format(item.get("create_date")));
					var headPortrait = config.qiniu.download_website + config.qiniu.defaul_user_head;
					if(item.get("user")) {
						headPortrait = config.qiniu.download_website + item.get("user").get("user_info").getDataValue("head_portrait");
						item.get("user").get("user_info").setDataValue("head_portrait", headPortrait);
					}
					//查询当前用户是否点赞过该评论
					newsComService.getCommentLikeRelation({user_id:req.query.user_id,news_comment_id:item.comment_id}, function(err, obj){
						if(obj == null){
							item.setDataValue("isLike", 0);//点赞关系为空时设为0未点赞
						}else{
							item.setDataValue("isLike", obj.state);//不为空时设置关系中的点赞状态
							item.setDataValue("like_relation_id", obj.like_relation_id);//点赞关系id
						}
						callback(null, item);
					});
				}, function(err, results){
					res.json(results);
					//myClient.setValue(cacheKey, 600, JSON.stringify(results), null);//评论信息不缓存，防止用户点赞以后刷新却显示没有点赞
				});
				//end
			});
		}
	});
});
/**
 * 咖派评论列表
 */
router.get('/lofti/api/kpcomments/:newsId', function(req, res) {
	var params = {
		news_id:req.params.newsId,
		comment_state : 0,
		comment_type: 'kp'
	};
	newsComService.kpCommentList(params, function(err, list) {
		async.map(list, function(item, callback){
			//日期格式化
			item.setDataValue("create_date", dateUtils.format(item.get("create_date")));
			var headPortrait = config.qiniu.download_website + config.qiniu.defaul_user_head;
			if(item.get("user")) {
				headPortrait = config.qiniu.kp_site + item.get("user").getDataValue("headPortrait");
				item.get("user").setDataValue("headPortrait", headPortrait);
			}
			//查询当前用户是否点赞过该评论
			newsComService.getCommentLikeRelation({user_id:req.query.user_id,news_comment_id:item.comment_id}, function(err, obj){
				if(obj == null){
					item.setDataValue("isLike", 0);//点赞关系为空时设为0未点赞
				}else{
					item.setDataValue("isLike", obj.state);//不为空时设置关系中的点赞状态
					item.setDataValue("like_relation_id", obj.like_relation_id);//点赞关系id
				}
				callback(null, item);
			});
		}, function(err, results){
			res.json(results);
		});
		//end
	});
});
/**
 * 添加评论
 */
router.post(apiUri.commentsUri, function(req, res) {
	if(req.body.reply_user_id!=null && req.body.reply_user_id!=""){
		req.body.is_reply = 1;
	}
	newsComService.addComment(req.body, function(err, obj) {
		res.json(obj);
	});
});
/**
 * 咖派添加评论
 */
router.post('/lofti/api/kpcomments/', function(req, res) {
	var body = req.body;
	var params = {
		comment_content: body.comment_content,
		reply_user_id: body.reply_user_id,
		reply_comment_id: body.reply_comment_id,
		reply_nick_name: body.reply_nick_name,
		is_reply: body.is_reply!=1?0:1,
		creator_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		user_id: body.user_id,
		news_id: body.news_id
	};
	if(req.body.reply_user_id!=null && req.body.reply_user_id!=""){
		params.is_reply = 1;
	}
	newsComService.addKpComment(params, function(err, obj) {
		var headPortrait = config.qiniu.kp_site + obj.get("user").getDataValue("headPortrait");
		obj.get("user").setDataValue("headPortrait", headPortrait);
		res.json(obj);
	});
});
/**
 /**
 * 评论点赞,建立点赞关系，对评论点赞数加减
 */
router.post(apiUri.commentsUri+"/:comment_id/isLike", function(req, res) {
	async.parallel([
		function(callback){
			//新建点赞关系或修改点赞状态
			newsComService.getCommentLikeRelation({user_id:req.body.user_id,news_comment_id:req.body.news_comment_id}, function(err, obj){
				if(obj == null){
					req.body.like_relation_id=null;
					newsComService.updateCommentRelation(req.body, function(err, obj) {
						callback(null,obj);
					});
				}else{
					req.body.like_relation_id=obj.like_relation_id;
					newsComService.updateCommentRelation(req.body, function(err, obj) {
						callback(null,obj);
					});
				}
			});
		},
		function(callback){
			//修改评论点赞数
			var params = {news_comment_id:req.body.news_comment_id};
			if(req.body.state==1){
				params.value=1;
			}else if(req.body.state==0) {
				params.value=-1;
			}
			newsComService.updateComLikeCount(params, function(err, obj) {
				callback(null,obj);
			});
		}
	],function(err, results){
		res.json(results);
	});
});
module.exports = router;