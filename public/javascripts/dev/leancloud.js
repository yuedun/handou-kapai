AV.initialize("2guystre6l7mftvlgm8tm2vsj2mrtgrgm68wx9lgfzg2xj23", "r4q9f3iq899amkz1eaksicsi8smrkymc3esvkz7hiu3bl8k2");

var UserInfo = AV.Object.extend("UserInfo");
var ExchangeNote = AV.Object.extend("ExchangeNote");
var LightRecord = AV.Object.extend("LightRecord");

/**
 * 存储发起活动的用户信息
 * @param {Object} obj
 * 输入对象必须包括参数
 *｛
 * userId 用户id，即openid
 * nickname 用户昵称
 * word1    第一个字点亮数
 * word2    第二个字点亮数
 * word3    第三个字点亮数
 * word4    第四个字点亮数
 * word5    第五个字点亮数
 * word6    第六个字点亮数
 * word7    第七个字点亮数
 * ｝
 * 
 * 可附加参数
 * brighttime 点亮时间
 */
var saveUserInfo = function(obj, callback) {
	var userInfo = new UserInfo();
	userInfo.save(obj, {
		success: function(object) {
			callback(null, object);
		}
	});
};

/**
 * 查询发起活动的用户信息
 * @param {Object} obj
 * 输入对象必须包括参数
 * ｛
 * 	userId 用户id，即openid
 * ｝
 * 
 * @param {Object} callback
 * 返回参数ret
 * ｛
 * objectId leancloud队列号
 * userId 用户id，即openid
 * nickname 用户昵称
 * word1    第一个字点亮数
 * word2    第二个字点亮数
 * word3    第三个字点亮数
 * word4    第四个字点亮数
 * word5    第五个字点亮数
 * word6    第六个字点亮数
 * word7    第七个字点亮数 
 * light_time 点亮时间
 * light_count点亮次数
 * exchangeNote 兑换券
 * ｝
 * 
 */
var queryUserInfo = function(obj, callback) {
	var query = new AV.Query(UserInfo);
	query.equalTo("user_id", obj.userId);
	query.find({
		success: function(results) {
			callback(null, results);
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
};

/**
 * 更新发起活动的用户信息
 * @param {Object} obj
 * 必填参数
 * objectId leancloud队列号
 * 
 * 可选参数
 * word1    第一个字点亮数
 * word2    第二个字点亮数
 * word3    第三个字点亮数
 * word4    第四个字点亮数
 * word5    第五个字点亮数
 * word6    第六个字点亮数
 * word7    第七个字点亮数 
 * lightTime 点亮时间
 * exchangeNote 兑换券 
 */
var updateUserInfo = function(obj, callback) {
	var userInfo = new AV.Query(UserInfo);
	userInfo.get(obj.objectId, {
		success: function(post) {
			post.increment("word"+obj.wordNum);
			post.save();
			callback(null,post);
		},
		error: function(object, error) {
			alert(error.message);
		}
	});
};


/**
 * 添加兑换券
 * @param {Object} obj
 * 必填参数
 * notecode 兑换券
 * 
 */
var addExchangeNote = function(obj) {
	var exchange = new ExchangeNote();
	exchange.save(obj, {
		success: function(object) {
			console.log("添加兑换码成功！");
		}
	});
};

/**
 * 获得一张兑换券
 * @param {Object} callback
 * 返回参数ret
 * ｛
 * objectId leancloud队列号
 * notecode 兑换券
 * isExpend false未兑换，true已兑换
 * ｝
 */
var queryOneExchangeNote = function(openid, callback) {
	var query = new AV.Query(ExchangeNote);
	query.equalTo("isExchange", false);
	query.first({
		success: function(object) {
			callback(null, object);
			object.set("isExchange", true);
			object.set("exchangeUser", openid);
			updateExchangeNote(object);
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
};
/**
 * 获得已绑定的兑换券
 * @param {Object} callback
 * 返回参数ret
 * ｛
 * objectId leancloud队列号
 * notecode 兑换券
 * isExpend false未兑换，true已兑换
 * ｝
 */
var queryExchangeNumByOpenid = function(openid, callback) {
	var query = new AV.Query(ExchangeNote);
	query.equalTo("exchangeUser", openid);
	query.find({
		success: function(object) {
			callback(null, object);
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
};

/**
 * 更新兑换券
 * @param {Object} obj
 * 必填参数
 * ｛
 * objectId leancloud队列号
 * notecode 兑换券
 * isExpend false未兑换，true已兑换
 * ｝
 */
var updateExchangeNote = function(obj) {
	var exchangenote = new AV.Query(ExchangeNote);
	exchangenote.get(obj.id, {
		success: function(info) {
			info.save(obj, {
				success: function(object) {
					console.log("exchangenote update!");
				}
			});
		},
		error: function(object, error) {
			alert(error.message);
		}
	});
};


/**
 * 添加点亮操作活动关系登记
 * @param {Object} obj
 * 必填参数
 * ｛
 * userId 发起活动的用户编号 即openid
   friendId 帮助点亮的朋友编号，朋友的openid 
   brighttime 点亮时间
 * ｝
 */
var addLightRecord = function(obj, callback) {
	var light = new LightRecord();
	light.save(obj, {
		success: function(object) {
			callback(null, object);
		},
        error: function(post, error) {
            alert('Failed to create new object, with error message: ' + error.message);
        }
	});
};

/**
 * 查询点亮活动的用户记录，即通过发起活动用户编号，以及帮助该用户点亮操作的朋友编号，确认点亮操作是否可以进行
 * @param {Object} obj
 * 必填参数
 * ｛
 * userId 发起活动的用户编号 即openid
 * friendId 帮助点亮的朋友编号，朋友的openid 
 * ｝
 * @param {Object} callback
 * 返回参数ret
 * ｛
 * objectId leancloud队列号
 * userId 发起活动的用户编号 即openid
 * friendId 帮助点亮的朋友编号，朋友的openid 
 * canvote 是否可投票 true：可点亮 false：不能点亮
 * ｝
 * 
 */
var queryLightRecord = function(obj, callback) {
	AV.Query.doCloudQuery('select * from LightRecord where user_id=? and friend_id=?', [obj.userId, obj.friendId], {
		success: function(result) {
			//results 是查询返回的结果，AV.Object 列表
			var results = result.results;
			var record = results[0];
			if(record){
				var currentTime = new Date();
				var isSameday = isSameDay(record.get("light_date"), currentTime);
				if(isSameday) {
					record.set("can_vote", false);//日期相同，不能点亮
                    record.sameDay = false;
				}else{
					record.set("can_vote", true);
                    record.sameDay = false;
				}
			}else{
                record = {
                    can_vote: true,
                    sameDay: true,
                    get:function(){
                        return this.can_vote;
                    }
                };
			}
			callback(null, record);
		},
		error: function(error) {
			//查询失败，查看 error
			alert(error.message);
		}
	});
};

/**
 * 更新点亮操作状态
 * @param {Object} obj
 * 必须按操作
 * ｛
 * objectId leancloud队列号
 * userId 发起活动的用户编号 即openid
 * friendId 帮助点亮的朋友编号，朋友的openid 
 * canvote 是否可投票 true：可点亮 false：不能点亮
 */
var updateLightRecord = function(obj, callback) {
	// 可以先查询出要修改的那条存储
	var LightRecord = AV.Object.extend("LightRecord");
	var query = new AV.Query(LightRecord);
// 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
	query.get(obj.id, {
		success: function(post) {
			// 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
			post.set("light_count",post.get("light_count")+1);
            post.set("light_date", new Date());
			post.save();
            callback(null, post);
		},
		error: function(object, error) {
			// 失败了.
			console.log(object);
		}
	});
};

/**
 * 判断两个时间是否为同一天
 * @param {Object} light_date
 * @param {Object} currenttime
 */
var isSameDay = function(brighttime, currenttime) {
	if (brighttime.getYear() != currenttime.getYear()) {
		return false;
	}else if (brighttime.getMonth() != currenttime.getMonth()) {
		return false;
	}else if (brighttime.getDay() != currenttime.getDay()) {
		return false;
	}else{
		return true;
	}
};