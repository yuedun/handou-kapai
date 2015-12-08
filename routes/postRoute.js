/**
 * Created by admin on 2015/4/24.
 */
var express = require('express');
var router = express.Router();
var postService = require('../services/postService');
var topicService = require('../services/TopicService');
var apiUri = require('../config/apiUri');
var config = require("../config/config.json");
var moment = require('moment');
/**
 * 分享页面
 */
router.get(apiUri.shareUri + '/:user_id/:post_id', function(req, res){
    if(req.query.shareType === 'topic'){
        var params  = {
            topicId: req.params.post_id
        };
        //频道分享
        topicService.getTopicToShare(params, function(err, obj){
            var pics = obj[0].topic_pics.split(",");
            var topicPics = [];
            pics.forEach(function(item, index){
                if (item) {
                    topicPics.push(config.qiniu.kp_site + item);
                };
            });
            obj[0].pictureList = topicPics;
            obj[0].audio_address = config.qiniu.kp_site + obj[0].audio_address;
            obj[0].head_portrait = config.qiniu.kp_site + obj[0].head_portrait;
            obj[0].create_date = moment(obj[0].create_date).format('YYYY-MM-DD HH:mm:ss');
            obj[0].commentList = [];
            res.render('kpshare', {post: obj[0]});
        });
    } else {
        postService.getPostById(req.params, function(obj){
            if(obj != null){
                obj.create_date = moment(obj.create_date).format('YYYY-MM-DD HH:mm:ss');
                res.render('share', {post: obj});
            } else{
                res.render('error', {message: '找不到帖子信息'});
            }
        });
    }
});


module.exports = router;
