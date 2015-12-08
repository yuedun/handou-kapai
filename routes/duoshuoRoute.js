/**
 * Created by admin on 2015/7/2.
 */
/**
 * Created by huopanpan on 2014/10/31.
 */
var express = require('express');
var http = require('http');
var utils = require('utility');
var router = express.Router();//获取路由变量，对其设置路径，再导出在app.js中使用app.use(blog)
var newsComService = require('../services/newsCommentService');

var secret = 'd46e3e4a82cbe92e3f808ac3ac808fda';
var short_name = 'handou';

router.post('/callbackComments', function(req, res){
    if(check_signature(req, secret)) {
        newsComService.getLastLogId({id: 1}, function(err, obj){
            var last_log_id = obj.getDataValue("lastLogId");//上一次同步时读到的最后一条log的ID，开发者自行维护此变量（如保存在你的数据库）
            var params = {
                short_name: short_name,
                secret: secret,
                since_id: last_log_id,
                limit: 1,
                order: 'desc'
            };
            if (!last_log_id) last_log_id = 0;
            params['since_id'] = last_log_id;
            var paramsStr = "?";
            for(var property in params){
                paramsStr = paramsStr + property + "=" + params[property] + "&";
            }
            paramsStr = paramsStr.substring(0, paramsStr.lastIndexOf("&"));
            //*****************start
            var myReq = http.request('http://api.duoshuo.com/log/list.json' + paramsStr, function (result) {
                result.setEncoding('utf8');
                result.on('data', function (chunk) {
                    var comObj = JSON.parse(chunk).response[0];
                    console.log(comObj);
                    if(comObj.action === 'create') {
                        newsComService.addCommentFromDuoShuo(comObj, function(err, obj){
                            if(err){
                                console.log("err:"+err.message);
                                res.send('{"status":"err","message":"数据库操作异常'+err.message+'"comment_id":"'+comObj.log_id+'", "action":"'+comObj.action+'"}');
                            } else {
                                newsComService.updateLastLogId({lastLogId: comObj.log_id, id: 1}, function(err, obj){
                                    res.send('{"status":"ok","comment_id":"'+comObj.log_id+'", "action":"'+comObj.action+'"}');
                                });
                            }
                        });
                    } else {
                        res.send('{"status":"ok","comment_id":"'+comObj.log_id+'", "action":"'+comObj.action+'"}');
                    }
                });
            });
            myReq.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            myReq.end();
            //*****************end
        });
    }else{
        res.send('{"status":"err"}');
    }
});
/**
 * 检查签名
 * req 请求参数
 * secret 多说密匙
 **/
function check_signature(req, secret){
    var oriArray = [];
    var signature = req.body.signature;//多说请求签名，与此签名对比
    oriArray[0] = secret;
    oriArray[1] = req.body.action;
    oriArray.sort();//字典排序
    //var original = oriArray[0]+oriArray[1];
    var scyptoString = utils.base64encode(oriArray);

    if (signature == scyptoString) {
        //console.log(signature+'相等' + scyptoString);
        return true;
    } else {
        //console.log(signature+'不相等' + scyptoString);
    }
    return true;
}
module.exports = router;