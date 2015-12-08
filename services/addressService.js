'use strict';
/**
 * Created by admin on 2015/7/17.
 */
var Address = require('../models/app-models/AddressModel');
var uuid = require('../utils/uuid');
var moment = require('moment');
var addressService = function (){};

/**
 * 获取用户地址
 * @param params
 * @param callback
 */
addressService.getUserAddress = function (params, callback) {
    if(params === ''){
        callback('参数为空');
    } else {
        Address.findOne({where:{user_id:params.userId,state:0,type:1},attributes:['addressId','userId','name','phone','postalCode','province','city','area','details']}).then(function(address){
            callback(null,address);
        });
    };
};

/**
 * 新增用户地址
 * @param params
 * @param callback
 */
addressService.addUserAddress = function(params,callback){
	if(params === ''){
		callback('参数为空');
	}else{
		Address.create({
			addressId: uuid.v1(),
			userId:params.userId,
			name:params.name,
			phone:params.phone,
			postalCode:params.postalCode,
			province:params.province,
			city:params.city,
			area:params.area,
			details:params.details,
			state:0,
			type:1,
			createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        	updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
		}).then(function(obj){
			callback(null,obj);
		});
	};
};
/**
 * 修改用户地址
 * @param params
 * @param callback
 */
addressService.updateAddress = function(params,callback){
	if(params === ''){
		callback('参数为空');
	}else{
		Address.update(params,{
			where:{user_id:params.userId}
		}).then(function(obj){
		   Address.findOne({where:{user_id:params.userId},attributes:['userId','name','phone','postalCode','province','city','area','details']}).then(function(obj){
             callback(null,obj);
           });
		});
	};
};

/**
 * 根据地址编号修改地址信息   韩豆后台
 */
addressService.updateIdByAddress = function(con,params,callback){
		Address.update(params,{
			where:con
		}).then(function(obj){
             callback(null,obj);
		}).catch(function(err){
			callback(err);
		});
};
/**
 * 根据地址编号查询地址对象
 */
addressService.findAddressOne = function(params,callback){
	Address.findOne({
		where:params
	}).then(function(obj){
		callback(null,obj);
	}).catch(function(err){
		callback(err);
	});
};
module.exports = addressService;