/**
 * Created by thinkpad on 2015/8/27.
 */
var express = require('express');
var messagepush = require('../services/MessagePushService');
var videoService = require('../services/VideoService');

var dateUitls = require('../utils/dateUtils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('push');
});

router.post('/sendMessage', function(req, res, next) {
    //console.log("#########################"+JSON.stringify(req.body));

    var params = {};

    var userId = req.body.userId;
    var inputChannels = req.body.inputChannels;
    var selectPushTime = req.body.selectPushTime;

    if (inputChannels) {
       params.channels = inputChannels;
    }

    if (userId) {
        params.userId = userId;
    }

    if (selectPushTime) {
        params.pushTime = dateUitls.formatUTCTime(selectPushTime);
    }

    var data = {
        "userId":"NnkcvRDkDowsDT5Lhp5QgLQAdqYeHwc1" , //发起消息的用户ID
        "headPortrait":"portrait.jpg" ,              //发起用户头像
        "chatContent":"消息内容",                     //消息内容
        "chatType":0,                               //0:admin 1:post 2:person
        "postId":"lvkF55LwX7aTTYsLb7l1DVz6m5FYzUow", //帖子ID
        "nickName":"小豆",                            //发起用户昵称
        "replayNickName":"豆豆",                      //接收方昵称[预留，可不填]
        "replay":"true",                              //true:回复[预留，可不填]
        "action":"cn.handouer.kidol.comment"
    };

    params.data = data;

    //console.log("#########################"+JSON.stringify(params));

    messagepush.sendMessage(params);

    //console.log("#########################sendMessage");

    res.send(JSON.stringify(req.body));
});

/**
 * 2015-11-06 by Star / admin
 * 测试视频列表
 * 参数说明如下:
 * 热门排序>> readCount
 * 最新排序>> createDate
 * 加载更多时>> loadmore 、 最后一条数据的视频ID>> videoId (两个要配合一起用)
 */
router.post('/testVideo', function(req, res){

	//// 默认场景 (默认加载热门视频)
	//var params = {
	//	// 不需要任何参数
	//};
	//// 场景1 (首次进入热门视频页)
	//var params1 = {
	//	order:"readCount"
	//};
	//// 场景2 (加载更多......)
	//var params2 = {
	//	direction:"loadmore",		// 加载更多标记
	//	videoId:20,					// 最后一条记录的videoId
	//	order:"readCount"			// 排序是热门 / 最新
	//};

    var params = {
        direction:req.body.direction,
        videoId:req.body.videoId,
        order:req.body.order
    };

	videoService.getVideoInfo(params, function(err, videoList){
		console.log('videoList = ' + JSON.stringify(videoList));
		res.json(videoList);
	});
});

module.exports = router;
