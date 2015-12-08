var Constants = require('../../utils/constants');

/**
 * 查询粉丝团明星列表
 */
module.exports = function() {
	var sql = "";
	// 查询粉丝团下的频道列表
	this.getGroupChannels = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.group_id = :groupId";
		sql += " AND t.topic_state = 1 AND t.topic_type < 2";//频道类型，非帖子类型
		if(params.direction === Constants.DIRECTION.LOADMORE){
			//以时间分割
			sql += " AND t.update_date < '"+ params.lastDate+"' ";
		}
		sql += " ORDER BY t.update_date DESC";//频道更新时间倒排序
		sql += " LIMIT " + params.pageSize + ";";//频道首页最新显示10条，默认100条显示
		return sql;
	};
	//推荐频列表
	this.getTopChannelList = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait, count(ct.topic_id) AS degreeOfHeat";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " LEFT JOIN topic ct ON t.topic_id = ct.parent_topic_id AND ct.topic_state = 1";
		sql += " WHERE t.topic_state = 1 AND t.topic_type < 2";//频道类型，非帖子类型
		sql += " AND t.is_recommend = 1";//推荐
		sql += " GROUP BY t.topic_id";
		sql += " ORDER BY degreeOfHeat DESC";//热度排序
		sql += " LIMIT "+params.offset + ", " + params.limit + ";";
		return sql;
	};
	//频道列表，最新频道以时间排序
	this.getChannels = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.topic_state = 1 AND t.topic_type < 2";
		if(params.direction === Constants.DIRECTION.LOADMORE){
			//以时间分割
			sql += " AND t.update_date < '"+ params.lastDate+"'";
		}
		sql += " ORDER BY updateDate DESC";
		sql += " LIMIT " + params.limit + ";";//频道首页最新显示10条，默认100条显示
		return sql;
	};
	//频道列表，最热频道
	this.getHotestChannels = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.topic_state = 1 AND t.topic_type < 2";
		if(params.direction === Constants.DIRECTION.LOADMORE){
			//以时间分割
			sql += " AND t.update_date < '"+ params.lastDate+"'";
		}
		sql += " ORDER BY updateDate DESC";
		sql += " LIMIT " + params.limit + ";";//频道首页最新显示10条，默认100条显示
		return sql;
	};
	//组织频道，我的频道
	this.getUserChannel = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait, count(ct.topic_id) AS degreeOfHeat ";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " LEFT JOIN topic ct ON t.topic_id = ct.parent_topic_id AND ct.topic_state = 1";
		if (params.orderType == "hot") {
			sql += " WHERE t.topic_state = 1 AND t.topic_type < 2";//小于2的为频道，0：普通频道，1粉丝团频道
		} else {
			sql += " WHERE t.user_id = :userId AND t.topic_state = 1 AND t.topic_type < 2";//小于2的为频道，0：普通频道，1粉丝团频道
		}
		if(params.direction === Constants.DIRECTION.LOADMORE){
			//以更新时间分割
			sql += " AND t.update_date < '"+ params.lastDate+"'";
		}
		sql += " GROUP BY t.topic_id";
		if (params.orderType == "hot") {
			sql += " ORDER BY degreeOfHeat DESC";
		} else {
			sql += " ORDER BY ct.update_date DESC";
		}
		sql += " LIMIT " + params.pageSize + ";";//频道首页最新显示10条，默认100条显示
		return sql;
	};
	//个人中心，我的频道：普通频道和粉丝团频道
	this.getMyTopicList = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_scope AS topicScope, t.update_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait, count(ct.topic_id) AS degreeOfHeat ";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " LEFT JOIN topic ct ON t.topic_id = ct.parent_topic_id AND ct.topic_state = 1";
		sql += " WHERE t.user_id = :userId AND t.topic_state = 1 AND t.topic_type = :topicType";
		//0：普通频道，1：粉丝团频道，2：频道帖子，3：组织帖子
		if(params.direction === Constants.DIRECTION.LOADMORE){
			//以更新时间分割
			sql += " AND t.update_date < '"+ params.lastDate+"'";
		}
		sql += " GROUP BY t.topic_id";
		sql += " ORDER BY t.update_date DESC";
		sql += " LIMIT " + params.pageSize + ";";
		return sql;
	};
	//查询分享帖子数据
	this.getTopicToShare = function(params) {
		sql = "SELECT t.topic_id AS post_id, t.topic_desc AS post_description, t.audio_address, t.topic_pics,";
		sql += " t.create_date, ku.user_id, ku.nick_name, ku.head_portrait";
		sql += " FROM topic t LEFT JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.topic_id = :topicId";
		return sql;
	};
	//官网频道
	this.portalTopic = function(params) {
		sql = "SELECT t.topic_id AS topicId, t.topic_name AS topicName, t.topic_desc AS topicDesc,";
		sql += " t.topic_pics AS topicPics, t.topic_scope AS topicScope, t.create_date AS createDate, t.update_date AS updateDate,";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName, ku.user_type AS userType,";
		sql += " ku.head_portrait AS headPortrait";
		sql += " FROM topic t INNER JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.topic_state = 1 AND t.topic_type = 3 AND t.topic_pics IS NOT NULL";
		sql += " ORDER BY createDate DESC";
		sql += " LIMIT " + params.offset + ", " +params.limit+";";
		return sql;
	};
	/**
	 * 今天是否创建过频道
	 */
	this.isUpTopic = function(params){
		sql = "SELECT COUNT(*) as count from topic where topic_type in(0,1) and user_id = '"+params.userId+"' and DATE_FORMAT(create_date,'%Y-%m-%d') = curdate()";
		return sql;
	};
};