var Constants = require('../../utils/constants');
/**
 * direction is 0 by default.
 * 
 * @return {[type]} [description]
 */
module.exports = function() {
	var sql = "";
	//频道页-粉丝团频道-明星列表5条数据
	this.getGroupListByChannels = function(params) {
		//第一行只能用sql=不能用sql +=，因为上一次执行并不会释放sql
		sql = " SELECT g.group_id AS groupId, g.star_name AS starName, g.star_logo AS starLogo, count(t.topic_id) AS topicQuantity";
		sql += " FROM fans_group g INNER JOIN";
		sql += " topic t ON g.group_id = t.group_id LEFT JOIN kp_user ku ON t.user_id = ku.user_id";
		sql += " WHERE t.topic_state = 1";
		sql += " and g.group_state = 1";//明星已发布
		sql += " and t.topic_type < 2";//频道类型
		sql += " group by g.group_id ";
		sql += " order by topicQuantity desc, g.update_date desc ";
		sql += " LIMIT "+params.offset + ", " + params.limit + ";";
		return sql;
	};
	// 粉丝团动态数据(组织帖子)
	this.fansTopic = function(params){
		sql  = " select";
		sql += " t.topic_id as topicId, t.topic_name as topicName,";
		sql += " t.topic_scope as topicScope, t.like_count as likeCount,";
		sql += " t.is_recommend as isRecommend, t.group_id as groupId,";
		sql += " t.user_id as userId, t.audio_address AS audioAddress,";
		sql += " t.audio_time AS audioTime, t.topic_desc AS topicDesc,";
		sql += " t.topic_pics AS topicPics, t.pics_size AS picsSize,";
		sql += " t.create_date as createDate, t.timed_release_date as timedReleaseDate,";
		sql += " ku.user_type as userType, ku.nick_name as nickName,";
		sql += " ku.head_portrait as headPortrait ";
		sql += " from topic t , kp_user ku";
		sql += " where t.user_id = ku.user_id";
		sql += " and t.topic_state = " + Constants.STATE.ACTIVE; 	 // 激活帖子标识
		sql += " and t.topic_type = " + Constants.POST.ORGANIZE;   // 组织帖子标识
		sql += " and ((t.timed_release_date is null) or (t.timed_release_date <= NOW()))  ";   // 过滤定时发布内容
		sql += " and t.group_id = '" + params.groupId + "'";
		// 分页方向
		if(params.direction === Constants.DIRECTION.LOADMORE){
			sql += " and IFNULL(t.timed_release_date, t.create_date) < '" + params.lastDate + "'";	// 加载
		}
		sql += " order by IFNULL(t.timed_release_date, t.create_date) desc";   // 刷新
		// 分页条目
		if(params.pageSize != null) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};
	// 我关注的组织帖子数据
	this.iCareAbout = function(params){
		sql  = " select";
		/*sql += " t.topic_id as topicId, t.topic_name as topicName, ";
		sql += " t.topic_scope as topicScope, t.like_count as likeCount,";
		sql += " t.is_recommend as isRecommend, t.user_id as userId, ";
		sql += " t.create_date as createDate, t.timed_release_date as timedReleaseDate, ";
		sql += " t.topic_type as topicType, ku.nick_name as nickName, ";
		sql += " ku.head_portrait as headPortrait, ku.user_type as userType ";*/
		sql += " t.topic_id as topicId, t.topic_name as topicName,";
		sql += " t.topic_scope as topicScope, t.like_count as likeCount,";
		sql += " t.is_recommend as isRecommend, t.group_id as groupId,";
		sql += " t.user_id as userId, t.audio_address AS audioAddress,";
		sql += " t.audio_time AS audioTime, t.topic_desc AS topicDesc,";
		sql += " t.topic_pics AS topicPics, t.pics_size AS picsSize,";
		sql += " t.create_date as createDate, t.timed_release_date as timedReleaseDate,";
		sql += " ku.user_type as userType, ku.nick_name as nickName,";
		sql += " ku.head_portrait as headPortrait ";
		sql += " from org_user_relation our, kp_user ku, topic t ";
		sql += " where our.user_id = ku.user_id ";
		sql += " and our.org_id = t.user_id";
		sql += " and ku.state = " + Constants.STATE.ACTIVE;       // 审核通过组织
		sql += " and t.topic_state = " + Constants.STATE.ACTIVE;
		sql += " and t.topic_type = " + Constants.POST.ORGANIZE;  // 组织帖子
		sql += " and ((t.timed_release_date is null) or (t.timed_release_date <= NOW()))";  // 过滤定时发布内容
		sql += " and our.user_id = '" + params.userId + "'";		// 用户ID
		sql += " and t.group_id = '" + params.groupId +"'";		// 粉丝团ID
		if(params.direction === Constants.DIRECTION.LOADMORE){
			sql += " and IFNULL(t.timed_release_date, t.create_date) < '" + params.lastDate + "'";	// 加载
		}
		sql += " order by IFNULL(t.timed_release_date, t.create_date) desc";  // 置顶, 时间倒顺
		if(params.pageSize != null) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};
	// 粉丝团列表/admin
	this.getGroupListAndCount = function(params){
		return {
			rows: function(){
				sql =  " SELECT`Group`.`group_id` AS `groupId`, ";
				sql += "`Group`.`star_name` AS `starName`, ";
				sql += "`Group`.`group_name` AS `groupName`, ";
				sql += "`Group`.`fan_count` AS `fanCount`, ";
				sql += "COUNT(`ov`.`org_verify_id`) AS `orgCount`, ";
				sql += "`Group`.`group_state` AS `groupState` ";
				sql += "FROM `fans_group` AS `Group` ";
				sql += "LEFT JOIN `org_verify` AS `ov` ON `Group`.`group_id` = `ov`.`group_id` ";
				sql += "WHERE 1=1 ";
				if(params.groupState != null) {
					sql += " AND `Group`.`group_state` = :groupState ";
				}
				if(params.starName != null){
					sql += " AND `Group`.`star_name` like '%"+params.starName+"%' ";
				}
				sql += "GROUP BY ";
				sql += "`Group`.`group_id` ";
				sql += "ORDER BY " + params.order;
				sql += " LIMIT :offset, :limit;";
				return sql;
			},
			count: function(){
				sql = "SELECT count(*) AS `count` FROM `fans_group` AS `Group` ";
				sql += "WHERE 1=1 ";
				if(params.groupState) {
					sql += " AND `Group`.`group_state` = :groupState ";
				}
				if(params.starName){
					sql += " AND `Group`.`star_name` like '%"+params.starName+"%' ";
				}
				return sql;
			}
		};
	};
		//我的身份卡       接口
	this.getIdCard = function(params){
		sql ="select g.star_name as starName,g.star_logo as starLogo,g.group_name as groupName,";
		sql +=" ic.card_number as cardNumber,ic.create_date as createDate,ic.user_id as userId,ic.group_id as groupId";
		sql +=" from id_card ic inner join fans_group g on ic.group_id=g.group_id";
		sql +=" where ic.card_state=1 and g.group_state=1";
		sql +=" and ic.user_id = '"+params.userId+"'";
		if(params.direction == Constants.DIRECTION.LOADMORE){
			sql += " and ic.create_date < '" + params.lastDate + "'";	// 加载
		}
		sql += " order by ic.create_date desc";
		if(params.pageSize) {
			sql += " limit " + params.pageSize;
		}
		return sql;
	};
	/**
	 * 粉丝团粉丝数加1，减1
	 * @param params
	 * @returns {{inc: Function, dec: Function}}
	 */
	this.updateGroupFansCount = function (params) {
		return "UPDATE fans_group SET fan_count = fan_count + ("+ params.action+") WHERE group_id = :groupId";
	};
	/**
	 * 粉丝团粉丝数加1，减1
	 * @param params
	 * @returns {{inc: Function, dec: Function}}
	 */
	this.updateCardNum = function (params) {
		return "UPDATE fans_group SET card_number = card_number + ("+ params.action+") WHERE group_id = :groupId";
	};
	//获取首次订阅明星列表,排除已选择的
	this.getMyStarList = function (params) {
		sql = "SELECT";
		sql	+= " fg.group_id AS groupId,";
		sql	+= " fg.star_logo AS starLogo, ";
		sql	+= " fg.star_name AS starName";
		sql	+= " FROM fans_group fg WHERE";
		sql	+= " fg.group_id NOT IN (";
		sql	+= " SELECT gur.group_id FROM";
		sql	+= " group_user_relation gur";
		sql	+= " WHERE gur.user_id = '"+ params.userId +"')";
		return sql;
	};
	//查询粉丝团下组织列表，普通组织和内部组织
	this.getGroupsOrg = function (params) {
		sql = "SELECT user_id AS userId";
		sql += " FROM group_user_relation AS gur";
		sql += " WHERE";
		sql += " gur.group_id = :groupId";
		sql += " AND gur.user_type = 'org'";
		sql += " UNION ALL";
		sql += " SELECT user_id AS userId";
		sql += " FROM org_verify AS ov";
		sql += " WHERE";
		sql += " ov.group_id = :groupId";
		return sql;
	};
};