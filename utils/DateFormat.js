/**
 * Created by thinkpad on 2015/7/20.
 */

var moment = require('moment');

function DateFormat() {
};
//获得当前月
DateFormat.getCurrentMonth = function (datestr) {
    var momentObj = moment(datestr);
    var currentMonth = momentObj.format('YYYY-MM');
    return currentMonth;
};

DateFormat.getNextMonth = function (datestr) {
    var momentObj = moment(datestr);
    var month = momentObj.month();
    var nextMonth = momentObj.set('month', month + 1).format('YYYY-MM');
    return nextMonth;
};


module.exports = DateFormat;
