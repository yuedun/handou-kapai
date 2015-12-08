"use strict";
/**
 * Created by admin on 2015/10/14.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var https = require('https');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var weiboDataService = require('../services/weiboDataService');
var userService = require('../services/UserService');
var schedule = require("node-schedule");
var commonUtil = require('../utils/commonUtil');
var topicService = require('../services/TopicService');
var beanRelationService = require('../services/BeanRelationService.js');
var config = require('../config/config');
var TopicService = require('../services/TopicService');
var fs= require('fs');
/**
 * 得到accessTopken
 * 用于调用access_token，接口获取授权后的access token。 
 */
router.get('/outside-admin/getAccessToken',function(req,res){
	var object = req.query;
	//url重定向之后得到code    
	//得到accessToken和uid
	//根据uid查询kp_user表
	//修改org_verify中的accessToken
	weiboDataService.getAccessToken({code:object.code},function(err,body){
		var params = {
			accessToken:body.access_token,
			tokenState:1
		};
		var orgId = req.session.outsideSessionUser.orgId;//得到登录用户的微博uid
		var uid = body.uid;//得到授权后返回的uid
		if(orgId == uid){
			userService.getUserByParam({orgToken:body.uid},['userId','orgToken'],function(err,userObj){
				userService.updateUserVerify({userId:userObj.userId},params,function(err,obj){
					//res.render('weiboSuccess',{});
					res.redirect('/outside-admin/org-success?flag=1');
				});
			});
		}else{
			res.render('weiboError',{});
		}
	});
});



/**
 * 微博帖子列表
 */
router.get('/admin/getWeiboList',function(req,res){
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:15;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var state = req.query.state;
	var params = {
		pageSize:pageSize,
		pageIndex:pageIndex,
		startDate:req.query.startDate,
		endDate:req.query.endDate,
		postChoose:req.query.postChoose,
		keyWord:req.query.keyWord,
		order:req.query.order
	};
	if(state){
		params.topicState = state;
	}else{
		params.topicState = 1;
	}
	weiboDataService.getWeiboCount(params,function(err,count){
		var totalCount = count[0].count;
		weiboDataService.getWeiboList(params,function(err,weiboList){
			weiboList.forEach(function(item,index){
				item.createDate = item.createDate?dateUtils.formatDate(item.createDate):"";
				item.createAt = item.createAt?dateUtils.formatDate(item.createAt):"";
			});
			res.render('admin/user/weibo_list',{weiboList:weiboList,currentPage:index,totalCount:totalCount,params:params})
		});
	});
});

/**
 * 修改微博帖子UI
 */
router.get('/admin/weiboUpdateUI',function(req,res){
	var topicId = req.query.topicId;
	var state = req.query.state;
	weiboDataService.getWeiboList({topicId:topicId},function(err,weiboObj){
		var obj = weiboObj[0];
		var picsArr = [];
		if(null != obj.topicPics){
			picsArr = obj.topicPics.split(",");	
		}
		res.render('admin/user/weibo_update',{obj:obj,status:true, qntoken: qiniutoken,picsArr:picsArr,state:state})
	});
});

/**
 * 修改微博帖子
 */
router.post('/admin/weiboUpdtae',function(req,res){
	var object = req.body;
	var topicState = object.topicState;
	var upstate = object.upstate;
		async.parallel([
			//修改weibo_topic原始表
			function(callback1){
				var params = {
					topicState:1,
					topicPics:object.starLogo?object.starLogo.toString():null,
					picsSize:object.picsSize?object.picsSize:null,
					topicName:object.topicName,
					topicDesc:object.topicDesc
				};
				weiboDataService.updateWeiboTopic({topicId:object.topicId},params,function(err,obj){
					callback1(null,obj);			
				});
			},
			//把数据同步至topic表中
			function(callback2){
				var params2 = {
					id:object.sinceId,
					topicName:object.topicName,
					topicDesc:object.topicDesc,
					createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
					updateDate:moment().format("YYYY-MM-DD HH:mm:ss"),
					topicPics:object.starLogo?object.starLogo.toString():null,
					picsSize:object.picsSize?object.picsSize:null,
					topicType:3,
					userId:object.userId,
					topicState:1,
					topicScope:0,
					groupId:object.groupId
				};
				weiboDataService.addTopic(params2,function(err,topicObj){
					callback2(null,topicObj);
				});
			}
		], function(err, result) {
			res.redirect('/admin/getWeiboList?state='+upstate+'');		
		});
});

/**
 * 删除微博帖子
 */
router.get('/admin/weiboDelete',function(req,res){
	var topicId = req.query.topicId;
	var state = req.query.state;
	async.parallel([
		function(callback0){//逻辑删除weibotopic对应的数据
			weiboDataService.updateWeiboTopic({sinceId:topicId},{topicState:-2},function(err,obj){
				callback0(null,obj);
			});
		},
		function(callback1){//物理删除topic表中的数据
			TopicService.deleteTopic({topicId:topicId},function(obj){
				callback1(obj);
			});
		}
	], function(err, result) {	
		res.redirect('/admin/getWeiboList?state='+state+'');		
	});	

});

/**
 * 批量删除帖子
 */
router.get('/admin/batchDelete',function(req,res){
	var ids = req.query.ids;
	var state = req.query.delState;
	async.parallel([
		function(callback0){
			ids.forEach(function(item,index){
				weiboDataService.updateWeiboTopic({sinceId:item},{topicState:-2},function(err,obj){
					if(index==ids.length-1){
						callback0(null,obj);
					}
				});
			});
		},
		function(callback1){
			ids.forEach(function(item,index){
				TopicService.deleteTopic({topicId:item},function(obj){
					if(index==ids.length-1){
						callback1(null,obj);
					}
				});
			});
		}
	], function(err, result) {	
		res.redirect('/admin/getWeiboList?state='+state+'');	
	});		
});


/**
 * 文件写入 ,记录微博接口访问次数
 */
var _writeFile = function(params){
	var path = "/var/log/weiboLogs.txt";
	var text = {
		'createDate':moment().format("YYYY-MM-DD HH:mm:ss"),
		'count': params,
	}
	fs.exists(path, function(exists) {
		if (!exists) {
			fs.writeFile(path, JSON.stringify(text), function(err) {
				if (err) throw err;
			});
		} else {
			fs.appendFile(path,"\r\n"+JSON.stringify(text), function(err) {
			 	if (err) throw err;
			});
		}
	});
};


/**
 * 爬取用户的微博列表
 * @param {Object} params
 */
var weibofun = function(params){
	if(params.dbhost == '112.124.109.194'){
		var rule = new schedule.RecurrenceRule();  
		rule.minute  = [10,20,30,40,50,59];  
		var j = schedule.scheduleJob(rule, function(){
			weiboDataService.getOrgTokenList(function(err, tokenList) {
				if (tokenList.length > 0) { //如果存在token
					//_writeFile(tokenList.length);
					tokenList.forEach(function(item, index) {
						var params = {
							accessToken: item.access_token,
							uId: item.uid,
							count: 5,
							page: 1,
							feature: 1
						};
						weiboDataService.getWeiboData(params, function(err, topic) {});
					});
				}else{
					console.log("无授权用户");
				}
			});　　
		});
	}else{
		console.log("非生产服务器...");
	}
};

weibofun({'dbhost':config.db.dbhost});

/**
 * 跳转测试页面
 */
router.get('/admin/weibotest',function(req,res){
	res.render("weibotest",{});
});

/**
 * 跳转登录成功页面
 */
router.get('/outside-admin/weiboSuccess',function(req,res){
	res.render("weiboSuccess",{});
});

module.exports = router;
