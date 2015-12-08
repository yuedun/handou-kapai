"use strict";
/**
 * Created by admin on 2015/1/19.
 */
var async = require('async');
var express = require('express');
var router = express.Router();
var giftService = require('../services/giftService');
var userService = require('../services/UserService');
var apiUri = require('../config/apiUri');
var config = require('../config/config.json');
var moment = require('moment');

router.get(apiUri.baseApi, function(req, res){
	res.status(200).json({'ok': 'you access this site successfully.'});
});

/**
 * 礼品默认列表
 * localhost:3000/lofti/api/gift/000435215f40498ebc311a319d7ba184
 */
router.get(apiUri.giftUri + '/:user_id', function(req, res){
	res.redirect("/portal/home");
//  getGift(req, res);
});
/**
 * 咖派商城礼品列表
 * localhost:3000/lofti/kpshop/gift/000435215f40498ebc311a319d7ba184
 */
router.get('/lofti/kpshop/gift/:userId', function(req, res){
    var params = {
        offset: req.query.pageIndex,
        limit: 100,
        userId: req.params.userId,
        attributes: ['userId','nickName','bean']
    };
    async.parallel([
        function(callback){
            giftService.shopKpGiftList(params, function(err, gifts){
                callback(null, gifts);
            });
        },
        function(callback){
            giftService.getKPUserGift({userId: params.userId}, function(err, exchangeList){
                callback(null, exchangeList);
            });
        },
        function(callback){
            userService.getUserInfo(params, function(err, obj){
                callback(null, obj);
            });
        }
    ], function(err, results){
        var freezeIntegral = 0;//冻结积分
        results[0].forEach(function(item, index){
            item.setDataValue("picturePath", config.qiniu.kp_site + item.getDataValue("picturePath"));
        });
        results[1].forEach(function(item2, index2){
            freezeIntegral += item2.getDataValue("freezeBean");
        });
        res.render('kpshop', {giftList: results[0], user: results[2], freezeIntegral: freezeIntegral});
    });
});
/**
 * 礼品列表by sequelize id:  000435215f40498ebc311a319d7ba184
 * localhost:3000/lofti/api/gift/000435215f40498ebc311a319d7ba184
 */
router.get(apiUri.giftUri + '/:user_id/:offset/:limit', function(req, res){
    getGift(req, res);
});
//礼品列表共用
function getGift(req, res){
    giftService.getList(req.params, function(err, collection){
        if(collection == null || collection.length == 0) {
        	res.status(304).end();
        } else {
            userService.getUserById(req.params, function(err, obj) {
            	if(obj == null) {
            		res.render('error', {message: '用户不存在~~', error: '页面未找到'});
            	}
                giftService.getUserGiftListByUserId(req.params, function(err, giftList){
                    if(collection.length != 0 && obj != null) {
                        var onceGiftName = '专辑（限第一次特惠）', gift;
                        for(var j = 0; j < collection.length; j++) {
                            if(collection[j].gift_name == onceGiftName) {
                                gift = collection[j];
                            }
                        }
                        var freezeTotal = 0;//冻结积分
                        var l = giftList.length;//兑换列表
                        for(var i = 0; i < l; i ++){
                            var f = giftList[i].freeze_integral;
                            freezeTotal = freezeTotal + f;
                            if(gift && giftList[i].gift_id === gift.id && giftList[i].delivery_status !== -1) {
                                gift.setDataValue('hasExechanged', true);
                            }
                        }
                        //有分页参数且不是第一页，即为加载更多
                        if(req.params.offset != null && req.params.offset !=1){
                            res.render('moregift', {list: collection, user: obj, freezeIntegral: freezeTotal});
                        } else {
                            res.render('integral', {list: collection, user: obj, freezeIntegral: freezeTotal});
                        }
                    } else {
                        res.render('error', {message: '没有兑换记录~~', error: '页面未找到'});
                    }
                });
            });
        }
    });
}

/**
 * 查看进度 默认无分页
 * http://localhost:3000/lofti/api/gift/process/000435215f40498ebc311a319d7ba184
 */
router.get(apiUri.giftProcessUri + '/:user_id', function(req, res){
    giftService.getProcess(req.params, function(err, list){
        for(var i = 0; i < list.length; i++){
            var dateStr = moment(list[i].get('create_date')).format('YYYY-MM-DD HH:mm:ss');
            list[i].setDataValue('create_date', dateStr);
        }
        res.render('process', {list: list});
    });
});
/**
 * 查看进度 id:  000435215f40498ebc311a319d7ba184
 * http://localhost:3000/lofti/api/gift/process/000435215f40498ebc311a319d7ba184
 */
router.get(apiUri.giftProcessUri + '/:user_id/:offset/:limit', function(req, res){
    giftService.getProcess(req.params, function(err, list){
        for(var i = 0; i < list.length; i++){
            var dateStr = moment(list[i].get('create_date')).format('YYYY-MM-DD HH:mm:ss');
            list[i].setDataValue('create_date', dateStr);
        }
        res.render('moreprocess', {list: list});
    });
});
/**
 * 咖派
 * 商城兑换进度
 * http://localhost:3000/lofti/kpshop/gift/process/000435215f40498ebc311a319d7ba184
 */
router.get('/lofti/kpshop/gift/process/:userId', function(req, res){
    var params = {
        offset: req.query.pageIndex,
        limit: req.query.pageSize,
        userId: req.params.userId
    };
    giftService.getKpProcess(params, function(err, list){
        list.forEach(function(item, index){
        	item.setDataValue("createDate", moment(item.getDataValue("createDate")).format('YYYY-MM-DD HH:mm:ss'));
        });
        if(req.query.pageIndex == null){
            res.render('kpprocess', {process: list});
        } else {
            res.render('kpmoreprocess', {process: list});
        }
    });
});

/**
 * 添加兑换记录
 */
router.post(apiUri.userGiftUri + '/:user_id' + '/:gift_id'  , function(req, res){
    giftService.addUserGift(req, function(err, obj){
        res.json('恭喜您，兑换成功');
    });
});
/**
 * 咖派
 * 添加兑换记录
 */
router.post('/lofti/kpshop/gift/user-gift/:userId/:giftId', function(req, res){
    var params = {
        userId: req.params.userId,
        giftId: req.params.giftId,
        freezeBean: req.body.freezeBean
    };
    //先判断是否为专辑，是否兑换过
    async.waterfall([
        function(callback){
            var giftParam = {
                giftId: req.params.giftId,
                userId: req.params.userId,
                state: {$gte: 0}
            };
            giftService.getKPUserGift(giftParam, function(err, list){
                callback(null, list[0]);
            });
        },
        function(gift, callback){
            if(gift && gift.getDataValue("giftId") == "7238c170636f11e585ab93f6c27005fd"){
                callback("对不起，您已兑换过专辑，仅限一次哦！");
            } else {
                giftService.addKpUserGift(params, function(err, obj){
                    callback(null, obj);
                });
            }
        }
    ],function(err, result){
        if(err){
            res.json(err);
        } else {
            res.json('恭喜您，兑换成功');
        }
    });
});
/**
 * 删除兑换记录
 */
router.delete(apiUri.giftUri + '/:id', function(req, res){
    giftService.deleteUserGift(req.params, function(err, obj){
        res.json('删除成功');
    });
});
/**
 * 咖派
 * 删除兑换记录，取消兑换，修改状态
 */
router.post('/lofti/kpshop/gift/:userGiftId', function(req, res){
    var state = req.body.action;
    var params = {
        condition: {
            id: req.params.userGiftId
        },
        fields: {
            state: state,
            freezeBean: 0
        }
    };
    giftService.updateUserGift(params, function(err, obj){
        if (err) {
            res.send("取消失败！");
        } else {
            switch (req.body.action){
                case "-1":
                    res.send('取消成功');
                    break;
                case "-2":
                    res.send('删除成功');
                    break;
                default: res.send("操作成功");
            }
        }
    });
});
/**
 * 取消兑换
 */
router.put(apiUri.giftUri + '/:id', function(req, res){
    giftService.cancelUserGift(req.params, function(err, list){
        if(list.length > 0){
            res.json('取消成功');
        }
    });
});

/**
 * 获取用户所在粉丝团列表
 */
router.get(apiUri.categoryUri + '/:user_id', function(req, res){
    giftService.getCategory(req.params, function(err, list){
        var categoryList = [];
        for(var i = 0; i < list.length; i++){
            categoryList.push(list[i].get('category'));
        }
        res.json(categoryList);
    });
});
/**
 * 咖派
 * 获取用户收货信息
 */
router.get('/lofti/kpshop/gift/address/:userId', function(req, res) {
    var params = {
        user_id: req.params.userId,
        type: 1//咖派用户
    };
    userService.getKpUserAddress(req.params, function(err, obj){
        res.json(obj);
    })
});

module.exports = router;