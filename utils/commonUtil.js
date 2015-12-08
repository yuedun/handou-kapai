var responseObj = require('../models/ResponseObj.js');
var config = require('../config/config.json');
var crypto = require('crypto');
/**
 * Created by admin on 2015/7/20.
 */
/**
 * 判断Object对象中的参数是否为空
 * 为空返回参数为空错误信息
 * @param req
 * @param res
 * @param Array
 */
exports.paramsIsNull = function (req, res, params) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = new responseObj();
    for (var i = 0; i < params.length; i++) {
        if (object.hasOwnProperty(params[i]) == false || object[params[i]] === "") {
            resObj.command = command;
            resObj.status = false;
            resObj.errMsg(4002, params[i] + '参数为空');
            res.send(resObj);
            //返回true意味着有空值
            return true;
        }
    }
    //无空值
    return false;
};

/**
 * 深克隆方法：深克隆所有javascript对象
 * @param  {[object or primitive type]} obj [对象，数组，基本类型]
 * @return {[object or primitive type]}     [深克隆后的结果]
 */
exports.clone = function (obj) {
    var o;
    if (typeof obj === "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
};

/**
 * 数组去重
 * @param arr
 * @returns {Array}
 */
exports.unique = function(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
};

/**
 * 数组中删除指定值
 * @param arr
 * @param val
 */
exports.removeByValue = function(arr, val){
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
};

/**
 * 获取组织头像
 * @param item 包含头像的对象
 * @returns {string}
 */
exports.headPortrait = function(item){
    var headPortrait = "";
    if(item.headPortrait) {
        //头像存在并且是微博头像
        if(item.headPortrait.indexOf("http") > -1){
            headPortrait =  item.headPortrait;
        } else {
            //修改后的头像
            headPortrait = config.qiniu.kp_site + item.headPortrait;
        }
    } else if((null != item.headPortrait && '' != item.headPortrait) && item.getDataValue("headPortrait")){
        //头像存在并且是微博头像
        if(item.getDataValue("headPortrait").indexOf("http") > -1){
            headPortrait =  item.getDataValue("headPortrait");
        } else {
            //修改后的头像
            headPortrait = config.qiniu.kp_site + item.getDataValue("headPortrait");
        }
    } else {
        headPortrait = config.qiniu.kp_site + config.qiniu.defaul_user_head;
    }
    return headPortrait;
};


/**
 * password加密       crypto
 * 参数:需要加密的字符串
 * @param {Object} params
 */
exports.encrypt = function(params){
	var cipher = crypto.createCipher('aes-256-cbc','InmbuvP6Z8')
	var crypted = cipher.update(params,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
};

/**
 * password 解密  crypto
 * @param {Object} params
 */
exports.decrypt = function(params){
	var decipher = crypto.createDecipher('aes-256-cbc','InmbuvP6Z8')
	var dec = decipher.update(params,'hex','utf8')
	dec += decipher.final('utf8')
	return dec;	
};	
