'use strict';
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var TopicModel = require('../models/app-models/TopicModel');
var UserModel = require('../models/app-models/UserModel');
var UserInfoModel = require('../models/app-models/UserInfoModel');
var uuid = require('../utils/uuid');
var moment = require('moment');
var dateUtils = require('../utils/dateUtils');
var Constants = require('../utils/constants');
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();
var factory = {};

/**
 * 根据帖子编号删除帖子
 * 
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
factory.updatePostById = function(params, callback) {
	if (params.topicId == null) {
		callback.call(factory, false);
	}
	var data = {};
	for(var attr in params) {
		if(attr !== "topicId") {
			data[attr] = params[attr];
		}
	}
	TopicModel.update(data, {
		where: {
			topicId: params.topicId
		}
	}).then(function(obj) {
		callback.call(factory, true);
	});

};

/**
 * 根据参数修改频道或者帖子的值
 * @param {Object} setValue	将要修改的值
 * @param {Object} params	条件
 * @param {Object} callback
 */
factory.editTopicByParam = function(setValue, params, callback){
	TopicModel.update(setValue,{
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
        callback(err);
    });
};

/**
 * 创建帖子
 * @param {Object} params
 * @param {Object} callback
 */
factory.createTopic = function(params, callback){
	TopicModel.create({
		topicId:uuid.v1(),
		topicName:params.topicName,
		topicScope:params.topicScope,
		topicDesc:params.topicDesc,
		parentTopicId:params.parentTopicId,
		logo:params.logo,
		smallLogo:params.smallLogo,
		audioAddress:params.audioAddress,
		audioTime:params.audioTime,
		topicPics:params.topicPics,
		picsSize:params.picsSize,
		topicState:1,
		isRecommend:params.isRecommend,
		likeCount:0,
		shareCount:0,
		topicType:params.topicType,
		userId:params.userId,
		groupId:params.groupId,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(topic){
		callback(null,topic);
	}).catch(function(err){
		callback(err);
	});
};


/**
 * 帖子列表（公共方法）
 * @param {Object} params
 * @param {Object} callback
 */
factory.myPostList = function(params, callback){
	sequelize.query(postQuery.myPost(params),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(myPostList){
		callback(null, myPostList);
	});
};

/**
 * 频道下的帖子列表
 * @param {Object} params
 * @param {Object} callback
 */
factory.topicPostList = function(params, callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.topicPost(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(myPostList){
			callback(null, myPostList);
		});
	}
};





/**
 * 修改帖子的点赞数
 * @param {Object} params
 * @param {Object} callback
 */
factory.editTopicLikeCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var params2 = {
			topicId:params.topicId,
			value:params.value
		};
		sequelize.query(postQuery.updateTopicLikeCount(params2), {
                type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
	}
};

/**
 * 修改帖子的分享数
 * @param {Object} params
 * @param {Object} callback
 */
factory.editTopicShareCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var params2 = {
			topicId:params.topicId,
			value:1
		};
		sequelize.query(postQuery.updateTopicShareCount(params2), {
        	type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
	}
};

/**
 * (个人 / 组织) 帖子详情
 * @param {Object} params
 * @param {Object} callback
 */
factory.PostDetailsList = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		sequelize.query(postQuery.PostDetails(params),{
			type: sequelize.QueryTypes.SELECT
		}).then(function(organizationPostDetails){
			callback(null, organizationPostDetails);
		});
	}
};

/**
 * 修改评论的点赞数
 * @param {Object} params
 * @param {Object} callback
 */
factory.editTopicCommentLikeCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var params2 = {
			commentId:params.commentId,
			value:params.value
		};
		sequelize.query(postQuery.updateTopicCommentLikeCount(params2), {
                type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
	}
};

/**
 * 修改频道 / 帖子的置顶状态
 * @param params
 * @param callback
 */
factory.editTopicIsRecommend = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		var isTop = 0;
		if(params.isRecommend == 0){
			isTop = 1;
		} else {
			isTop = 0;
		}
		// 修改得值
		var setValue = {
			isRecommend:isTop
		};
		TopicModel.update(setValue,{
			where:{
				topicId:params.topicId
			}
		}).then(function(obj){
			callback(null, obj);
		});
	}
};

/**
 * 获取帖子数（频道热度）
 * @param {Object} params
 * @param {Object} callback
 */
factory.getTopicCount = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		TopicModel.count({
			where:{
				parentTopicId:params.parentTopicId
			}
		}).then(function(obj){
			callback(obj);
		});
	}
};

/**
 * 获取频道主基本信息[未进行异常处理]
 * @param {Object} params
 * @param {Object} callback
 */
factory.getTopicHostInfo = function(params,callback){
	if(params == ''){
		callback('参数为空');
	} else {
		TopicModel.findOne({
			where:{
				topicId:params.topicId
			},
			include:[{
				model:UserModel,
				attributes:['userId','nickName','headPortrait'],
				where:{state:1}
			}],
			attributes:['topicDesc']
		}).then(function(obj){
			console.log(" obj = " + JSON.stringify(obj));
			callback(null,obj);
		}).catch(function(err){
			console.log(" err = " + JSON.stringify(err));
			callback(err);
		});
	}
};

/**
 * 根据帖子ID获取帖子信息
 * @param {Object} params
 * @param {Object} callback
 */
factory.getTopicById = function(params, callback){
	TopicModel.findOne({
		where:{
			topicId:params.topicId
		}
	}).then(function(obj){
		callback(null, obj);
	});
};
/**
 * by hp
 * 根据参数获取频道或帖子信息
 * @param params
 * @param callback
 */
factory.getTopicByParam = function(params, callback){
	TopicModel.findOne({
		where: params.condition,
		attributes: params.attr,
		include:[{model: UserModel, attributes: ["userType"], required:true}]
	}).then(function(obj){
		callback(null, obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 根据参数获取帖子信息
 * @param {Object} params
 * @param {Object} callback
 */
factory.getTopicByAges = function(params,callback){
	TopicModel.findOne({
		where:{
			topicName:params.topicName,
			$or:[{topicType:params.topicType0}, {topicType: params.topicType1}]
		},
		attributes:['topicId']
	}).then(function(obj){
		callback(null, obj);
	});
};

/**
 * by Star / admin
 * 用户帖子列表
 * @param {Object} params
 * @param {Object} callback
 */
factory.getAdminUserPost = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid,						// 排序ID
		typeId:obj.typeid,						// 类型ID
		StartDate:obj.startdate,				// 开始时间
		EndDate:obj.enddate,					// 结束时间
		offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
		limit: params.pageSize == null ? 10 : params.pageSize
	};
	sequelize.query(postQuery.adminUserPost(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(userPostList){
		callback(null, userPostList);
	});
};

/**
 * by Star / admin
 * 用户帖子总数
 * @param {Object} params
 * @param {Object} callback
 */
factory.getAdminUserPostCount = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid,						// 排序ID
		typeId:obj.typeid,						// 类型ID
		StartDate:obj.startdate,				// 开始时间
		EndDate:obj.enddate						// 结束时间
	};
	sequelize.query(postQuery.adminUserPostCount(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(adminPostCount){
		callback(null, adminPostCount);
	});
};


/**
 * by Star / admin
 * 组织帖子列表
 * @param {Object} params
 * @param {Object} callback
 */
factory.getAdminOrgPost = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid,						// 排序ID
		topicType:params.topicType,
		StartDate:obj.startdate,				// 开始时间
		EndDate:obj.enddate,					// 结束时间
		offset: params.pageIndex == null ? 0 : (params.pageIndex-1) * params.pageSize,
		limit: params.pageSize == null ? 10 : params.pageSize
	};
	sequelize.query(postQuery.adminOrgPost(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(orgPostList){
		callback(null, orgPostList);
	});
};

/**
 * by Star / admin
 * 组织帖子总数
 * @param {Object} params
 * @param {Object} callback
 */
factory.getAdminOrgPostCount = function(params, callback){
	var obj = params.Object;
	var params0 = {
		ConditionId:obj.conditionid,			// 条件ID
		ConditionText:obj.conditionText,		// 条件内容
		SortId:obj.sortid,						// 排序ID
		topicType:params.topicType,
		StartDate:obj.startdate,				// 开始时间
		EndDate:obj.enddate 					// 结束时间
	};
	sequelize.query(postQuery.adminOrgPostCount(params0),{
		type: sequelize.QueryTypes.SELECT
	}).then(function(adminPostCount){
		callback(null, adminPostCount);
	});
};

module.exports = factory;