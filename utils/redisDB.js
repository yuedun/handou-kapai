/**
 * Created by admin on 2015/3/13.
 */
var config = require('../config/config');
var redis = require('redis');
//var client = redis.createClient();
var client = redis.createClient(config.redisDB.port, config.redisDB.dbhost, {auth_pass:config.redisDB.password});
var myClient = {};
client.on('error', function(err){
    console.log("Error" + err);
});
client.on('connect', function(err){
    console.log("Connection has been established successfully on Redis");
});

/**
 * 不论value是什么类型的（List,Map）都需要序列化为字符串
 * @param key
 * @param expire过期时间(单位秒)
 * @param value
 * @param callback
 */
myClient.setValue = function(key, expire, value, callback){
    if (typeof value=="object") {
        client.setex(key, expire, JSON.stringify(value), redis.print);//同样可以设置过期时间，将来可能被set代替
    }else{
        client.setex(key, expire, value, redis.print);//同样可以设置过期时间，将来可能被set代替
    }
};
myClient.pri = function(str){
    console.log(str);
};
/**
 * 取出来的值为json格式的字符串，需要反序列化
 * @param key
 * @param callback
 */
myClient.select = function(key, callback){
    client.get(key, function(err, reply){
        if(err){
            callback(err);
        } else {
            callback(null, reply);
        }
    })
};
/**
 * 对数字进行加一
 * @param key
 * @param callback
 */
myClient.increment = function(key, callback){
    client.incr(key, function(err, reply){
        if(err){
            callback(err);
        } else {
            callback(null, reply);
        }
    })
};

/**
 * 是否存在key
 */
myClient.exists = function(key){
    return client.exists(key);
};

exports.myClient = myClient;