var moment = require('moment');

var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm';

var API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var BIRTHDAY_DATE_FORMAT = 'YYYY-MM-DD';

var PUSH_DATE_FORMAT = 'YYYY-MM-DDTHH:mm';
var UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';




/**
 * 格式化日期，为web端页面显示使用
 * @param date
 * @returns {*}
 */
exports.format = function(date) {
	return moment(date).format(DISPLAY_DATE_FORMAT);
};

/**
 * 日期格式化
 * @return {[type]} [description]
 */
exports.formatDate = function(date) {
	return moment(date).format(API_DATE_FORMAT);
};

exports.formatBirthday = function(date) {
	return moment(date).format(BIRTHDAY_DATE_FORMAT);
};


/**
 * 时间本地化
 * "createDate": "2015-07-22T03:29:48.000Z",
 * 格式化为"createDate": "2015-07-22 11:29",
 * @param obj sequelize对象
 * @param field 字段名
 * @returns {*}
 */
exports.localFormat = function(obj, field) {
	obj.setDataValue(field, this.format(obj.getDataValue(field)));
};

/**
 * 判断日期是否是当天，不是放回false
 * @param date
 * @returns {boolean}
 */
exports.isToday = function(date) {
	date = new Date(date);
	var currentTime = new Date();
	if (date.getYear() != currentTime.getYear()) {
		return false;
	}else if (date.getMonth() != currentTime.getMonth()) {
		return false;
	}else if (date.getDay() != currentTime.getDay()) {
		return false;
	}else{
		return true;
	}
};

/**
 * 格式化UTC时间
 * @param date
 */
exports.formatUTCTime = function(date){
    var utcTime = moment(date,PUSH_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
    return utcTime+"Z";
};

/**
 *格式化GMT时间 
 * @param {Object} date
 */
exports.formatGMTDate = function(date){
	var dateTZ = new Date(date).toJSON();
	var datetime = moment(dateTZ).format(API_DATE_FORMAT);
	return datetime;
};

/**
 *获取每月的每周时间(周一到周日) 
 * @param {Object} date
 */
exports.getweekDate = function(date){
	var now = new Date(); //当前日期
	var nowDayOfWeek = now.getDay(); 
	var nowDay = now.getDate(); 
	var nowMonth = now.getMonth(); 
	var nowYear = now.getFullYear(); 
	var Hours = now.getHours();
	var Minutes = now.getMinutes();
	var Seconds = now.getSeconds();
	if(nowDayOfWeek == 0){nowDayOfWeek = 7;}else{nowDayOfWeek= nowDayOfWeek;}
	var weekStartDate = new Date(nowYear, nowMonth, (nowDay+1) - (nowDayOfWeek));
	var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek),Hours,Minutes,Seconds);
	weekStartDate = moment(weekStartDate).format(API_DATE_FORMAT);
	weekEndDate = moment(weekEndDate).format(API_DATE_FORMAT);
	return {weekStartDate:weekStartDate,weekEndDate:weekEndDate};
}
