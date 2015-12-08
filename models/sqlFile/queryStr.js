/**
 * Created by admin on 2015/4/24.
 */
function queryStr() {
    var sql = "";
    this.sharePost = function(params) {
        sql = "SELECT p.post_id, p.post_description, u.user_id, ui.nick_name, ui.head_portrait, p.create_date " +
            "FROM post AS p " +
            "LEFT JOIN user AS u ON p.user_id = u.user_id " +
            "LEFT JOIN user_info AS ui ON u.user_id = ui.user_id " +
            "WHERE p.post_id = '" + params.post_id + "'" +
            "union " +
            "SELECT up.user_post_id as post_id, up.user_post_description as post_description, u.user_id, ui.nick_name, ui.head_portrait, up.create_date " +
            "FROM user_post AS up " +
            "LEFT JOIN user AS u ON up.user_id = u.user_id " +
            "LEFT JOIN user_info AS ui ON u.user_id = ui.user_id " +
            "WHERE up.user_post_id = '" + params.post_id + "'";
        return sql;
    };
    this.pictures = function(params) {
        sql = "SELECT p.picture_original_name, p.picture_original_path, p.picture_screenshot_path, " +
            "p.studio_id from picture p where post_id = '" + params.post_id + "' and picture_state = 0";
        return sql;
    };
    //查询资讯列表
    this.news = function(params) {
        sql = "SELECT n.news_id,n.title_kor,n.title_zh,n.quote_kor,n.quote_zh,n.summary_kor,n.summary_zh,";
        sql +="n.picture_mini,n.picture_preview,n.translate_state,n.recommend_state,";
        sql +="n.user_id,n.read_count, n.create_date,";
        sql +="n.release_date FROM news n where ";
        sql +="((n.state = 0 and n.release_date is null) or n.release_date < now())";
        sql +=" and n.recommend_state != 0 ";
        sql +="ORDER BY ";
        sql +="IFNULL(n.release_date, n.create_date) desc ";
        sql +=" LIMIT " + params.offset + ", " + params.limit;
        return sql;
    };

    this.newsfilter = function(params) {
        sql = "select n.news_id, n.news_number, n.title_kor, n.title_zh, n.summary_kor, n.summary_zh, n.picture_mini, ";
        sql += "n.translate_state, n.read_count, n.description_kor, n.description_zh, n.release_date, ";
        sql += " DATE_FORMAT(n.create_date,'%Y-%m-%d %H:%i') as create_date ";
        sql += "from news n, news_cate_relation ncr where ";
        sql += "(n.state = 0  or n.release_date < now()) ";
        sql += " and ncr.state = 0 and ncr.news_id = n.news_id ";
        if(params.isTranslate) {
            sql += "and n.translate_state = " + (Number(params.isTranslate) === 2 ? 0 : -1) + " ";
        }
        var categoryIds = '';
        if (params.categoryIds && params.categoryIds.length) {
            for (var i = 0; i < params.categoryIds.length; i++) {
                categoryIds = categoryIds + "'" + params.categoryIds[i] + "'";
                if (i !== params.categoryIds.length - 1) {
                    categoryIds = categoryIds + ', ';
                }

            }
        }
        if(categoryIds !== '') {
            sql += "and ncr.category_id in (" + categoryIds + ") ";    
        }
        sql += " GROUP BY n.news_id ";//按资讯id分组
        sql += "ORDER BY ";
        sql += "n.create_date DESC ";
        sql += "LIMIT " + params.offset + ", " + params.limit;
        return sql;
    };

    //我加入的粉丝团
    this.myCategory = function(params) {
        sql = "SELECT c.category_id, c.category_name FROM category_relation cr, category c where ";
        sql += "cr.category_relation_state = 0 ";
        sql += "and cr.category_id = c.category_id ";
        sql += "and cr.user_id = '" + params.userId + "'";
        return sql;
    };
    //帖子评论列表
    this.comments = function(params) {
        sql = "SELECT c.comment_content, c.comment_voice, ui.nick_name, ui.head_portrait, "+
        "date_format(c.create_date,'%Y-%m-%d %H:%i:%s') as create_date FROM comment c, user_info ui "+
        "where c.comment_state = 0 and c.user_id = ui.user_id and post_id = '" + params.post_id + "'";
        return sql;
    };
    //资讯评论列表
    this.newsComments = function(params) {
        sql = "SELECT c.comment_content, c.comment_voice, ui.nick_name, " +
            "ui.head_portrait, date_format(c.create_date,'%Y-%m-%d %H:%i:%s') as create_date " +
            "FROM comment c, user_info ui " +
            "where c.comment_state = 0 and c.user_id = ui.user_id and " +
            "news_id = '" + params.news_id + "'" +
            " order by sort_field=0, sort_field asc, release_date Desc";
        return sql;
    };
    //修改资讯评论点赞数
    this.updateComLikeCount = function(params) {
        sql = "UPDATE news_comment ";
        sql +="SET like_count = like_count + ("+params.value+") ";
        //sql+="AND update_date = '2015-06-11 12:46:23'";
        sql+="WHERE ";
        sql+="comment_id = '"+params.news_comment_id+"'";
        return sql;
    };
    //拍点啥粉丝团列表及下面图片
    this.categoryList = function(params) {
        sql =" SELECT pz1.category_id, pz1.category_name, pz1.picture_original_path, COUNT(pz2.picture_id) as pic_count ";
        sql+=" FROM picture_zuji AS pz1 ";
        sql+=" LEFT JOIN picture_zuji pz2 ON pz1.category_id = pz2.category_pid ";
        sql+=" WHERE pz1.picture_type = 31 ";
        sql+="  GROUP BY pz1.category_id ";
        return sql;
    };
    //拍点啥消息列表
    this.pdsMsg = function(params) {
        sql =" SELECT ";
		sql+= " activity_id,";
		sql+= " activity_title,";
		sql+= " activity_pic,";
		sql+= " activity_summary,";
		sql+= " is_award_list,";
		sql+= " activity_start_date,";
		sql+= " activity_end_date,";
		sql+= " release_date,";
		sql+= " create_date";
		sql+= " FROM activity_pds AS activity_pds";
		sql+= " WHERE";
		sql+= " (1 = 1 or activity_pds.release_date > now())";
		sql+= " ORDER BY";
		sql+= " activity_pds.create_date DESC LIMIT 10;";
        return sql;
    };
    //统计今日打卡数
    this.todayRecord = function(params) {
        sql =" SELECT count(*) as count ";
        sql+=" FROM org_user_record AS orgUserRecord ";
        sql+=" WHERE orgUserRecord.org_id = '"+params.orgId+"' ";
        sql+="  and DATE_FORMAT(update_date, '%Y-%m-%d') = curdate()";
        return sql;
    };
    //组织今日发帖
    this.orgPostCount = function(params) {
        sql =" SELECT count(*) AS count";
		sql += " FROM topic AS t ";
		sql += "WHERE t.user_id = '"+params.orgId+"' ";
		sql += "AND t.topic_type = 3 AND (";
		sql += " (t.timed_release_date is NULL AND t.create_date between DATE_ADD(CURDATE(), INTERVAL 1 MINUTE) and NOW()) ";
		sql += " OR t.timed_release_date between DATE_ADD(CURDATE(), INTERVAL 1 MINUTE) and NOW()); ";
        return sql;
    };
    //今日是否可打卡
    this.todayIsRecord = function(params) {
        sql =" SELECT `record_id` AS `recordId`, `org_id` AS `orgId`, `user_id` AS `userId`,`create_date` AS `createDate`,`update_date` AS `updateDate`";
        sql+=" FROM `org_user_record` AS `orgUserRecord` ";
        sql+=" WHERE `orgUserRecord`.`org_id` = '"+params.orgId+"' ";
        sql+=" AND `orgUserRecord`.`user_id` = '"+params.userId+"' ";
        sql+=" AND DATE_FORMAT(`orgUserRecord`.`create_date`, '%Y-%m-%d') = curdate()";
        return sql;
    };
    //韩豆后台     组织审核        韩豆后台
 	this.getUserVerifyList = function(params) {
		sql = "select u.user_id as userId,u.bean as bean,u.nick_name as nickName,uv.group_id as groupId,u.state,";
		sql += " u.user_name as userName,u.password,u.head_portrait as headPortrait,u.center_background as centerBackground,";
		sql += "u.fans_count as fansCount,uv.verifier as verifier,uv.token_state as tokenState,";
		sql += "uv.verify_state as verifyState,uv.verify_date as verifyDate,u.create_date as createDate, ";
		sql += "(select count(*) from org_user_record our where our.org_id = u.user_id and DATE_FORMAT(our.update_date,'%Y-%m-%d') = curdate()) as todayRecordCount ";
		sql += "from kp_user as u left join org_verify as uv on u.user_id = uv.user_id ";
		sql += " where u.user_type = 'org' ";
		if(params.userId != null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.delState !=null){
			if(params.delState == -2){
				sql += " and uv.verify_state is null";
			}else if (params.delState != -2 ){
				sql += " and uv.verify_state = "+params.delState+" and uv.org_type !='inner' ";
			}
		}
		if(params.verifyState != null && params.delState == null){//过滤删除掉的
			if(null == params.keyWord){
				sql+= " and uv.verify_state is null or uv.verify_state != "+ params.verifyState+" and uv.org_type !='inner'" ;
			}/*else if (null != params.keyWord){
				sql+= " and uv.verify_state is null and u.nick_name like '%"+params.keyWord+"%' or uv.verify_state != "+ params.verifyState+" and uv.org_type !='inner'" ;
			}*/
			
		}	
		if(params.postChoose != null && params.postChoose == 1 && params.keyWord !=null){
			sql += "  and u.nick_name like '%"+params.keyWord+"%'";
		}
		if(params.groupIds !=null && params.groupIds !='()'){
			sql +=" and uv.verify_state = 1 and uv.group_id in "+params.groupIds+" and uv.org_type !='inner'";
		}
		if(params.order !=null && params.order !='' && params.order == 1){
			sql +=" order by u.fans_count desc";
		}
		else if(params.order !=null && params.order !='' && params.order == 2){
			sql +=" order by u.fans_count asc";
		}
		else if (params.order ==3){
			sql +=" order by todayRecordCount desc,verify_state desc";
		}
		else if (params.order ==4){
			sql +=" order by todayRecordCount asc,verify_state asc";
		}
		else{
			sql +=" order by uv.create_date desc";
		}
		if(params.pageSize !=null && params.pageIndex !=null ){
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
		}
		return sql;
	};
	//查询组织审核的记录数
	this.getUserVerifyCount = function(params) {
		sql = "select count(*) as count "
		sql += "from kp_user as u left join org_verify as uv on u.user_id = uv.user_id ";
		sql += " where u.user_type = 'org' ";
			if(params.userId != null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.delState !=null){
			if(params.delState == -2){
				sql += " and uv.verify_state is null";
			}else if (params.delState != -2 ){
				sql += " and uv.verify_state = "+params.delState+" and uv.org_type !='inner' ";
			}
		}
		if(params.verifyState != null && params.delState == null){//过滤删除掉的
			if(null == params.keyWord){
				sql+= " and uv.verify_state is null or uv.verify_state != "+ params.verifyState+" and uv.org_type !='inner'" ;
			}/*else if (null != params.keyWord){
				sql+= " and uv.verify_state is null and u.nick_name like '%"+params.keyWord+"%' or uv.verify_state != "+ params.verifyState+" and uv.org_type !='inner'" ;
			}*/
			
		}	
		if(params.postChoose != null && params.postChoose == 1 && params.keyWord !=null){
			sql += "  and u.nick_name like '%"+params.keyWord+"%'";
		}
		if(params.groupIds !=null && params.groupIds !='()'){
			sql +=" and uv.verify_state = 1 and uv.group_id in "+params.groupIds+" and uv.org_type !='inner'";
		}
		return sql;
	};
	//查询组织每天的打卡情况        韩豆后台
	this.getUserEverydayData = function(params){
		sql = "select DATE_FORMAT(r.create_date,'%Y-%m-%d') as createDate,u.nick_name as nickName,u.user_id as userId,";
		sql +=" g.star_name as starName,u.fans_count as fansCount  ";
		/*sql +="(select count(*) from org_user_record i where DATE_FORMAT(i.create_date,'%Y-%m-%d') = createDate";
		if(params.userId !=null){
			sql +=" and org_id = '"+params.userId+"'";	
		}	
		sql +="  and i.org_id = u.user_id) as recordeCount ";*/
		sql +="from kp_user u left join org_verify ov on u.user_id = ov.user_id inner join fans_group as g on ov.group_id=g.group_id ";
		sql +=" inner join org_user_record r on u.user_id=r.org_id ";
		sql +=" where u.user_type = 'org' ";
		if(params.userId !=null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.startDate !=null && params.startDate !='' && params.endDate !=null && params.endDate != ''){
			sql +=" and r.create_date >= '"+params.startDate+"' and r.create_date <= '"+params.endDate+"'";
		}
		sql +=" group by createDate,nick_name ";
		if(params.order !='' && params.order ==1){
			sql +=" order by r.create_date desc";
		}else if (params.order !='' && params.order == 2){
			sql +=" order by r.create_date asc";
		}else{
			sql +=" order by r.create_date desc";
		}
		if(params.pageSize !=null && params.pageIndex !=null ){
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
		}
		return sql;
	};
	//查询记录数            打卡
	this.getUserRecordeCount = function(params){
		sql = "select count(distinct(DATE_FORMAT(r.create_date,'%Y-%m-%d'))) as count ";
		sql +="from kp_user u left join org_verify ov on u.user_id = ov.user_id inner join fans_group as g on ov.group_id=g.group_id ";
		sql +=" inner join org_user_record r on u.user_id=r.org_id ";
		sql +=" where u.user_type = 'org' ";
		if(params.userId !=null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.startDate !=null && params.startDate !='' && params.endDate !=null && params.endDate != ''){
			sql +=" and r.create_date >= '"+params.startDate+"' and r.create_date <= '"+params.endDate+"'";
		}
		return sql;
	};
	//统计每个组织的每日打卡数           韩豆后台
	this.getUserEverydayRecorde = function(params){
		sql = "select count(*) as recordeCount from org_user_record r ";
		sql +=" where 1=1 ";
		if(params.userId !=null){
			sql += "and r.org_id = '"+params.userId+"'";
		}
		if(params.createDate !=null){
			sql +=" and DATE_FORMAT(r.create_date,'%Y-%m-%d') = '"+params.createDate+"'";
		}
		return sql;
	};
	//统计每日用户活跃度           韩豆后台
	this.getUserTipicByActive = function(params){
		sql = "select DATE_FORMAT(t.create_date,'%Y-%m-%d') as createDate,u.nick_name as nickName,u.user_id as userId,";
		sql +=" g.star_name as starName,u.fans_count as fansCount,u.create_date as uDate ";
		sql +="from kp_user u left join org_verify ov on u.user_id = ov.user_id left join fans_group as g on ov.group_id=g.group_id ";
		sql +=" left join topic t on t.user_id=u.user_id ";
		sql +=" where u.user_type = 'org' ";
		if(params.userId !=null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.startDate !=null && params.startDate !='' && params.endDate !=null && params.endDate !=''){
			sql +=" and t.create_date >= '"+params.startDate+"' and t.create_date <= '"+params.endDate+"'";
		}
		sql +=" group by DATE_FORMAT(t.create_date,'%Y-%m-%d') ";
		if(params.order != '' && params.order == 1){
			sql +=" order by t.create_date desc";
		}else if (params.order !='' && params.order ==2){
			sql += " order by t.create_date asc";
		}else{
			sql +=" order by t.create_date desc";
		}
		if(params.pageSize !=null && params.pageIndex !=null ){
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
		}
		return sql;
	};
	//统计记录数        活跃度列表
	this.getUserTipicByActiveCount = function(params){
		sql = "select count(distinct(DATE_FORMAT(t.create_date,'%Y-%m-%d'))) as count ";
		sql +="from kp_user u left join org_verify ov on u.user_id = ov.user_id left join fans_group as g on ov.group_id=g.group_id ";
		sql +=" left join topic t on t.user_id=u.user_id ";
		sql +=" where u.user_type = 'org' ";
		if(params.userId !=null){
			sql += "and u.user_id = '"+params.userId+"'";
		}
		if(params.startDate !=null && params.startDate !='' && params.endDate !=null && params.endDate !=''){
			sql +=" and t.create_date >= '"+params.startDate+"' and t.create_date <= '"+params.endDate+"'";
		}
		return sql;
	};
	
	//统计每个组织每日的活跃度            韩豆后台
	this.getUserEverydayActive = function(params){
		sql = "select count(*) as activeCount from topic ";
		sql +="where topic_state =1 ";
		if(params.userId !=null){
			sql +=" and user_id='"+params.userId+"'";
		}
		if(params.createDate !=null){
			sql+=" and DATE_FORMAT(create_date,'%Y-%m-%d') = '"+params.createDate+"'";
		}
		return sql;
	};
	//我的组织列表，与组织加入哪些粉丝团无关，与组织分配到哪个粉丝团下有关，用org_verify关联
	this.getMyOrgList = function(params){
		sql = "SELECT";
		sql	+= " our.org_id AS orgId,";
		sql	+= " our.user_id AS userId,ku.nick_name AS nickName,";
		sql	+= " ku.head_portrait AS headPortrait,";
		sql	+= " ov.group_id AS groupId";
		sql	+= " FROM org_user_relation AS our";
		sql	+= " INNER JOIN org_verify ov ON our.org_id = ov.user_id";
		sql	+= " INNER JOIN kp_user ku ON our.org_id = ku.user_id";
		sql	+= " WHERE our.user_id = :userId";
		sql	+= " AND ov.group_id = :groupId ";
		return sql;
	};
	//昨日最活跃组织
	this.getMostActiveOrg = function(params){
		sql  = "SELECT final.org_id AS userId, ku.nick_name AS nickName, MAX(final.active) AS active, ku.user_type AS userType FROM";
		sql += "(SELECT oc.org_id AS org_id, SUM(oc.c) AS active FROM (";
		sql += "(SELECT org_id AS org_id, ROUND(COUNT(*)/100) AS c ";
		sql += "from org_user_record WHERE DATE_FORMAT(create_date,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY) GROUP BY org_id) UNION";
		sql += "(SELECT t.user_id AS org_id, COUNT(*)*3 AS c ";
		sql += "FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id ";
		sql += "WHERE t.topic_type < 2 AND ku.user_type='org' AND DATE_FORMAT(t.create_date,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY) GROUP BY org_id) UNION";
		sql += "(SELECT t.user_id AS org_id, COUNT(*) AS c ";
		sql += "FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id ";
		sql += "WHERE t.topic_type = 3 AND ku.user_type='org' AND DATE_FORMAT(t.create_date,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY) GROUP BY org_id)";
		sql += ") AS oc GROUP BY org_id ORDER BY active DESC";
		sql += ") final INNER JOIN kp_user ku ON final.org_id = ku.user_id AND ku.state = 1";
		sql += " INNER JOIN org_verify ov ON final.org_id = ov.user_id AND ov.group_id = '" + params.groupId + "';";
		return sql;
	};
	//查询用户
	this.getUserList = function(params){
		sql = "select u.user_id as userId,u.nick_name as nickName, ";
		sql +="u.user_name as userName,u.bean as bean,u.create_date as createDate, ";
		sql +="u.update_date as updateDate,u.state as state ";
		sql +=" from kp_user as u";
		sql +=" where u.user_type = '"+params.userType+"'";
		if(params.state !=null && params.stateFlag == null){
			sql +=" and u.state !="+params.state;
		}
		if(params.stateFlag !=null ){
			sql +=" and u.state ="+params.stateFlag;
		}
		if(params.startDate !=null &&params.startDate !='' && params.endDate !=null && params.endDate !=''){
			sql +=" and u.create_date >= '"+params.startDate+"' and u.create_date <= '"+params.endDate+"'";
		}
		if(params.postChoose !='' && params.postChoose == 1 && params.keyWord !=''){
			sql += "  and u.nick_name like '%"+params.keyWord+"%'";
		}
		if(params.postChoose !='' && params.postChoose == 2 && params.keyWord !=''){
			sql += "  and u.user_name like '%"+params.keyWord+"%'";
		}	
		if(params.userId){
			sql += "  and u.user_id like '%"+params.userId+"%'";
		}
		if(params.uorder == 1){
			sql += " order by u.create_date desc";
		}else if (params.uorder ==2){
			sql += " order by u.create_date asc";
		}else if (params.uorder == 3){
			sql +=" order by u.update_date desc";
		}else if (params.uorder == 4){
			sql +=" order by u.update_date asc";
		}else{
			sql +=" order by u.create_date desc";
		}
		if(params.pageSize !=null && params.pageIndex !=null ){
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
		}
		return sql;
	};
	//查询用户记录数
	this.getUserCount = function(params){
		sql = "select count(*) as count ";
		sql +=" from kp_user as u";
		sql +=" where u.user_type = '"+params.userType+"'";
		if(params.state !=null && params.stateFlag == null){
			sql +=" and u.state !="+params.state;
		}
		if(params.stateFlag !=null ){
			sql +=" and u.state ="+params.stateFlag;
		}
		if(params.startDate !=null &&params.startDate !='' && params.endDate !=null && params.endDate !=''){
			sql +=" and u.create_date >= '"+params.startDate+"' and u.create_date <= '"+params.endDate+"'";
		}
		if(params.postChoose !='' && params.postChoose == 1 && params.keyWord !=''){
			sql += "  and u.nick_name like '%"+params.keyWord+"%'";
		}
		if(params.postChoose !='' && params.postChoose == 2 && params.keyWord !=''){
			sql += "  and u.user_name like '%"+params.keyWord+"%'";
		}	
		return sql;
	};
	//组织打卡每日数
	this.getOrgRecordListAndCount = function(params){
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

	/**
	 * by Star / admin
	 * 获取邀请码
	 * @param params
	 * @returns {{rows: Function, count: Function}}
	 */
	this.getInvitationCode = function(params){
		return{
			rows: function(){
				sql  = " select ";
				sql += " 	ic.invitation_code_id as invitationCodeId, ic.user_id as userId, ";
				sql += " 	ic.nick_name as nickName, ic.phone as phone, ";
				sql += " 	ic.user_name as userName, ic.code as code, ";
				sql += " 	ic.state as state, ic.create_date as createDate, ";
				sql += "    ic.use_count as useCount ";
				sql += " from invitation_code ic ";
				sql += " where type = 1 ";
				sql += "   and 1 = 1    ";
				if(null != params.keyword && '' != params.keyword){
					if(params.choose == "nickName"){
						sql += " and ic.nick_name like '%" + params.keyword + "%'";
					} else if(params.choose == "phone"){
						sql += " and ic.phone like '%" + params.keyword + "%'";
					} else if(params.choose == "code"){
						sql += " and ic.code = " + params.keyword + "";
					} else {
						sql += " and ic.nickName like '%" + params.keyword + "%'";
					}
				}
				sql += " 	order by ic." + params.order;
				sql += " limit " + params.offset + " , " + params.limit;
				return sql;
			},
			count: function(){
				sql  = " select ";
				sql += " 	count(*) as count ";
				sql += " from invitation_code ic ";
				sql += " where type = 1  ";
				sql += "   and 1=1 		 ";
				if(null != params.keyword && '' != params.keyword){
					if(params.choose == "nickName"){
						sql += " and ic.nick_name like '%" + params.keyword + "%'";
					} else if(params.choose == "phone"){
						sql += " and ic.phone like '%" + params.keyword + "%'";
					} else if(params.choose == "code"){
						sql += " and ic.code = " + params.keyword + "";
					} else {
						sql += " and ic.nickName like '%" + params.keyword + "%'";
					}
				}
				return sql;
			}
		};
	};
	
	//查询组织每天的打卡情况   
	this.getUserEverydayCount = function(params){
		sql = "select DATE_FORMAT(r.create_date,'%Y-%m-%d') as createDate,u.nick_name as nickName,u.user_id as userId,";
		sql +=" g.star_name as starName,u.fans_count as fansCount ";
		sql +="from kp_user u inner join org_verify ov on u.user_id = ov.user_id inner join fans_group as g on ov.group_id=g.group_id ";
		sql +=" inner join org_user_record r on u.user_id=r.org_id ";
		sql +=" where u.user_type = 'org' ";
		if(params.startDate !=null && params.startDate !='' && params.endDate !=null && params.endDate != ''){
			sql +=" and r.create_date >= '"+params.startDate+"' and r.create_date <= '"+params.endDate+"'";
		}
		sql +=" group by createDate,nick_name ";
		return sql;
	};
}

module.exports = queryStr;