'use strict';
/**
 * Created by admin on 2015/7/2.
 */
var http = require('http');
var crypto = require('crypto');
var duoshuoService = {};
var secret = 'd46e3e4a82cbe92e3f808ac3ac808fda';
var short_name = 'handou';
var last_log_id = '上一次同步时读到的最后一条log的ID，开发者自行维护此变量（如保存在你的数据库）。';

/**
 * 获取评论数据
 * 多说向我方服务器发送post请求，验证signature成功后向多说服务器发送评论列表请求
 */
duoshuoService.sync_log = function(req, res, callback) {
    if(true) {
        //if (check_signature(req.body.signature)) {
        var limit = 20;
        var params = {
            'limit': limit,
            'order': 'asc'
        };
        var posts = {};
        if (!last_log_id)
            last_log_id = 0;

        params['since_id'] = last_log_id;
        //*****************start
        var myReq = http.request('http://api.duoshuo.com/log/list.json?short_name='+short_name+'&secret='+secret+"&limit="+3, function (result) {
            result.setEncoding('utf8');
            result.on('data', function (chunk) {
                console.log(chunk);
                callback(null, chunk);
            });
        });
        myReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        myReq.end();
        //*****************end
    }else{
        callback("错误");
    }
};
/**
 * 检查签名
 * 未实现
 **/
function check_signature(req, signature){
    var oriArray = new Array();
    oriArray[0] = secret;
    oriArray[1] = req.body.action;
    oriArray.sort();//字典排序
    var original = oriArray[0]+oriArray[1];
    var crypto = require('crypto');
    //var scyptoString = crypto.createHmac('sha1', original).update(original).digest('base64').toString();
    var scyptoString = urlencode(original);
    console.log("c*******"+signature);
    console.log("str*******"+scyptoString);
    if (signature == scyptoString) {
        console.log('相等');
        return true;
    }
    return true;
}

module.exports = duoshuoService;