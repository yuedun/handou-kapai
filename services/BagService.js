'use strict';
/**
 * Created by thinkpad on 2015/7/23.
 */
var sequelize = require('../utils/sequelizeDB');
var bag = require('../models/sqlFile/Bag');
var uuid = require('../utils/uuid');
var TicketModel = require('../models/app-models/TicketModel');
var RecordGiftModel = require('../models/app-models/RecordGiftModel');
var BagModel = require('../models/app-models/BagModel');
var UserExchangeCenterModel = require('../models/app-models/UserExchangeCenterModel');

var giftService = require('./giftService');

var BagService = function () {
};
BagService.getTicketsInBag = function (params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        var param = {
            userId: params.userId
        };

        BagService.freshDailyTicketofDaka(param,function(){
            sequelize.query(bag.getTicketsInBag(), {
                type: sequelize.QueryTypes.SELECT,
                replacements: param
            }).then(function (tickets) {
                callback(null, tickets);
            });
        });
    }
};

/**
 * 使用兑换券
 * @param params
 * @param callback
 */
BagService.useTicketInBag = function (params, callback) {
    if (params === '') {
        callback('参数为空');
    } else {
        var param = {
            userId: params.userId,
            ticketId: params.ticketId,
            ticketAmount: params.ticketAmount
        };

        sequelize.query(bag.useTicketInBag(param), {
            type: sequelize.QueryTypes.UPDATE,
            replacements: param
        }).then(function (records) {
            callback(null,null);
        });


    }
};

/**
 * 判断兑换券是否有效，即兑换数量是否合理、兑换券是否存在
 * @param param
 * @param callback
 */
BagService.isValidExchange = function (params, callback) {
    sequelize.query(bag.isValidExchange(params), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (records) {
        if (records.length > 0) {
            var ret = {
               isValid:true
            };
            callback(null, ret);
        } else {
            var ret = {
                isValid:false
            };
            callback(null, ret);
        }
    }).catch(function(err){
        console.log(err.message);
    });
};

/**
 * 清理背包中数量为0的兑换券
 * @param params
 * @param callback
 */
BagService.clearTicketInBag = function(params,callback){
    sequelize.query(bag.clearTicketInBag(params), {
        type: sequelize.QueryTypes.DELETE,
        replacements: params
    }).then(function (records) {
        callback(null,null);
    });
};

/**
 * 获得兑换券面值
 * @param params
 * @param callback
 */
BagService.getTicketParValue = function(params,callback){
    sequelize.query(bag.getTicketParValue(params), {
        type: sequelize.QueryTypes.SELECT
    }).then(function (value) {
        callback(null,value);
    });
};

/**
 * 向用户背包中添加兑换券
 * @param parmas
 * @param callback
 */
BagService.addTicket = function(params,callback){
    var replaceParams = {
        bagId:uuid.v1(),
        ticketId:params.ticketId,
        ticketAmount:params.ticketAmount,
        userId:params.userId,
        createDate:params.createDate
    };
    RecordGiftModel.create({
        	id:uuid.v1(),
        	userId:params.userId,
        	ticketId:params.ticketId,
        	state:0,
        	createDate:params.createDate,
        	updateDate:params.createDate
       });
    sequelize.query(bag.hasSameTicketRecord(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: replaceParams
    }).then(function (records) {
        if(records.length > 0){
            sequelize.query(bag.updateTicketAmount(), {
                type: sequelize.QueryTypes.UPDATE,
                replacements: replaceParams
            }).then(function (records) {
                callback(null,null);
            });
        }else{
            sequelize.query(bag.addTicket(), {
                type: sequelize.QueryTypes.INSERT,
                replacements: replaceParams
            }).then(function (records) {
                callback(null,null);
            });
        }

        var updateTicketSet = {
            ticketId:params.ticketId
        };
        giftService.updateTicketSetById(updateTicketSet,function(){});
    });



};


/**
 * 使用打卡券
 * @param params
 * @param callback
 */
BagService.useDakaExchange = function (params,callback) {

    BagService.freshDailyTicketofDaka(params, function () {

        BagService.getTotalTicketsofDaka(params,function(err,records){
            if(records[0].total_amount > 0){
                BagService.hasEnoughTicketofDailyDaka(params,function(err,records){
                    var exchangeParams = {
                        userId:params.userId,
                        ticketId:params.ticketId,
                        ticketAmount:params.ticketAmount
                    };
                    if(records.length > 0){
                        exchangeParams.ticketId = bag.DAKATicketID.DailyDaka;
                    }else{
                        exchangeParams.ticketId = bag.DAKATicketID.Daka;
                    }

                    comsumeTicketInBag(exchangeParams, function (ret) {
                        if (ret.exchangeStatus == "success") {

                            var result = {
                                exchangeStatus: "success"
                            };
                            callback(null,result);
                        }
                    });
                });
            }else{
                var err = {
                    err_code:5016,
                    err_msg:'没有可用的打卡券'
                };
                callback(err,null);
            }
        });

    });
};

/**
 * 扣除兑换券
 * @param params
 * @param callback
 */
var comsumeTicketInBag = function (params, callback) {
    BagService.useTicketInBag(params, function (err, ret) {
        BagService.clearTicketInBag(params, function (err, ret) {
        });
        var ret = {exchangeStatus: "success"};
        callback(ret);

    });
};

/**
 * 刷新每日打卡券，每日打卡券每天只有5张
 * @param params
 * @param callback
 */
BagService.freshDailyTicketofDaka = function(params,callback){
    sequelize.query(bag.confirmDailyTicketofDaka(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (records) {
        if(records.length > 0){
            var replaceParams ={
                userId:params.userId
            };

            sequelize.query(bag.updateDailyTicketofDaka(), {
                type: sequelize.QueryTypes.UPDATE,
                replacements: replaceParams
            }).then(function (records) {
                callback(null,null);
            });
        }else{
            var currentTime = new Date();
            var replaceParams = {
                ticketId:bag.DAKATicketID.DailyDaka,
                ticketAmount:5,
                userId:params.userId,
                createDate:currentTime
            };
            BagService.addTicket(replaceParams,function(){
                callback(null,null);
            });
        }
    });
};

/**
 * 获得当前用户打卡券总数
 * @param params
 * @param callback
 */
BagService.getTotalTicketsofDaka = function(params,callback){
    sequelize.query(bag.getTotalTicketsofDaka(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (records) {
        callback(null,records);
    });
};

/**
 * 确定当前用户每日打卡券数量是否充足
 * @param params
 * @param callback
 */
BagService.hasEnoughTicketofDailyDaka = function(params,callback){
    sequelize.query(bag.hasEnoughTicketofDailyDaka(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (records) {
        callback(null,records);
    });
};

/**
 * 获得除了每日打卡券以外的奖券
 * @param callback
 */
BagService.getTicketListWithoutDailyDaka = function(callback){
    sequelize.query(bag.getTicketListWithoutDailyDaka(), {
        type: sequelize.QueryTypes.SELECT
    }).then(function (records) {
        callback(null,records);
    });
};



/**
 * 保存兑换详细记录
 * @param params
 * @param callback
 */
BagService.insertExchangeInfo = function(params,callback){
    var currentTime = new Date();
    var exchangeInfo = {
        starName:params.starName,
        albumName:params.albumName
    };

    var insertParams = {
        exchangeNo:uuid.v1(),
        userId:params.userId,
        exchangeType:params.exchangeType,
        exchangeInfo:JSON.stringify(exchangeInfo),
        createDate:currentTime
    };

    sequelize.query(bag.insertExchangeInfo(), {
        type: sequelize.QueryTypes.INSERT,
        replacements: insertParams
    }).then(function (records) {
        callback(null,records);
    });
};
/**
 * 查询兑换券
 * @param {Object} params
 * @param {Object} callback
 */
BagService.getTicketList = function(params,callback){
	TicketModel.findAll({
		
	}).then(function(list){
		callback(null,list);
	})
};
/**
 * 新增兑换券
 */
BagService.createTicket = function(params,callback){
	TicketModel.create({
		ticketType:params.ticketType,
		ticketName:params.ticketName,
		parValue:params.parValue,
		ticketPictureUrl:params.ticketPictureUrl,
		ticketUsage:params.ticketUsage
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 删除兑换券
 */
BagService.deleteTicket = function(params,callback){
	TicketModel.destroy({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 修改兑换券
 */
BagService.updateTicket = function(con,params,callback){
	TicketModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 根据编号查询兑换券
 */
BagService.findTicketObj = function(params,callback){
	TicketModel.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 修改兑换中心记录
 */
BagService.updateUserExchange = function(con,params,callback){
	UserExchangeCenterModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};

/**
 * 查询我的背包
 */
BagService.getBag = function(params,callback){
	BagModel.findAll({
		where:params
	}).then(function(list){
		callback(null,list);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 修改我的背包
 */
BagService.updateBag = function(con,params,callback){
	BagModel.update(params,{
		where:con
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
/**
 * 删除我的背包
 */
BagService.deleteBag = function(params,callback){
	BagModel.destroy({
        where:{bagId:params.bagId}
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

module.exports = BagService;
