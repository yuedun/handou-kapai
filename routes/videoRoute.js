/**
 * Created by thinkpad on 2015/8/27.
 */
var express = require('express');
var videoService = require('../services/VideoService');
var config = require('../config/config');

var dateUitls = require('../utils/dateUtils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('video');
});

/**
 * 2015-11-06 by Star / admin
 * 测试视频列表
 * 参数说明如下:
 * 热门排序>> readCount
 * 最新排序>> createDate
 * 加载更多时>> loadmore 、 beginrow表示已经读取的记录数，将获取后续10条记录 (两个要配合一起用)
 */
router.post('/list', function(req, res){

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
	//	beginrow:20,					// 已经读取的记录数
	//	order:"readCount"			// 排序是热门 / 最新
	//};

    var params = {
        direction:req.body.direction,
        beginrow:req.body.beginrow,
        order:req.body.order
    };

	videoService.getVideoInfo(params, function(err, videoList){
		//console.log('videoList = ' + JSON.stringify(videoList));

        var qiniu_site = config.qiniu.kp_site;

        var videos = [];
        for(var key in videoList){
            var video = videoList[key];
            //console.log(video);
            var video_picture = qiniu_site + video.picture;
            var video_address = video.videoAddress;
            var video_desc = video.videoDesc;
            var video_pushtime = dateUitls.format(video.createDate);
            var video_readCount = video.readCount;

            var item = '';
            item = '<div class="item" onclick="jump(this);"data-url="'+video_address+'">';
            item += '<img src="'+video_picture+'">';
            item += '<div class="item-info">';
            //item += '<a href="javascript:void(0);"  onclick="jump(this);" data-url="'+video_address+'">';
            item += '<a href="javascript:void(0);">';
            item += '<span class="headline">'+video_desc+'</span>';
            item += '</a>';
            item += '<div class="item-rcd">';
            item += '<span class="push-time">'+video_pushtime+'</span>';
            item += '<span class="play-total">播放量:'+video_readCount+'</span>';
            item += '</div></div></div>';
            videos.push(item);


        //<div class="item">
        //    <img src="img/20151112180304.png">
        //    <div class="item-info">
        //    <a href="javascript:void(0);"  onclick="jump(this);" data-url="http://7xj01w.com2.z0.glb.qiniucdn.com/video/info13.html">
        //    <span class="headline">IU翻唱TFBOYS经典歌 中文咬字"零负评"</span>
        //    <div class="item-rcd">
        //    <span class="push-time">2015-11-12 17:56</span>
        //    <span class="play-total">播放量:9768</span>
        //    </div>
        //
        //    </div>
        //    </div>
        }
		res.json(videos);
	});
});

module.exports = router;
