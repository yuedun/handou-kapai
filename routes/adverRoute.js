"use strict";
/**
 * Created by admin on 2015/8/27.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var dateUtils = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');
var groupService = require('../services/groupService');
var adverService = require('../services/adverService');



/**
 * 广告列表
 */
router.get('/getAdverList',function(req,res){
	var dateFlag = moment().format("YYYY-MM-DD HH:mm:ss");
	var postChoose = req.query.postChoose;
	var keyWord = req.query.keyWord?req.query.keyWord.trim():null;
	var stateFlag = req.query.stateFlag?req.query.stateFlag:null;
	var order = req.query.order;
	var state = -1;
	var index= req.query.pageIndex?req.query.pageIndex:1;
	var pageSize = req.query.pageSize?req.query.pageSize:10;
	var pageIndex = index == null?0:(index-1) * pageSize;
	var params = {
		state:state,
		stateFlag:stateFlag,
		keyWord:keyWord,
		postChoose:postChoose,
		order:order,
		pageSize:pageSize,
		pageIndex:pageIndex
	};
	var arr = new Array();
	if(postChoose == 2){
		groupService.likeGroupListAll(params, function(err, list) {
			for (var i = 0; i < list.length; i++) {
				arr.push(list[i].groupId);
			}
			var groupdIds = JSON.stringify(arr).replace("[", "(").replace("]",")");
			params.groupIds = groupdIds;
			var totalCount = 0;
			adverService.getAdverCount(params,function(err,count){
				totalCount = count[0].count;
			adverService.getAdverList(params,function(err,list){
				async.map(list,function(item,callback){
					if(item.updateDate !=null){
						item.updateDate = dateUtils.formatDate(item.updateDate);
					}
					if(item.releaseDate !=null){
						item.releaseDate = dateUtils.formatDate(item.releaseDate);
					}
					if(item.createDate !=null){
						item.createDate = dateUtils.formatDate(item.createDate);
					}
					if(item.state == 1 && item.releaseDate !=null && item.releaseDate > dateFlag){
						item.state = 2;
					}
					callback(null,item);
				},function(err,results){
					res.render("admin/adver/adver_list",{
						adverList:results,
						currentPage:index,
						totalCount:totalCount,
						params:params
					});
				});
			});
			});
		});
	}else{
		var totalCount = 0;
		adverService.getAdverCount(params,function(err,count){
			totalCount = count[0].count;
		adverService.getAdverList(params,function(err,list){
			async.map(list,function(item,callback){
				if(item.updateDate !=null){
					item.updateDate = dateUtils.formatDate(item.updateDate);
				}
				if(item.releaseDate !=null){
					item.releaseDate = dateUtils.formatDate(item.releaseDate);
				}
				if(item.createDate !=null){
					item.createDate = dateUtils.formatDate(item.createDate);
				}
				if(item.state == 1 && item.releaseDate !=null && item.releaseDate > dateFlag){
					item.state = 2;
				}
				callback(null,item);
			},function(err,results){
				res.render("admin/adver/adver_list",{
					adverList:results,currentPage:index,totalCount:totalCount,params:params
				});
			});
		});
		});
	}
});


/**
 * add adver UI
 */
router.get('/adver-addui',function(req,res){
	var params = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	};
	groupService.getGroupListAll(params,function(err,groupList){
		res.render("admin/adver/adver_add",{groupList:groupList,status:true, qntoken: qiniutoken});
	});
});


/**
 * 新增广告
 */
router.post('/adver-add',function(req,res){
	var groupId = req.body.groupId?req.body.groupId:null;
	var adverTitle = req.body.adverTitle;
	var adverPic = req.body.starLogo?req.body.starLogo:'';
	var linkType = req.body.linkType;
	var linkValue = req.body.linkValue;
	var state = req.body.state;
	var releaseDate = req.body.releaseDate?req.body.releaseDate.trim():'';
	
	var params = {
		adverTitle:adverTitle,
		groupId:groupId,
		adverPic:adverPic,
		linkType:linkType,
		linkValue:linkValue
	};
	if(state==1 || releaseDate !=''){
		params.state = 1;
	}else{
		params.state = 0;
	}
	if('' != releaseDate){
		params.releaseDate = releaseDate;
	}
	adverService.addAdver(params,function(err,obj){
		res.redirect("/admin/getAdverList");
	});
});


/**
 * 修改广告状态
 */
router.get('/update-adver-state',function(req,res){
	var releaseState = req.query.releaseState;
	var adverId = req.query.adverId;
	var state = req.query.state;
	var date = moment().format("YYYY-MM-DD HH:mm:ss");
	var params = {
		state:1,
		updateDate:date
	};
	if(releaseState == 2){//如果是定时发布   那就把时间改成当前时间
		params.releaseDate = date;
	}
	if(0 == state){//取消发布
		adverService.updateAdver({adverId:adverId},{state:0,updateDate:date},function(err,obj){
			res.redirect('/admin/getAdverList');
		});
	}else if (1 == state){//立即发布
		adverService.updateAdver({adverId:adverId},params,function(err,obj){
			res.redirect('/admin/getAdverList');
		});
	}else if (2 == state){//恢复
		adverService.updateAdver({adverId:adverId},{state:1,updateDate:date},function(err,obj){
			res.redirect('/admin/getAdverList');
		});
	}else if (-1 == state){//删除
		adverService.updateAdver({adverId:adverId},{state:-1,updateDate:date},function(err,obj){
			res.redirect('/admin/getAdverList');
		});
	}
});

/**
 * update adver UI
 */
router.get('/adver-updateUi',function(req,res){
	var adverId = req.query.adverId;
	var ustate = req.query.ustate;
	var params = {
		attributes:['groupId','starName'],
		condition:{groupState:1}
	};
	async.parallel([
		function(callback0){
			adverService.getAdverObj({adverId:adverId},function(err,obj){
				callback0(null,obj);
			});
		},
		function(callback1){
			groupService.getGroupListAll(params,function(err,groupList){
				callback1(null,groupList);
			});
		}
	],function (err, result) {
		res.render("admin/adver/adver_update",{
			adver:result[0],groupList:result[1],status:true, qntoken: qiniutoken,ustate:ustate
		});
	});
});

/**
 * 修改广告
 */
router.post("/adver-update",function(req,res){
	var ustate = req.body.ustate;
	var adverId = req.body.adverId;
	var state = req.body.state;
	var releaseDate = req.body.releaseDate;
	var params = {
		groupId:req.body.groupId?req.body.groupId:null,
		adverPic:req.body.starLogo?req.body.starLogo:null,
		linkType:req.body.linkType,
		linkValue:req.body.linkValue,
		adverTitle:req.body.adverTitle,
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	};
	if(state ==1 || releaseDate !=''){
		params.state = 1;
	}else{
		params.state = 0; 
	}
	if('' != releaseDate && null != releaseDate){
		params.releaseDate = releaseDate;
	}
	if('' == releaseDate && ustate == 2){//定时发布改为已发布
		params.releaseDate = moment().format("YYYY-MM-DD HH:mm:ss");
	}
	adverService.updateAdver({adverId:adverId},params,function(err,obj){
		res.redirect('/admin/getAdverList');
	});
});

/**
 * 删除广告
 */
router.get('/delete-adver',function(req,res){
	var adverId = req.query.adverId;
	adverService.deleteAdver({adverId:adverId},function(err,obj){
		res.redirect('/admin/getAdverList');
	});
});

module.exports = router;