"use strict";
/**
 * Created by admin on 2015/6/12.
 */

var Category = require('../models/Category');
var UserNeedCategory = require('../models/UserNeedCategory');
var moment = require('moment');
var uuid = require('../utils/uuid');
var portalService = function (){};

/**
 * 官网首页粉丝团，根据分类查询
 * */
portalService.category = function (params, callback) {
    Category.findAll({
        where:{
            category_state:0,
            column_type_id:params.column_type_id
        },
        attributes:['category_id','category_name','picture_fan_group'],
        order:[['fan_count','desc']]
    }).then(function(results){
        callback(null, results);
    });
};
/**
 * 用户需要添加的粉丝团
 * */
portalService.userNeedCategory = function (params, callback) {
    UserNeedCategory.create({
        unc_id: uuid.v1(),
        feedback: params.categoryNames,
        phone: params.phone,
        user_qq: params.userQq,
        unc_state: 0,
        create_date: moment().format("YYYY-MM-DD HH:mm:ss"),
        update_date: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(results){
        callback(null, results);
    });
};

module.exports = portalService;