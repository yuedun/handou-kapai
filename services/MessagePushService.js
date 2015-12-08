/**
 * Created by thinkpad on 2015/8/24.
 */
var https = require("https");
var moment = require('moment');
var commonUtil = require("../utils/commonUtil.js");
var dateUtils = require("../utils/dateUtils.js");
var sequelize = require('../utils/sequelizeDB');
var user = require("../models/sqlFile/User.js");
var userService = require('./UserService');

var MessagePushService = function () {};

MessagePushService.LeanCloudParams = {
    // 生产
    /*APPID: 'ftyp976mykpgyk2ionwhnrym6lqp4yky2o6v8819fhwyvkar',
    APPKEY: 'eyju6pj468pcqs9rs3bnhshat2x5rbk74lovz5jfay0ng9n5'*/

    // Star 测试帐号
    APPID: 'dS8n8uqxoaL7h8N2rl5I8uLN',
    APPKEY: 'agku4ox4cY97q72wlfHPSlKW'
};

MessagePushService.DefaultSubscribeChannelList = ["app"];

MessagePushService.registerUser = function (params) {
    var userId = params.userId;
    var deviceType = params.deviceType;
    var deviceToken = params.deviceToken;
    var installationId = params.installationId;
    var softwareVersion = params.softwareVersion;
    var pushChannels = MessagePushService.DefaultSubscribeChannelList;
    console.log(' ################## ################## ################## ');
    console.log(' ################## userId         = ' + userId);
    console.log(' ################## deviceType     = ' + deviceType);
    console.log(' ################## deviceToken    = ' + deviceToken);
    console.log(' ################## installationId = ' + installationId);
    console.log(' ################## pushChannels   = ' + pushChannels);
    console.log(' ################## softwareVersion= ' + softwareVersion);
    var messageCheckParams = {
        userId: userId
    };
    // 获取用户注册的LeanCloud信息
    getMessageRegisterInfo(messageCheckParams, function(err, UserLeanCloudInfo){
        // 判断pushObjectId是否存在[不存在则说明是新用户，存在则说明用户已经在LeanCloud上面注册了]
        if(UserLeanCloudInfo.pushObjectId){
            console.log('>>>>> 存在pushObjectId值');
            // 区分设备类型分别判断
            if(deviceType == "android"){
                console.log('>>>>> 当前设备为Android');
                // 判断当前的设备类型和数据库中存在的设备类型是否一致
                if(deviceType == UserLeanCloudInfo.platformType){
                    console.log('>>>>> 当前设备类型和数据库中存在的设备类型一致');
                    // 判断installationId是否有变更
                    if(installationId == UserLeanCloudInfo.pushInstallationId){
                        console.log('>>>>> installationId值没有任何变更');
                        return;     // 没有变更不做任何操作，直接返回
                    } else {
                        console.log('>>>>> installationId值有变更');
                        // 有变更则需要重新注册，并订阅
                        // 动态路径参数
                        var params0 = {
                            objectId:"",
                            push:""
                        };
                        // 要写入到LeanCloud的信息
                        var sendobj0 = {
                            deviceType: deviceType,
                            installationId: installationId,             // LeanCloud的Android标识
                            channels: UserLeanCloudInfo.pushChannels    // LeanCloud的频道[将之前订阅过的频道重新赋值给LeanCloud的新记录-即为重新订阅]
                        };
                        // 向LeanCloud发送请求
                        requestLeanCloud(params0, sendobj0, function(err, body){
                            var ret = JSON.parse(body);
                            // 条件
                            var condition = {
                                userId:userId
                            };
                            // 要修改的值
                            var changeParams = {
                                installationId: installationId,          // LeanCloud的android标识
                                softwareVersion: softwareVersion,        // 软件版本号
                                objectId: ret.objectId                   // ObjectId
                            };
                            // 保存已变更的信息到数据库
                            userService.updateUser(condition, changeParams, function(err, obj){
                                console.log(' >>>>> obj = ' + obj);
                            });
                        });
                    }
                } else {
                    console.log('>>>>> 当前设备类型和数据库中的设备类型不一致');
                    // 不一致、则变更设备类型，并修改相对于的 installationId值,回填ObjectId,和重新订阅频道
                    // 动态路径参数
                    var params1 = {
                        objectId:"",
                        push:""
                    };
                    // 要写入到LeanCloud的信息
                    var sendobj1 = {
                        deviceType: deviceType,
                        installationId: installationId,             // LeanCloud的android标识
                        channels: UserLeanCloudInfo.pushChannels    // LeanCloud的频道[将之前订阅过的频道重新赋值给LeanCloud的新记录-即为重新订阅]
                    };
                    // 向LeanCloud发送请求
                    requestLeanCloud(params1, sendobj1, function(err, body){
                        var ret = JSON.parse(body);
                        // 条件
                        var condition = {
                            userId:userId
                        };
                        // 要修改的值
                        var changeParams = {
                            installationId: installationId,          // LeanCloud的android标识
                            softwareVersion: softwareVersion,        // 软件版本号
                            platformType: deviceType,                // 设备类型  [只有在设备类型不一致的时候才改变设备类型]
                            objectId: ret.objectId                   // ObjectId
                        };
                        // 保存已变更的信息到数据库
                        userService.updateUser(condition, changeParams, function(err, obj){
                            console.log(' >>>>> obj = ' + obj);
                        });
                    });
                }
            } else if(deviceType == "ios"){
                console.log('>>>>> 当前设备为IOS');
                // 判断当前的设备类型和数据库中存在的设备类型是否一致
                if(deviceType == UserLeanCloudInfo.platformType){
                    console.log('>>>>> 当前设备类型跟数据中的设备类型一致');
                    // 判断deviceToken是否有变更
                    if(deviceToken == UserLeanCloudInfo.pushDeviceToken){
                        console.log('>>>>> deviceToken值没有任何变更');
                        return;         // 一致、则直接返回不做任何操作
                    } else {
                        console.log('>>>>> deviceToken值有变更');
                        // 动态路径参数
                        var params2 = {
                            objectId:"",
                            push:""
                        };
                        // 要写入到LeanCloud的信息
                        var sendobj2 = {
                            deviceType: deviceType,
                            deviceToken: deviceToken,                   // LeanCloud的IOS标识
                            channels: UserLeanCloudInfo.pushChannels    // LeanCloud的频道[将之前订阅过的频道重新赋值给LeanCloud的新记录-即为重新订阅]
                        };
                        // 向LeanCloud发送请求
                        requestLeanCloud(params2, sendobj2, function(err, body){
                            var ret = JSON.parse(body);
                            // 条件
                            var condition = {
                                userId:userId
                            };
                            // 要修改的值
                            var changeParams = {
                                deviceToken: deviceToken,                // LeanCloud的ios标识
                                softwareVersion: softwareVersion,        // 软件版本号
                                objectId: ret.objectId                   // ObjectId
                            };
                            // 保存已变更的信息到数据库
                            userService.updateUser(condition, changeParams, function(err, obj){
                                console.log(' >>>>> obj = ' + obj);
                            });
                        });
                    }
                } else {
                    console.log('>>>>> 当前设备类型跟数据中的设备类型不一致');
                    // 不一致、则变更设备类型，并修改相对于的 deviceToken值,回填ObjectId,和重新订阅频道
                    // 动态路径参数
                    var params3 = {
                        objectId:"",
                        push:""
                    };
                    // 要写入到LeanCloud的信息
                    var sendobj3 = {
                        deviceType: deviceType,
                        deviceToken: deviceToken,                   // LeanCloud的IOS标识
                        channels: UserLeanCloudInfo.pushChannels    // LeanCloud的频道[将之前订阅过的频道重新赋值给LeanCloud的新记录-即为重新订阅]
                    };
                    // 向LeanCloud发送请求
                    requestLeanCloud(params3, sendobj3, function(err, body){
                        var ret = JSON.parse(body);
                        // 条件
                        var condition = {
                            userId:userId
                        };
                        // 要修改的值
                        var changeParams = {
                            deviceToken: deviceToken,                // LeanCloud的ios标识
                            softwareVersion: softwareVersion,        // 软件版本号
                            platformType: deviceType,                // 设备类型  [只有在设备类型不一致的时候才改变设备类型]
                            objectId: ret.objectId                   // ObjectId
                        };
                        // 保存变更的信息到数据库
                        userService.updateUser(condition, changeParams, function(err, obj){
                            console.log(' >>>>> obj = ' + obj);
                        });
                    });
                }
            } else {
                console.log('>>>>> 存在pushObjectId时---暂不支持用户的设备类型!');
                return;
            }
        } else {
            console.log('>>>>> 不存在pushObjectId值');
            // 不存在，则新增到数据库并注入到LeanCloud上
            // 判断设备类型
            if(deviceType == "android"){
                console.log('>>>>> 新用户设备类型-->>Android');
                // 动态路径参数
                var params4 = {
                    objectId:"",
                    push:""
                };
                // 要写入到LeanCloud的信息
                var sendobj4 = {
                    deviceType: deviceType,
                    installationId: installationId,            	// LeanCloud的Android标识
                    channels: MessagePushService.DefaultSubscribeChannelList    // 首次登录默认订阅["app"]
                };
                // 向LeanCloud发送请求
                requestLeanCloud(params4, sendobj4, function(err, body){
                    var ret = JSON.parse(body);
                    // 条件
                    var condition = {
                        userId:userId
                    };
                    // 要修改的值
                    var changeParams = {
                        installationId: installationId,          // LeanCloud的android标识
                        softwareVersion: softwareVersion,        // 软件版本号
                        platformType: deviceType,                // 设备类型  [只有在设备类型不一致的时候才改变设备类型]
                        objectId: ret.objectId ,                 // ObjectId
                        channels: JSON.stringify(MessagePushService.DefaultSubscribeChannelList)    // 首次登录默认订阅["app"]
                    };
                    // 保存新用户信息到数据库
                    userService.updateUser(condition, changeParams, function(err, obj){
                        console.log(' >>>>> obj = ' + obj);
                    });
                });
            } else if(deviceType == "ios"){
                console.log('>>>>> 新用户设备类型-->>iOS');
                // 动态路径参数
                var params5 = {
                    objectId:"",
                    push:""
                };
                // 要写入到LeanCloud的信息
                var sendobj5 = {
                    deviceType: deviceType,
                    deviceToken: deviceToken,            		// LeanCloud的ios标识
                    channels: MessagePushService.DefaultSubscribeChannelList    // 首次登录默认订阅["app"]
                };
                // 向LeanCloud发送请求
                requestLeanCloud(params5, sendobj5, function(err, body){
                    var ret = JSON.parse(body);
                    // 条件
                    var condition = {
                        userId:userId
                    };
                    // 要修改的值
                    var changeParams = {
                        deviceToken: deviceToken,                // LeanCloud的ios标识
                        softwareVersion: softwareVersion,        // 软件版本号
                        platformType: deviceType,                // 设备类型  [只有在设备类型不一致的时候才改变设备类型]
                        objectId: ret.objectId ,                 // ObjectId
                        channels: JSON.stringify(MessagePushService.DefaultSubscribeChannelList)    // 首次登录默认订阅["app"]
                    };
                    // 保存新用户信息到数据库
                    userService.updateUser(condition, changeParams, function(err, obj){
                        console.log(' >>>>> obj = ' + obj);
                    });
                });
            } else {
                console.log('>>>>> 新用户的设备类型暂不支持!');
                return;
            }
        }
    });
};

/**
 * 订阅指定频道推送
 * @param params Object:{userId, channels}
 * userId:String, channels:Array 或 String
 */
MessagePushService.subscribeChannel = function (params) {
    var userId = params.userId;
    var messageCheckParams = {
        userId: userId
    };
    getMessageRegisterInfo(messageCheckParams, function (err, ret) {
        if (ret) {
            var channels = ret.pushChannels;
            channels = channelsAdd(channels, params.channels);
            var options = {
                "method": "PUT",
                "hostname": "leancloud.cn",
                "path": "/1.1/installations/" + ret.pushObjectId,
                "headers": {
                    "content-type": "application/json",
                    "x-avoscloud-application-id": MessagePushService.LeanCloudParams.APPID,
                    "x-avoscloud-application-key": MessagePushService.LeanCloudParams.APPKEY
                }
            };

            var req = https.request(options, function (res) {
                var chunks = [];
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    /*保存推送注册信息*/
                    var updateParams = {
                        channels: JSON.stringify(channels)
                    };
                    // 保存新用户信息到数据库
                    userService.updateUser({userId: userId}, updateParams, function(err, obj){});
                });
            });
            req.write(JSON.stringify({
                channels: channels
            }));
            req.end();
        }
    });
};

/**
 * 取消订阅指定频道推送
 * @param params Object:{userId, channels}
 * userId:String, channels:Array
 */
MessagePushService.unsubscribeChannel = function (params) {
    var userId = params.userId;
    var channels = params.channels[0];
    var removeChannel = params.channels;
    var messageCheckParams = {
        userId: userId
    };
    getMessageRegisterInfo(messageCheckParams, function (err, ret) {
        if (ret) {
            //删除leancloud pushChannels数组中的某一个频道
            var updateChannels = commonUtil.removeByValue(ret.pushChannels, channels[0]);
            var options = {
                "method": "PUT",
                "hostname": "leancloud.cn",
                "path": "/1.1/installations/" + ret.pushObjectId,
                "headers": {
                    "content-type": "application/json",
                    "x-avoscloud-application-id": MessagePushService.LeanCloudParams.APPID,
                    "x-avoscloud-application-key": MessagePushService.LeanCloudParams.APPKEY
                }
            };
            var req = https.request(options, function (res) {
                var chunks = [];
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    var updateParams = {
                        channels: JSON.stringify(updateChannels)
                    };
                    userService.updateUser({userId: userId}, updateParams, function(err, obj){});
                });
            });
            req.write(JSON.stringify({
                channels: {
                    "__op": "Remove",
                    "objects": removeChannel
                }
            }));
            req.end();
        }
    });
};

/**
 * 发送推送消息
 * @param params
 */
MessagePushService.sendMessage = function (params) {
    var userId = params.userId;
    if (userId) {
        var messageParams = { userId: userId };
        // 检索用户的LeanCloud信息
        getMessageRegisterInfo(messageParams, function (err, messageInfo) {
            if (messageInfo) {
                var nickName = messageInfo.nickName;
                // 排除掉官方账号
                if(nickName.substring(nickName.length-3) == "-韩豆"){
                    return;
                }
                console.log('>>>>> >>>>> >>>>> platformType = ' + messageInfo.platformType);
                console.log('>>>>> >>>>> >>>>> userType     = ' + messageInfo.userType);
                console.log('>>>>> >>>>> >>>>> goal         = ' + params.goal);
                // 粉丝团或组织推送的时候，用户不管是Android 或 iOS 设备都允许接受到消息
                if(params.goal){
                    console.log('>>>>>>>>>>>>>>> 粉丝团或组织推送');
                    messageInfo.pushDeviceToken = "";
                    messageInfo.pushInstallationId = "";
                } else {
                    console.log('>>>>>>>>>>>>>>> 其他推送');
                    //其他推送时[只推送一种设备类型]
                    if(messageInfo.platformType == "android"){
                        messageInfo.pushDeviceToken = "";
                    } else if(messageInfo.platformType == "ios"){
                        messageInfo.pushInstallationId = "";
                    } else {
                        console.log('>>>>> 暂不支持该种设备类型推送!');
                        return;
                    }
                }
                console.log('>>>>> pushDeviceToken    = ' + messageInfo.pushDeviceToken);
                console.log('<<<<< pushInstallationId = ' + messageInfo.pushInstallationId);

                // 推送所需要的参数
                var pushParams = {
                    installationId: messageInfo.pushInstallationId,             // LeanCloud的android标识
                    deviceToken: messageInfo.pushDeviceToken,                   // LeanCloud的ios标识
                    data: params.data,                                          // 客户端接受推送的JSON数据格式
                    channels: params.channels,                                  // 推送的频道
                    pushTime: params.pushTime,                                  // 推送时间
                    prod: params.prod   // 仅对 iOS 有效。设置使用开发证书（dev）还是生产证书（prod）。当设备设置了 deviceProfile 时我们优先按照 deviceProfile 指定的证书推送。
                };
                // 组装推送包
                var pushData = pushPack(pushParams);
                // 动态路径参数
                var params0 = {
                    objectId: "",
                    push: "push"
                };
                // 要写入到LeanCloud的信息
                var sendobj0 = pushData;
                // 向LeanCloud发送请求
                requestLeanCloud(params0, sendobj0, function(err, body){
                    // 若输出该log、则说明推送的内容已经注入到LeanCloud
                    console.log(' [User]>>>> pushData = ' + JSON.stringify(pushData));
                });
            }
        });
    } else {
        var pushData = pushPack(params);
        // 动态路径参数
        var params1 = {
            objectId: "",
            push: "push"
        };
        // 要写入到LeanCloud的信息
        var sendobj1 = pushData;
        // 向LeanCloud发送请求
        requestLeanCloud(params1, sendobj1, function(err, body){
            // 若输出该log、则说明推送的内容已经注入到LeanCloud
            console.log(' [All]>>>> pushData = ' + JSON.stringify(pushData));
        });
    }
};

/**
 * 封装消息结构
 * @param params
 */
var pushPack = function (params) {
    var pushData = {};
    pushData.data = {};
    // 设置推送的数据内容
    if (params.data) {
        pushData.data = params.data;
        var currentTime = new Date();
        pushData.data.createDate = dateUtils.formatDate(currentTime);
    }else{
        pushData.data = {
            alert:      "你有一条未读消息",
            title:      "咖哌消息"
        };
    }
    // 设置订阅频道
    if (params.channels) {
        pushData.channels = params.channels;
    }else{
        console.log('%%%%%% installationId = ' + params.installationId);
        console.log('%%%%%% deviceToken    = ' + params.deviceToken);
        // 判断Android 或 iOS 设备 ... ...
        if (params.installationId) {
            pushData.where = {};
            pushData.where.installationId = params.installationId;
        } else if(params.deviceToken){
            // IOS设备
            pushData.where = {};
            pushData.where.deviceToken = params.deviceToken;
        } else {
            // 不区分设备类型，两种设备都可以收到推送
            console.log('>>>>> android 或 ios 都能收到推送');
        }
    }
    // 设置定时推送时间
    if (params.pushTime) {
        pushData.push_time = params.pushTime;
    }
    // 设置（LeanCloud的测试 或 生产）证书
    if (params.prod) {
        pushData.prod = params.prod;
    }
    return pushData;
};

/**
 * 2015-11-19 by Star
 * 向LeanCloud发送请求
 * @param params
 */
var requestLeanCloud = function(params, sendobj, callback){
    // 设置动态路径
    var dynamicPath = "";
    // 如果push不为空，则说明这次为推送
    if(params.push){
        dynamicPath = "/1.1/push";
    } else {
        // 如果objectId不为空，则说明（订阅、退订）
        if(params.objectId){
            dynamicPath = "/1.1/installations/"+params.objectId;
        } else {
            // 注册LeanCloud
            dynamicPath = "/1.1/installations";
        }
    }
    // 请求的基础参数
    var options = {
        "method": "POST",
        "hostname": "leancloud.cn",
        "port": null,
        "path": dynamicPath,
        "headers": {
            "content-type": "application/json",
            "x-avoscloud-application-id": MessagePushService.LeanCloudParams.APPID,
            "x-avoscloud-application-key": MessagePushService.LeanCloudParams.APPKEY
        }
    };

    // 向LeanCloud发送https请求
    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            callback(null, body);       // 返回必要参数
        });
    });
    // 向LeanCloud写入数据
    req.write(JSON.stringify(sendobj));
    req.end();
};

/**
 * 获得用户推送消息注册信息
 * @param params 必须提供:UserId
 * @returns {{}}
 */
var getMessageRegisterInfo = function (params, callback) {
    sequelize.query(user.getMessageRegisterInfo(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (records) {
        if (records.length > 0) {
            var record = records[0];
            record.pushChannels = JSON.parse(record.pushChannels);
            callback(null, record);
        }
    }).catch(function(err){
        callback(err);
    });
};

var channelsAdd = function (channels, new_channel) {
    var channelList = [];
    channelList = channelList.concat(channels);
    channelList = channelList.concat(new_channel);
    channelList = commonUtil.unique(channelList);
    return channelList;
};


module.exports = MessagePushService;
