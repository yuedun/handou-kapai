'use strict';
var express = require('express');
var router = express.Router();
var async = require('async');
var config = require('../config/config.json');
var myClient = require('../utils/redisDB').myClient;
var portalService = require('../services/portalService');
var newsService = require('../services/newsService');
var channelService = require('../services/ChannelService');
var topicPostService = require('../services/topicPostService');
var videoService = require('../services/VideoService');
var dateUtils = require('../utils/dateUtils');
var commonUtil = require('../utils/commonUtil');
/**
 * 官方首页，热点新闻
 */
router.get('/home', function(req, res, next) {
    //console.log("访问来源："+req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    // var agent = req.headers['user-agent'];
    // if ((agent.indexOf('Android') >-1 || agent.indexOf('iPhone') >-1) && req.query.url !== 'home' ) {
    //     res.redirect('/portal/news');
    // } else {
    myClient.select('recommendNewsList', function(err, reply) {
        if (reply) {
            res.render('home/index', {
                newsTops: JSON.parse(reply)
            });
        } else {
            newsService.getRecommendNewsList(req, function(err, list) {
                myClient.setValue('recommendNewsList', 600, JSON.stringify(list), null);
                res.render('home/index', {
                    newsTops: list
                });
            });
        }
    });
    // };
});
/**
 * 官方首页粉丝团列表
 */
router.route('/category').get(function(req, res, next) {
    async.parallel([
        function(callback) {
            portalService.category({
                column_type_id: 100001
            }, function(err, list) {
                callback(null, list);
            });
        },
        function(callback) {
            portalService.category({
                column_type_id: 100002
            }, function(err, list) {
                callback(null, list);
            });
        },
        function(callback) {
            portalService.category({
                column_type_id: 100003
            }, function(err, list) {
                callback(null, list);
            });
        },
        function(callback) {
            portalService.category({
                column_type_id: 100004
            }, function(err, list) {
                callback(null, list);
            });
        }
    ], function(err, result) {
        res.render('home/category', {
            categories: result
        });
    });
}).post(function(req, res, next) {
    portalService.userNeedCategory(req.body, function(err, obj) {
        res.json("已添加：" + req.body.categoryNames);
    });
});
/**
 * 官方首页资讯
 */
router.get('/news', function(req, res, next) {
    var key = config.redis_cache.portal_news_list.key + req.query.offset; //不同请求的缓存key值
    var expires = config.redis_cache.portal_news_list.expires; //过期时间
    var pageIndex = req.query.offset;
    myClient.select(key, function(err, reply) {
        //缓存
        if (reply) {
            if (req.query.offset) {
                res.render('home/morenews', JSON.parse(reply));
            } else {
                res.render('home/news', JSON.parse(reply));
            }
        } else {
            var dateStr = "";
            var dateStr2 = "";
            //普通资讯列表
            async.parallel([
                    //首页推荐,pageIndex为空或0时查询推荐，否则返回空值
                    function(callback) {
                        if (pageIndex == null || pageIndex == 0) {
                            newsService.getRecommendNewsList(req.query, function(err, list) {
                                callback(null, list);
                            });
                        } else {
                            callback(null, null);
                        }
                    },
                    //普通资讯
                    function(callback) {
                        newsService.getNewsList(req.query, function(err, list) {
                            var length = list.length;
                            for (var i = 0; i < length; i++) {
                                dateStr = dateUtils.format(list[i].create_date);
                                list[i].create_date = dateStr;
                                if (list[i].release_date) {
                                    dateStr2 = dateUtils.format(list[i].release_date);
                                    list[i].release_date = dateStr2;
                                }
                            }
                            callback(null, list);
                        });
                    },
                    //最热资讯
                    function(callback) {
                        var params = {
                            limit: 10
                        };
                        newsService.getHotNewsList(params, function(err, list) {
                            callback(null, list);
                        });
                    }
                ],
                function(err, results) {
                    var rs = {
                        recommendNewsList: results[0],
                        newsList: results[1],
                        hotNews: results[2],
                        category_id: '',
                        category_name: null
                    };
                    if (pageIndex == null || pageIndex == 0) {
                        res.render('home/news', rs);
                        //资讯列表缓存600秒,缓存内容包括普通资讯与推荐资讯
                        myClient.setValue(key, expires, JSON.stringify(rs), null);
                    } else {
                        res.render('home/morenews', {
                            newsList: results[1]
                        });
                        //资讯列表缓存600秒
                        myClient.setValue(key, expires, JSON.stringify({
                            newsList: results[1],
                            hotNews: results[2]
                        }), null);
                    }
                }
            );
        }
    });
});
/**
 * 根据粉丝团查询资讯
 */
router.get('/news/category/:category_id', function(req, res, next) {
    var params = {
        categoryIds: [req.params.category_id],
        offset: req.query.offset,
        limit: req.query.limit
    };
    var key = 'filter_news_list_' + req.params.category_id + "_" + req.query.offset;
    var pageIndex = req.query.offset;
    myClient.select(key, function(err, reply) {
        if (reply) {
            if (req.query.offset) {
                res.render('home/morenews', JSON.parse(reply));
            } else {
                res.render('home/news', JSON.parse(reply));
            }
        } else {
            var dateStr = "";
            var dateStr2 = "";
            //普通资讯列表
            async.parallel([
                    //过滤资讯
                    function(callback) {
                        newsService.getNewsFilterResultList(params, function(err, list) {
                            var length = list.length;
                            for (var i = 0; i < length; i++) {
                                dateStr = dateUtils.format(list[i].create_date);
                                list[i].create_date = dateStr;
                                if (list[i].release_date) {
                                    dateStr2 = dateUtils.format(list[i].release_date);
                                    list[i].release_date = dateStr2;
                                }
                            }
                            callback(null, list);
                        });
                    },
                    //最热资讯
                    function(callback) {
                        var params = {
                            limit: 10
                        };
                        newsService.getHotNewsList(params, function(err, list) {
                            callback(null, list);
                        });
                    }
                ],
                function(err, results) {
                    var rs = {
                        recommendNewsList: null,
                        newsList: results[0],
                        hotNews: results[1],
                        category_id: req.params.category_id,
                        category_name: req.query.category_name
                    };
                    if (pageIndex == null || pageIndex == 0) {
                        res.render('home/news', rs);
                        //资讯列表缓存600秒,缓存内容包括普通资讯与推荐资讯
                        myClient.setValue(key, 20, JSON.stringify(rs), null);
                    } else {
                        res.render('home/morenews', {
                            newsList: results[1]
                        });
                        //资讯列表缓存600秒
                        //myClient.setValue(key, 20, JSON.stringify({newsList: results[1],hotNews: results[2]}), null);
                    }
                }
            );
        }
    });
});
/**
 * 资讯详情
 */
router.get('/news/:news_id', function(req, res, next) {
    var news_id = req.params.news_id;
    myClient.select(news_id, function(err, reply) {
        if (reply) {
            res.render('home/news_detail', {
                news: JSON.parse(reply)
            });
        } else {
            newsService.getNewsById(req.params, function(err, obj) {
                try {
                    obj.setDataValue("create_date", dateUtils.format(obj.create_date));
                    if (obj.release_date) {
                        obj.setDataValue("release_date", dateUtils.format(obj.release_date));
                    }
                } catch (e) {
                    console.error(e.message);
                    res.render('error', {
                        message: e.message
                    });
                    return;
                }
                res.render('home/news_detail', {
                    news: obj
                });
                myClient.setValue(obj.news_id, 600, JSON.stringify(obj), null); //setValue(key, expire, value, callback)
            });
        }
    });
    //只要有请求就修改阅读数
    newsService.getReadCountById(news_id, function(err, obj) {
        if (err) {
            console.error(news_id + "is not found ", dateUtils.formatDate() + "error message:"+err);
        } else {
            var readCount = obj.getDataValue("read_count");
            newsService.updateNews(news_id, {
                read_count: readCount + 1
            }, function(err, obj) {

            });
        }
    });
});

/**
 * 最新活动
 */
router.get('/activity', function(req, res) {
    res.render('home/activity', {});
});

/**
 * 官网频道
 */
router.get('/topic', function(req, res) {
    var params = {
        offset: 0,
        limit: 20
    };
    channelService.portalTopic(params, function(err, list) {
        list.forEach(function(item, index){
            item.headPortrait = commonUtil.headPortrait(item);
            let pics = item.topicPics.split(",");
            pics.forEach(function(item2, index2){
                item2 = commonUtil.headPortrait({headPortrait: item2});
                pics[index2] = item2;
            });
            item.pics = pics;
        });
        res.render('home/topic', {list: list});
    });
});

/**
 *
 * 2015-11-11
 * 官方视频 首页
 */
router.get('/video', function(req, res){
	var params = {
		
	};
	videoService.officiaVideoList(params, function(err, videolist){
		async.map(videolist, function(item, callback){
			// 处理图片
			item.picture = commonUtil.headPortrait({headPortrait:item.picture});
			// 处理时间
			item.createDate = dateUtils.formatDate(item.createDate);
			callback(null, item);
		},function(err, results){
			res.render('home/video',{videolist: results});
		});
	});
});

/**
 * 2015-11-12 
 * 视频详情 
 */
router.get('/videoDetails', function(req, res){
	var object = req.query;
	var params = {
		videoId:object.videoId
	};
		
	// 每访问一次阅读量就加一	
	videoService.editVideoInfo(params, function(err, obj){
		console.log('obj = ' + obj);
	});
	
	// 获取视频信息
	videoService.findOneVideo(params, function(err, videoInfo){
		// 有标签时按标签查询相关视频
		if(videoInfo.videoTag){
			var params1 = {
				videoTag:videoInfo.videoTag
			};
			videoService.officiaTagVideoList(params1, function(err, videolist){
				async.map(videolist, function(item, callback){
					// 处理图片
					item.picture = commonUtil.headPortrait({headPortrait:item.picture});
					// 处理时间
					item.createDate = dateUtils.formatDate(item.createDate);
					callback(null, item);
				}, function(err, results){
					res.render('home/video_details',{video:videoInfo, videolist:results, flag:object.videoId});
				});
			})
		} else {
			// 没有标签时查询其他的视频
			var params2 = {
				videoTag:""		// 该条件下不需要传递参数
			};
			videoService.officiaTagVideoList(params2, function(err, videolist){
				async.map(videolist, function(item, callback){
					// 处理图片
					item.picture = commonUtil.headPortrait({headPortrait:item.picture});
					// 处理时间
					item.createDate = dateUtils.formatDate(item.createDate);
					callback(null, item);
				}, function(err, results){
					res.render('home/video_details',{video:videoInfo, videolist:results, flag:object.videoId});
				});
			})
		}
	});
});

/**
 * 官网频道异步加载内容
 */
router.get('/getTopic', function(req, res) {
    var object = req.query;
    var params = {
        offset: (object.pageIndex == null ? 0 : (object.pageIndex - 1) * object.pageSize),
        limit: (object.pageSize == null ? 20 : object.pageSize)
    };
    channelService.portalTopic(params, function(err, list) {
        list.forEach(function(item, index){
            item.headPortrait = commonUtil.headPortrait(item);
            let pics = item.topicPics.split(",");
            pics.forEach(function(item2, index2){
                item2 = commonUtil.headPortrait({headPortrait: item2});
                pics[index2] = item2;
            });
            item.pics = pics;
        });
        res.render('home/moretopic', {list: list});
    });
});


module.exports = router;