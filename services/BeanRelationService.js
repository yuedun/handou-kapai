'use strict';
/**
 * Created by admin on 2015/7/23.
 */
var moment = require('moment');
var sequelize = require('../utils/sequelizeDB');
var beanRelation = require('../models/app-models/BeanRelationModel');
var uuid = require('../utils/uuid');
var beanDouble = require('../models/app-models/BeanDoubleModel');
var SignInCountModel = require('../models/app-models/SignInCountModel');
var dateUtils = require('../utils/dateUtils.js');
var postStr = require('../models/sqlFile/postStr'), postQuery = new postStr();
var sqlUser = require("../models/sqlFile/User.js");
var beanRelationService = function (){};

/**
 * 查询用户是否在积分关系表中存在
 * @param params
 * @param callback
 */
beanRelationService.getBeanRelation = function(params,callback){
	if(params === ''){
        callback('参数为空');
    } else {
    	beanRelation.count({
    		where:params
    	}).then(function(count){
    		callback(null,count);
    	}).catch(function(err){
    		callback(err);
    	});
    }
};

/**
 * 根据该月第一天和当前天查询
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.findBean = function(params,callback){
	if (params === '') {
		callback('参数为空');
	} else {
		beanRelation.findAll({
			where: {
				userId: params.userId,
				beanType: params.beanType,
				beanDate: {
					between: [params.startOfDate, params.endOfDate]
				}
			},
			attributes:['beanDate']
		}).then(function(list){
			callback(list);
		})
	}
}


/**
 * 根据用户连续签到次数计算积分
 */
beanRelationService.findSignIn = function(params,callback){
var beanValue = 0;
if (params === '') {
	callback('参数为空');
} else {
	SignInCountModel.findOne({
		where: {
			userId: params.userId
		}
	}).then(function(obj) {
		if (null != obj) {
			var signInCount = obj.get('signInCount');
			if (signInCount <= 1) {
				beanValue = 5;
			} else if (signInCount == 2) {
				beanValue = 10;
			} else if (signInCount == 3) {
				beanValue = 15;
			} else if (signInCount == 4) {
				beanValue = 20;
			} else if (signInCount == 5) {
				beanValue = 25;
			} else if (signInCount == 6) {
				beanValue = 30;
			} else if (signInCount == 7) {
				beanValue = 35;
			} else if (signInCount == 8) {
				beanValue = 40;
			} else if (signInCount == 9) {
				beanValue = 45;
			} else if (signInCount >= 10) {
				beanValue = 50;
			}
			callback(null, beanValue);
		} else {
			callback(null, beanValue);
		}

	});
}
}




/**
 * 计算积分加倍
 * @param params
 * @param callback
 */
beanRelationService.getBeanDouble = function(beanValue,params,callback){
	var newDate = moment().format("YYYY-MM-DD HH:mm:ss"); 
	if(beanValue === ''){
		 callback('参数为空');
	}else{
		beanDouble.findAll({
			where:{
				beanDoubleState:1,
				type:params.type,
				beanStarTime:{
					lte:newDate
				},
				beanEndTime:{
					gte:newDate
				}
			}
		}).then(function(list){
			if(list.length > 0){
				var beanMultiple = list[0].beanMultiple;
				beanValue = beanValue * (beanMultiple <= 1 ? 1 : beanMultiple);
				callback(beanValue);
			}else{
				callback(beanValue);
			}
		});
	}
};

/**
 * 根据用户编号查询
 * @param params
 * @param callback
 */
beanRelationService.getBeanRelationObj = function(params,callback){
	if(params === ''){
        callback('参数为空');
    } else {
    	beanRelation.findAll({
    		attributes:['beanRelationId','userId','beanValue'],
    		where:params
    	}).then(function(obj){
    		callback(null,obj);
    	})
    }
}

/**
 * 修改豆币关系表
 */
beanRelationService.updateBeanRelation = function(condition,params, callback) {
	if (params === '') {
		callback('参数为空');
	} else {
		beanRelation.update(params, {
			where:condition
		}).then(function(obj) {
			callback(obj);
		});
	}
};

/**
 * 只修改豆币值SQL形式
 * by Star
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.updateBeanValue = function(params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        sequelize.query(postQuery.updateBeanValue(params), {
            type: sequelize.QueryTypes.UPDATE
        }).then(function(obj) {
            callback(null, obj);
        });
    }
};


/**
 * 新增豆币关系表
 * @param params
 * @param callback
 */
beanRelationService.createBeanRealtion = function(params,callback){
	if(params === ''){
        callback('参数为空');
    } else {
    	beanRelation.create({
    		beanRelationId:uuid.v1(),
    		userId:params.userId,
    		beanType:params.beanType,
    		beanValue:params.beanValue,
    		beanDate:moment().format("YYYY-MM-DD"),
    		creatorIp:params.creatorIp,
    		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
    		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
    	}).then(function(obj){
    		callback(obj);
    	});
    }
}

/**
 * 新增或修改豆币关系表
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.createOrUpdateBeanRealtion = function(params, callback) {
	if (params === '') {
		callback('参数为空');
	} else {
		var newparams = {
			userId: params.userId,
			beanType: params.beanType
		}
		beanRelationService.getBeanRelationObj(newparams, function(err, list) {
			if (list.length <= 0) {
				beanRelation.create({
					beanRelationId: uuid.v1(),
					userId: params.userId,
					beanType: params.beanType,
					beanValue: params.beanValue,
					signValue: params.beanValue,
					beanDate: moment().format("YYYY-MM-DD"),
					signDate: moment().format("YYYY-MM-DD"),
					creatorIp: params.creatorIp,
					createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
					updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
				}).then(function(obj) {
					callback(obj);
				});
			} else {
				var condition = {
					userId:params.userId,
					beanType:params.beanType
				}
				var params2 = {
					beanDate: moment().format("YYYY-MM-DD"),
					updateDate: moment().format("YYYY-MM-DD HH:mm:ss"),
					signDate: list[0].get('signDate') + "," + moment().format("YYYY-MM-DD"), //拼接当月签到时间
					signValue: list[0].get('signValue') + "," + params.beanValue, //拼接当月签到豆币
					beanValue:params.beanValue,
					createDate:moment().format("YYYY-MM-DD HH:mm:ss")
				}
				beanRelationService.updateBeanRelation(condition,params2,function(obj){
					callback(obj);
				})
			}
		});
	}
}






/**
 * 修改签到次数
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.addOrUpdateSignCount = function(params, callback) {
	if (params === '') {
		callback('参数为空');
	} else {
		beanRelationService.findSignCount(params, function(obj) {
			if (null == obj) {
				params.signInCount = 1;
				beanRelationService.createSignCount(params, function(obj1) {
					callback(obj1);
				});
			} else {
				beanRelationService.findBean(params, function(list) {
					//得到昨天的日期	
					var dd = new Date();
					dd.setDate(dd.getDate() - 1); //获取AddDayCount天后的日期   
					var y = dd.getFullYear();
					var m = dd.getMonth() + 1; //获取当前月份的日期   
					if (m < 10) {
						m = '-0' + m;
					} else {
						m = '-' + m;
					}
					var d = dd.getDate();
					if (d < 10) {
						d = '-0' + d;
					} else {
						d = '-' + d;
					}
					var time = y + m + d;
					var signFlag = 0;
					if(list.length > 0){
						for (var i = 0; i < list.length; i++) {
							if (dateUtils.formatBirthday(list[i].get('beanDate')) === time) { //如果昨天的日期存在于这个月签到的日期的话    就证明是连续的
								signFlag = 1;
							}
						}
					}
					if (signFlag == 1) {
						var signCount = obj.get('signInCount');
						var newSignCount = signCount + 1;
						params.signInCount = newSignCount;
						params.updateDate = moment().format("YYYY-MM-DD HH:mm:ss");
						beanRelationService.updateSignCount(params, function(obj3) {
							callback(obj3);
						});
					} else {
						params.signInCount = 1;
						params.updateDate = moment().format("YYYY-MM-DD HH:mm:ss");
						beanRelationService.updateSignCount(params, function(obj3) {
							callback(obj3);
						});
					}
				});
			};
		});
	};
};

/**
 * 根据用户编号查询连续签到次数
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.findSignCount = function(params, callback) {
	if (params === '') {
		callback('参数为空');
	} else {
		SignInCountModel.findOne({
			where: {
				userId: params.userId
			}
		}).then(function(obj) {
			callback(obj);
		});
	}

}

/**
 * 创建连续签到表
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.createSignCount = function(params,callback){
	if(params === ''){
		callback('参数为空');
	}else{
		SignInCountModel.create({
    		signInId:uuid.v1(),
    		userId:params.userId,
    		signInCount:params.signInCount,
    		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
    		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
    	}).then(function(obj){
    		callback(obj);
    	});
	}
}

/**
 * 修改连续签到次数
 * @param {Object} params
 * @param {Object} callback
 */
beanRelationService.updateSignCount = function(params,callback){
	if(params === ''){
		callback('参数为空');
	}else{
		SignInCountModel.update(params,{
			where:{userId:params.userId}
		}).then(function(obj){
			callback(obj);
		});
	}
}

/**
 * 新增豆币加倍
 */
beanRelationService.createBeanDouble = function(params,callback){
	beanDouble.create({
		beanDoubleId:uuid.v1(),
		beanDoubleState:params.beanDoubleState,
		type:params.type,
		beanStarTime:params.beanStarTime,
		beanEndTime:params.beanEndTime,
		beanMultiple:params.beanMultiple,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 得到豆币加倍列表
 */
beanRelationService.getBeanDoubleList = function(params,callback){
	sequelize.query(sqlUser.getBeanDoubleList(params).rows(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 豆币加倍列表count
 */
beanRelationService.getBeanDoubleCount = function(params,callback){
	sequelize.query(sqlUser.getBeanDoubleList(params).count(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 删除豆币加倍列表记录
 */
beanRelationService.deleteBeanDouble = function(params,callback){
	beanDouble.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

module.exports = beanRelationService;