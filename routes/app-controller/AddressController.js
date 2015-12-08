"use strict";
/**
 * Created by admin on 2015/7/17.
 */
var responseObj = require('../../models/ResponseObj.js');
var addressService = require('../../services/addressService.js');
var moment = require('moment');
var appInter = require('../appInterface.js');
var addressController = function(){};
/**
 * 用户地址信息
 * @param req
 * @param res
 */
addressController.getAddressInfo = function(req,res){
	var command = req.body.command;
    var object = req.body.object;
    var params= {
        userId: object.userId
    };
    var resObj = responseObj();
	resObj.command = command;
	addressService.getUserAddress(params,function(err,obj){
		if(null == obj){
			resObj.object = {
			   	addressId: "",
		        userId: "",
		        name: "",
		        phone: "",
		        postalCode: "",
		        province: "",
		        city: "",
		        area: "",
		        details:""
		    }
		}else{
			resObj.object = obj;
		}
		res.send(resObj);
	});
};

/**
 * 新增或者修改用户地址
 * @param req
 * @param res
 */
addressController.addOrUpdateAddress = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params= {
        userId: object.userId,
        name:object.name,
        phone:object.phone,
        postalCode:object.postalCode,
        province:object.province,
        city:object.city,
        area:object.area,
        details:object.details,
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    };
    var resObj = responseObj();
    resObj.command = command;
    addressService.getUserAddress(params,function(err,obj){
		if(null == obj){
			addressService.addUserAddress(params,function(err,obj){
				resObj.object = obj;
				res.send(resObj);
			});
		}else{
			addressService.updateAddress(params,function(err,obj){
				addressService.getUserAddress(params,function(err,obj2){
					if(null == obj2){
						resObj.object = {
						   	addressId: "",
					        userId: "",
					        name: "",
					        phone: "",
					        postalCode: "",
					        province: "",
					        city: "",
					        area: "",
					        details:""
						}
					}else{
						resObj.object = obj2;
					}
					res.send(resObj);
				});
			});
		}
	});
};

module.exports = addressController;