"use strict";
var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment');
var groupService = require('../services/groupService.js');
var userService = require('../services/UserService.js');
var dateUtil = require('../utils/dateUtils.js');
var qiniu = require('../utils/qiniu');
var qiniutoken = qiniu.upToken('handou-kapai');

/**
 * by hp/admin
 * 明星列表
 */
router.get('/group', function(req, res) {
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;
	var params = {
		groupState: object.state? parseInt(object.state): null,
		starName: object.starName,
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order: 'fan_count DESC'//默认排序
	};
	if(object.order === "fans-asc") params.order = "fan_count asc";
	if(object.order === "org-desc") params.order = "orgCount desc";
	if(object.order === "org-asc") params.order = "orgCount asc";
	groupService.getGroupList(params, function(err, result){
		if(err){
			res.render('error', {message: err.message});
		} else {
			res.render('admin/group_list',{groupList: result.rows, currentPage: pageIndex, totalCount:result.count,params:params});
		}
	});
});
/**
 * by hp/admin
 * 添加明星UI
 */
router.get('/group-add-ui', function(req, res) {
	res.render('admin/group_add',{status:true, qntoken: qiniutoken});
});
/**
 * by hp/admin
 * 修改明星UI
 */
router.get('/group-update-ui/:groupId', function(req, res) {
	var params = {
		groupId: req.params.groupId,
		attributes: ['groupId','starName','starLogo','groupName']
	};
	groupService.getGroupById(params, function(err, obj){
		if(err){
			res.json(err);
		} else {
			res.render('admin/group_update',{status:true, group: obj, qntoken: qiniutoken});
		}
	});
});

/**
 * by hp/admin
 * 添加或修改明星
 */
router.post('/group', function(req, res) {
	var object = req.body;
	var group = {
		starName:object.starName,
		starLogo:object.starLogo,
		groupName:object.groupName,
		groupLogo:object.groupLogo,
		groupState: object.groupState? 1: 0
	};
	if (object.groupId){
		groupService.updateStar(object.groupId, group, function(err, obj){
			if(err){
				res.render('admin/group_update', {status: false});
			} else{
				res.redirect('/admin/group');//跳转到列表
			}
		});
	} else {
		groupService.addGroup(group, function(err, obj){
			if(err){
				res.render('admin/group_add', {status: false});
			} else{
				res.redirect('/admin/group');//跳转到列表
			}
		});
	}
});

/**
 * by hp/admin
 * 修改明星发布状态
 */
router.get('/groupUpdate/:groupId', function(req, res) {
	var params = {
		groupState: req.query.action,
		update: moment().format("YYYY-MM-DD HH:mm:ss")
	};
	groupService.updateStar(req.params.groupId, params, function(err, obj){
		res.redirect("/admin/group");
	});
});

/**
 * by hp/admin
 * 用户粉丝团编号
 */
router.get('/group_user', function(req, res) {
	var object = req.query;
	var pageIndex = object.pageIndex? parseInt(object.pageIndex): 1;
	var pageSize = object.pageSize? parseInt(object.pageSize): 10;
	var params = {
		condition: {cardState: 1},
		offset: pageIndex? (pageIndex-1) * pageSize: 0 ,
		limit: pageSize? pageSize: 10,
		order: 'cardNumber DESC'//默认排序
	};
	if (object.choose) params.condition[object.choose] = object.keyword;
	if(object.order === "number-desc") params.order = "cardNumber desc";
	if(object.order === "number-asc") params.order = "cardNumber asc";
	if(object.order === "join-desc") params.order = "createDate desc";
	if(object.order === "join-asc") params.order = "createDate asc";
	groupService.getGroupUser(params, function(err, result){
		result["rows"].forEach(function(item, index){
			item.setDataValue("createDate", dateUtil.formatDate(item.getDataValue("createDate")));
		});
		res.render("admin/group_user_list", {list:result.rows, currentPage: pageIndex, totalCount:result.count,params:params,choose:object.choose,keyword:object.keyword});
	});
});
module.exports = router;
