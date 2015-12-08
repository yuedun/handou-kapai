'use strict';
/**
 * Created by admin on 2015/1/19.
 */
var Gift = require('../models/Gift');
var GiftModel = require('../models/app-models/GiftModel');
var User = require('../models/User');
var UserGift = require('../models/UserGift');
var UserGiftModel = require('../models/app-models/UserGiftModel');
var Category = require('../models/Category');
var CategoryRelation = require('../models/CategoryRelation');
var uuid = require('../utils/uuid');
var moment = require('moment');//日期组件
var sqlGift = require("../models/sqlFile/gift.js");
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var TicketSetModel = require('../models/app-models/TicketSetModel');
var giftService = function (){};

/**
 * 获取Gift列表-sequelize
 *
 * */
giftService.getList = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        //limit取多少行，offset从第几行开始（index索引）
        Gift.findAll({
            attributes: ['id', 'gift_name', 'integral', 'picture_path'],
            offset: params.offset == null ? 0 : (params.offset-1) * params.limit,
            limit: params.limit == null ? 10 : params.limit,
            order: 'create_date'
        }).then(function(gifts){
            callback(null, gifts);
        }).catch(function(err){
            callback(err);
        });
    }
};
/**
 * 咖派礼品列表
 *
 * */
giftService.shopKpGiftList = function (params, callback) {
    GiftModel.findAll({
        attributes: ['giftId', 'giftName', 'bean', 'picturePath'],
        offset: params.offset == null ? 0 : (params.offset-1) * params.limit,
        limit: params.limit == null ? 10 : params.limit,
        order: 'create_date'
    }).then(function(gifts){
        callback(null, gifts);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 根据id获取对象-sequelize
 * @type {Function}
 */
giftService.getProcess = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        //取list并取gift信息
        UserGift.findAll({
            where: {user_id:params.user_id},
            include: [Gift],
            offset: params.offset == null ? 0 : (params.offset-1) * params.limit,
            limit: params.limit == null ? 10 : params.limit,
            order: 'create_date DESC'
        }).then(function(list){
            callback(null, list);
        });
    }
};
/**
 * 根据id获取对象-sequelize
 * @type {Function}
 */
giftService.getKpProcess = function (params, callback) {
    UserGiftModel.findAll({
    	attributes: ['id', 'state', 'freezeBean', 'createDate', 'expressName', 'expressNumber'],
        where: {userId:params.userId, state: {$ne: -2}},
        include: [{model: GiftModel, attributes: ['giftName', 'bean']}],
        offset: params.offset == null ? 0 : (params.offset-1) * params.limit,
        limit: params.limit == null ? 10 : params.limit,
        order: [['create_date', 'desc']]
    }).then(function(list){
        callback(null, list);
    });
};

/**
 * 根据user_id获取兑换列表,用户计算可用积分，冻结积分
 * @type {Function}
 */
giftService.getUserGiftListByUserId = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        UserGift.findAll({
            where: {user_id: params.user_id},
            attributes: ['gift_id', 'delivery_status', 'freeze_integral']
        }).then(function(list){
            callback(null, list);
        }).catch(function(err){
            callback(err);
        })
    }
};
/**
 * 咖派
 * 根据user_id获取兑换列表,用户计算可用积分，冻结积分
 * @type {Function}
 */
giftService.getKPUserGift = function (params, callback) {
    UserGiftModel.findAll({
        where: params,
        attributes: ['giftId', 'state', 'freezeBean']
    }).then(function(list){
        callback(null, list);
    });
};
/**
 * 添加兑换记录
 * @type {Function}
 */
giftService.addUserGift = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        UserGift.create({
            id: uuid.v1(),
            user_id: params.params.user_id,
            gift_id: params.params.gift_id,
            freeze_integral: params.body.freeze_integral,
            delivery_status: 0,
            express_name: '',
            express_number: '',
            exchange_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            update_date: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(obj){
            callback(null, obj);
        })
    }
};
/**
 * 咖派
 * 添加兑换记录
 * @type {Function}
 */
giftService.addKpUserGift = function (params, callback) {
    UserGiftModel.create({
        id: uuid.v1(),
        userId: params.userId,
        giftId: params.giftId,
        freezeBean: params.freezeBean,
        state: 0,
        exchangeTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
    	callback(err);
    });
};
/**
 * 删除兑换记录
 * @type {Function}
 */
giftService.deleteUserGift = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        UserGift.destroy({where:params}).then(function(){
            callback();
        });
    }
};
/**
 * 取消兑换
 * @type {Function}
 */
giftService.cancelUserGift = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        UserGift.update({
            delivery_status: -1,
            freeze_integral: 0},
            {where:params}).then(function(list){
            callback(null, list);
        });
    }
};
/**
 * 修改兑换状态
 * @type {Function}
 */
giftService.updateUserGift = function (params, callback) {
    UserGiftModel.update(params.fields,
        {where:params.condition}
    ).then(function(obj){
        callback(null, obj);
    });
};
/**
 * 获取用户所在粉丝团列表
 * @type {Function}
 */
giftService.getCategory = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        CategoryRelation.findAll({
            where: {user_id: params.user_id, category_relation_state: 0},
            attributes: ['user_id'],
            include: [{model: Category, attributes: ['category_id', 'category_name', 'column_type_id']}]}).then(function(list){
            callback(null, list);
        });
    }
};


/**
 * 韩豆后台     新增咖派兑换礼品
 */
giftService.createKpGift = function(params,callback){
	GiftModel.create({
		giftId:uuid.v1(),
		giftName:params.giftName,
		bean:params.bean,
		picturePath:params.picturePath,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 韩豆后台     咖派礼品列表
 */
giftService.getKpGiftList = function(params,callback){
	sequelize.query(sqlGift.getGiftList(params).rows(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 韩豆后台     咖派礼品列表count
 */
giftService.getKpGiftCount = function(params,callback){
	sequelize.query(sqlGift.getGiftList(params).count(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 删除礼品
 */
giftService.deleteGift = function(params,callback){
	GiftModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 单个查询礼品
 */
giftService.findGiftObj = function(params,callback){
	GiftModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 修改礼品
 */
giftService.updateGift = function(con,params,callback){
	GiftModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 查询礼品兑换列表
 */
giftService.getGiftExchangeList = function(params,callback){
	sequelize.query(sqlGift.getGiftExchangeList(params).rows(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 查询礼品兑换列表count
 */
giftService.getGiftExchangeCount = function(params,callback){
	sequelize.query(sqlGift.getGiftExchangeList(params).count(),{
        type: sequelize.QueryTypes.SELECT
    }).then(function(count){
        callback(null, count);
    }).catch(function(err){
        callback(err);
    });
};
/**
 * 修改礼品兑换表
 */
giftService.upateUserGift = function(con,params,callback){
	UserGiftModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 删除礼品兑换
 */
giftService.deleteKpUserGift = function(params,callback){
	UserGiftModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 单个查询兑换礼品
 */
giftService.findUserGiftOne = function(params,callback){
	UserGiftModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 奖品设置列表数据
 * @type {Function}
 */
giftService.getTicketSet = function (params, callback) {
    TicketSetModel.findAll({
//      where: params,
        attributes: ['id', 'ticketId', 'ticketName','ticketCount']
    }).then(function(list){
        callback(null, list);
    });
};

/**
 * 根据ID修改奖品数量
 * @type {Function}
 */
giftService.updateTicketSetById = function (params, callback) {
    TicketSetModel.findOne({
        where:params
    }).then(function(list){
    	if(list != null && list.ticketCount > 0){
    		var params2 = {
    			ticketId:params.ticketId,
    			value:-1
    		};
    		sequelize.query(sqlGift.updateTicketSet(params2), {
		        type: sequelize.QueryTypes.UPDATE
		    }).then(function(obj) {
		        callback(null, {});
		    });
    	} else {
    		console.log('这个奖品没有了!');
    		callback(null,{});
    	}
    });
};

/**
 * 查询奖品设置列表
 */
giftService.getTicketSetList = function(params,callback){
	TicketSetModel.findAll({
		where:params
	}).then(function(list){
		callback(null,list);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 根据条件获取奖品设置数据
 * @param params
 * @param callback
 */
giftService.findOneTicketSet = function(params,callback){
    TicketSetModel.findOne({
        where:params
    }).then(function(obj){
        callback(null,obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 修改奖品设置
 */
giftService.updateTicketSet = function(con,params,callback){
	TicketSetModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 新增奖品设置
 */
giftService.addTicketSet = function(params,callback){
	TicketSetModel.create({
		ticketId:params.ticketId,
		ticketName:params.ticketName,
		ticketCount:params.ticketCount,
		createDate:moment().format("YYYY-MM-DD HH:mm:ss"),
		updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
	}).then(function(err,obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

module.exports = giftService;