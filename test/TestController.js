/**
 * Created by admin on 2015/7/9.
 */
var moment = require('moment');
var responseObj = require('../models/ResponseObj.js');
var dateUtils = require('../utils/dateUtils.js');
var groupControl = require('../routes/app-controller/GroupController.js');
var appController = function(){};

/**
 * 接口测试方法
 * @param req
 * @param res
 */
appController.getUserInfo = function(req, res){
    var command = req.body.command;
    var object = req.body.object;
    var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
    var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
    var momenttime = moment(object.releaseDate,DISPLAY_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
    var pushTime = momenttime+"Z";
    console.log(" [pushTime]>>>> :" + pushTime);
    var resObj = responseObj;
    resObj.command = command;
    res.send(resObj);
};

module.exports = appController;