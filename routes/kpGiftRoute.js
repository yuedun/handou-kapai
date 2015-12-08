"use strict";
/**
 * Created by admin on 2015/09/09.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var giftService = require('../services/giftService');
var addressService = require('../services/addressService');
var userService = require('../services/UserService');
/**
 * 礼品列表
 */
router.get('/gift-list1',function(req,res){
	var index = req.query.pageIndex ? req.query.pageIndex : 1;
	var pageSize = req.query.pageSize ? req.query.pageSize : 10;
	var pageIndex = index == null ? 0 : (index - 1) * pageSize;
	var startDate = req.query.startDate?req.query.startDate:null;
	var endDate = req.query.endDate?req.query.endDate:null;
	var postChoose = req.query.postChoose;
	var keyWord = req.query.keyWord?req.query.keyWord:null;
	var order = req.query.order;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:startDate,
		endDate:endDate,
		postChoose:postChoose,
		keyWord:keyWord,
		order:order
	};
	var totalCount = 0;
	giftService.getKpGiftCount(params,function(err,count){
		totalCount = count[0].count;
	giftService.getKpGiftList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.createDate != null){
				item.createDate = dateUtils.formatDate(item.createDate);
			}
			if(item.updateDate != null){
				item.updateDate = dateUtils.formatDate(item.updateDate);
			}
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/gift_list',{giftList:results,totalCount:totalCount,currentPage:index,params:params});
		});	
	});
	});
});
/**
 * 新增礼品UI
 */
router.get('/gift-addui',function(req,res){
	
	res.render('admin/user/gift_add',{status:true, qntoken: qiniutoken});
});
/**
 * 新增礼品
 */
router.post('/gift-add',function(req,res){
	var giftName = req.body.giftName;
	var bean = req.body.bean;
	var picturePath = req.body.starLogo;
	var params = {
		giftName:giftName,
		bean:bean,
		picturePath:picturePath
	};
	giftService.createKpGift(params,function(err,obj){
		res.redirect('/admin/gift-list');
	});
});

/**
 * 删除礼品
 */
router.get('/delete-gift',function(req,res){
	var giftId = req.query.giftId;
	giftService.deleteGift({giftId:giftId},function(err,obj){
		res.redirect('/admin/gift-list');
	});
});
/**
 * 修改礼品UI
 */
router.get('/update-giftUi',function(req,res){
	var giftId = req.query.giftId;
	giftService.findGiftObj({giftId:giftId},function(err,obj){
		res.render('admin/user/gift_update',{gift:obj,status:true, qntoken: qiniutoken});
	});
});
/**
 * 修改礼品
 */
router.post('/update-gift',function(req,res){
	var giftId = req.body.giftId;
	var giftName = req.body.giftName;
	var bean = req.body.bean;
	var picturePath = req.body.starLogo?req.body.starLogo:null;
	var params = {
		giftName:giftName,
		picturePath:picturePath,
		bean:bean,
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	giftService.updateGift({giftId:giftId},params,function(err,obj){
		res.redirect('/admin/gift-list');
	});
});


/**
 * 礼品兑换列表
 */
router.get('/gift-exchange-list',function(req,res){
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var startDate = req.query.startDate?req.query.startDate:null;
	var endDate = req.query.endDate?req.query.endDate:null;
	var postChoose = req.query.postChoose;
	var keyWord = req.query.keyWord?req.query.keyWord:null;
	var state = req.query.state;
	var order = req.query.order;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:startDate,
		endDate:endDate,
		postChoose:postChoose,
		keyWord:keyWord,
		order:order,
		state:state
	};
	var totalCount = 0 ;
	giftService.getGiftExchangeCount(params,function(err,count){
		totalCount = count[0].count;
	giftService.getGiftExchangeList(params,function(err,list){
		async.map(list, function(item, callback) {
			if(item.createDate != null){
				item.createDate = dateUtils.formatDate(item.createDate);
			};
			if(item.exchangeTime != null){
				item.exchangeTime = dateUtils.formatDate(item.exchangeTime);
			};
			callback(null,item);
		}, function(err, results) {
			res.render('admin/user/gift_exchange_list',{list:results,currentPage:index,totalCount:totalCount,params:params});
		});	
	});
	});
});

/**
 * update exchange ui
 */
router.get('/update-gift-exchangeUi',function(req,res){
	var userId = req.query.userId;//用户编号
	var id = req.query.id;//礼品兑换关系表编号
	var addressId = req.query.addressId;//地址编号
	var giftId = req.query.giftId // 礼品编号
	var params = {userId:userId};
	async.parallel([
		function(callback0){
			userService.getUserByParam({userId:userId},['userId','nickName','userName','bean'],function(err,obj){
				callback0(null,obj);
			});
		},
		function(callback1){
			giftService.findGiftObj({giftId:giftId},function(err,obj){
				callback1(null,obj);
			});
		},
		function(callback2){
			giftService.findUserGiftOne({id:id},function(err,obj){
				callback2(null,obj);
			});
		},
		function(callback3){
			addressService.findAddressOne({addressId:addressId},function(err,obj){
				callback3(null,obj);
			});
		}
	],function (err, result) {
		var obj = {};
		var user = result[0];
		var gift = result[1];
		var userGift = result[2];
		var address = result[3];
		if(user !=null){
		obj.nickName = user.nickName;
		obj.userId = user.userId;
		obj.bean = user.bean;
		}
		if(gift != null){
		obj.giftName = gift.giftName;
		}
		if(address != null){
		obj.name = address.name;
		obj.phone = address.phone;
		obj.addressId = address.addressId;
		obj.province = address.province;
		obj.city = address.city;
		obj.area = address.area;
		obj.details = address.details;
		}
		if(userGift != null){
		obj.id = userGift.id;
		obj.state = userGift.state;
		obj.remarks = userGift.remarks;
		obj.expressName = userGift.expressName;
		obj.freezeBean = userGift.freezeBean;
		obj.expressNumber = userGift.expressNumber;
		}
		res.render('admin/user/gift_exchange_update',{obj:obj});
	});	
});
/**
 * 修改礼品兑换
 */
router.post('/update-exchange-gift',function(req,res){
	var freezeBean = req.body.freezeBean;
	var name = req.body.name;   //收货地址name
	var phone = req.body.phone;	//收货地址phone
	var details = req.body.details;
	var state = req.body.state;
	var addressId = req.body.addressId;
	var id = req.body.id;//kp_user_gift编号
	var userId = req.body.userId; //用户编号
	var bean = req.body.bean; //用户总豆币
	var remarks = req.body.remarks;
	var expressName = req.body.expressName;
	var expressNumber = req.body.expressNumber;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	if(state == 0 ){//待确认                  仅修改用户地址
		addressService.updateIdByAddress({addressId:addressId},{name:name,phone:phone,details:details,updateDate:date},function(err,obj){
			res.redirect('/admin/gift-exchange-list');
		});
	}else if(state ==1){//准备中        修改用户地址和兑换关系表
		async.parallel([
			function(callback0){
				addressService.updateIdByAddress({addressId:addressId},{name:name,phone:phone,details:details,updateDate:date},function(err,obj){
					callback0(null,obj);
				});
			},
			function(callback1){
				giftService.upateUserGift({id:id},{state:state,freezeBean:freezeBean,remarks:remarks,updateDate:date},function(err,obj){
					callback1(null,obj);
				});
			}
			
		],function (err, result) {
			res.redirect('/admin/gift-exchange-list');
		});	
	}else if(state ==2){//已发送
		if(parseInt(bean) >= parseInt(freezeBean)){
			bean = bean - freezeBean;
			var params = {
				state:state,
				freezeBean:0,
				expressName:expressName,
				expressNumber:expressNumber,
				exchangeTime:date,
				remarks:remarks,
				updateDate:date
			};
			async.parallel([
				function(callback0){
					userService.updateUser({userId:userId},{bean:bean},function(err, obj){
						callback0(null,obj);
					});
				},
				function(callback1){
					giftService.upateUserGift({id:id},params,function(err,obj){
						callback1(null,obj);
					});
				}
			],function (err, result) {
				res.redirect('/admin/gift-exchange-list');
			});
		}else{
			console.log("豆币不足");
			res.redirect('/admin/gift-exchange-list');
		}
	}else{//已取消
		var params = {
			state:state,
			freezeBean:0,
			updateDate:date
		};
		giftService.upateUserGift({id:id},params,function(err,obj){
			res.redirect('/admin/gift-exchange-list');	
		});
	};
});

/**
 * 物理删除礼品兑换
 */
router.get('/delete-exchange-gift',function(req,res){
	var id = req.query.id;
	giftService.deleteKpUserGift({id:id},function(err,obj){
		res.redirect('/admin/gift-exchange-list');
	});
});

/**
 * 奖品设置列表
 */
router.get('/ticketSetList',function(req,res){
	giftService.getTicketSetList({},function(err,list){
		res.render('admin/user/ticket_set_list',{list:list});		
	});
});

/**
 * 修改奖品设置
 */
router.post("/ticketSetUpdate",function(req,res){
	var id = req.body.id;
	var ticketCount = req.body.ticketCount;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	giftService.updateTicketSet({id:id},{ticketCount:ticketCount,updateDate:date},function(err,obj){
		res.redirect('/admin/ticketSetList');
	});
});

/**
 * 新增奖品设置UI
 */
router.get('/ticketSetAddUi',function(req,res){
	res.render('admin/user/ticket_set_add');
});
/**
 * 新增奖品设置
 */
router.post('/ticketSetAdd',function(req,res){
	var ticketId = req.body.ticketId;
	var ticketName = req.body.ticketName;
	var ticketCount = req.body.ticketCount;
	giftService.addTicketSet({ticketId:ticketId,ticketName:ticketName,ticketCount:ticketCount},function(err,obj){
		res.redirect('/admin/ticketSetList');
	});
});

module.exports = router;