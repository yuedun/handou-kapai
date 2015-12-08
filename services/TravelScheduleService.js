'use strict';
/**
 * Created by thinkpad on 2015/7/19.
 */

var sequelize = require('../utils/sequelizeDB');
var dateFormat = require('../utils/DateFormat');
var dateUtils = require('../utils/dateUtils');
var travelSchedule = require('../models/sqlFile/TravelSchedule');
var AdverModel = require('../models/app-models/AdverModel');

var TravelScheduleService = function () {
};

TravelScheduleService.getMonthSchedule = function (params, callback) {
    //console.log("TravelScheduleService.getMonthSchedule");
    if (params === '') {
        callback('参数为空');
    } else {
        var scheduleArray = [];

        var travelDate = params.travelDate;

        var param = {
            categoryId: params.categoryId,
            currentMonth: dateFormat.getCurrentMonth(travelDate),
            nextMonth: dateFormat.getNextMonth(travelDate)
        };

        sequelize.query(travelSchedule.getMonthSchedule(), {
            type: sequelize.QueryTypes.SELECT,
            replacements: param
        }).then(function (schedules) {
            schedules.forEach(function (schedule) {
                var obj = {
                    'travelId':schedule.travel_id,
                    'travelContent':schedule.travel_content,
                    'recommendation':schedule.recommendation,
                    'categoryId':schedule.category_id,
                    'travelDate':dateUtils.formatDate(schedule.travel_date)
                };

                scheduleArray.push(obj);
            });

            callback(null,scheduleArray);
        });
    }
};

/**
 * 明星今日行程
 * @param params
 * @param callback
 */
TravelScheduleService.todayTravel = function(params, callback){
    sequelize.query(travelSchedule.todayTravel(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (obj) {
        callback(null,obj);
    });
};
/**
 * 明星今日行程
 * @param params
 * @param callback
 */
TravelScheduleService.todayNews = function(params, callback){
    sequelize.query(travelSchedule.todayNews(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (obj) {
        callback(null,obj);
    });
};
/**
 * 明星今日sns
 * @param params
 * @param callback
 */
TravelScheduleService.todaySns = function(params, callback){
    sequelize.query(travelSchedule.todaySns(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (obj) {
        callback(null,obj);
    });
};

/**
 * 首页广告位
 * @param params
 * @param callback
 */
TravelScheduleService.advertisingHome = function(params, callback){
    AdverModel.findAll({
        where: {
            state: params.state,
            $or: [{
                groupId: params.groupId,
                $or: [{
                    releaseDate: {$eq: null}
                    },
                    {
                        releaseDate: {$lt: new Date()}
                    }
                ]
                },
                {
                    groupId: {$eq: null}
                }
            ]
        },
        order: [[sequelize.fn('ifnull', sequelize.col('releaseDate'), sequelize.col('createDate')), 'DESC']]
    }).then(function(list){
        callback(null, list);
    }).catch(function(err){
        callback(err);
    });
};
module.exports = TravelScheduleService;
