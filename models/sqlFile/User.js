var Constants = require('../../utils/constants');

/**
 * Created by thinkpad on 2015/8/26.
 */

var User = function () {
};

/**
 * 获得用户推送消息注册信息
 * @returns {string}
 */
User.getMessageRegisterInfo = function () {
	var sql = "SELECT push_installationId AS pushInstallationId,"
			+ " push_deviceToken AS pushDeviceToken, push_objectId AS pushObjectId,"
			+ " push_channels AS pushChannels, platform_type AS platformType, nick_name AS nickName,"
			+ " user_type AS userType "
			+ " FROM kp_user WHERE user_id=:userId";
	return sql;
};

/**
 * 组织打卡记录
 */
User.getOrgRecordAllList = function(params){
	var sql = "SELECT u.user_id AS userId,u.nick_name AS nickName,u.user_name AS userName,o.create_date AS createDate,";
	sql +=" (SELECT nick_name FROM kp_user ku WHERE ku.user_id = o.org_id) AS orgName,o.record_id AS recordId ";
	sql +=" FROM kp_user u,org_user_record o WHERE u.user_id = o.user_id AND u.state =1 ";
	if(params.startDate !=null && params.endDate != null){
		sql +=" AND o.create_date >= '"+params.startDate+"' AND o.create_date <= '"+params.endDate+"'";
	}
	if(params.postChoose !=null && params.keyWord !=null){
		if(params.postChoose == 1){
			sql += " AND u.nick_name like '%"+params.keyWord+"%'";
		}else if (params.postChoose ==2){
			sql += " AND u.user_name like '%"+params.keyWord+"%'";
		}
	}
	if(params.userIds != null && params.userIds != '()'){
		sql +=" AND o.org_id in "+params.userIds+"";
	}
	if(params.order ==1){
		sql +=" order by o.create_date desc ";
	}else if (params.order ==2){
		sql +=" order by o.create_date asc ";
	}else{
		sql +=" order by o.create_date desc ";
	}
	sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
	return sql;
};
User.getOrgRecordAllListCount = function(params){
	var sql = "SELECT count(*) count ";
	sql +=" FROM kp_user u,org_user_record o WHERE u.user_id = o.user_id AND u.state =1 ";
	if(params.startDate !=null && params.endDate != null){
		sql +=" AND o.create_date >= '"+params.startDate+"' AND o.create_date <= '"+params.endDate+"'";
	}
	if(params.postChoose !=null && params.keyWord !=null){
		if(params.postChoose == 1){
			sql += " AND u.nick_name like '%"+params.keyWord+"%'";
		}else if (params.postChoose ==2){
			sql += " AND u.user_name like '%"+params.keyWord+"%'";
		}
	}
	if(params.userIds != null && params.userIds != '()'){
		sql +=" AND o.org_id in "+params.userIds+"";
	}
	return sql;
};
//专辑券兑换列表
User.getExchangeList = function(params){
	return{
		rows:function(){
			var sql = "SELECT u.user_id AS userId,u.user_name AS userName,u.nick_name AS nickName,e.exchange_info AS exchangeInfo,";
			sql +=" e.exchange_type AS exchangeType,e.create_date AS createDate,e.is_finish AS isFinish,e.exchange_no AS exchangeNo";
			sql +=" FROM kp_user u INNER JOIN kp_user_exchange_center e on u.user_id = e.user_id ";
			sql +=" WHERE u.user_type='user'";
			if(params.isFinish !=null){
				sql+=" AND e.is_finish != "+params.isFinish;
			}
			if(params.startDate !=null && params.endDate !=null){
				sql +=" AND e.create_date >= '"+params.startDate+"' AND e.create_date <= '"+params.endDate+"'";
			}
			if(params.keyWord !=null ){
				if(params.postChoose == 1){
					sql += " AND u.nick_name like '%"+params.keyWord+"%' ";
				}else if (params.postChoose ==2){
					sql += " AND u.user_name like '%"+params.keyWord+"%' ";
				}else if (params.postChoose ==3){
					sql += " AND e.exchange_type like '%"+params.keyWord+"%' ";
				}
			}
			if(params.state !='' && null != params.state){
				sql+=" AND e.is_finish = "+params.state;
			}
			if(params.order != null){
				if(params.order ==1){
					sql +=" order by e.create_date desc";
				}else if (params.order ==2){
					sql +=" order by e.create_date asc";
				}
			}
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;
		},
		count:function(){
			var sql = "SELECT count(*) AS count ";
			sql +=" FROM kp_user u INNER JOIN kp_user_exchange_center e on u.user_id = e.user_id ";
			sql +=" WHERE u.user_type='user'";
			if(params.isFinish !=null){
				sql+=" AND e.is_finish != "+params.isFinish;
			}
			if(params.startDate !=null && params.endDate !=null){
				sql +=" AND e.create_date >= '"+params.startDate+"' AND e.create_date <= '"+params.endDate+"'";
			}
			if(params.keyWord !=null ){
				if(params.postChoose == 1){
					sql += " AND u.nick_name like '%"+params.keyWord+"%' ";
				}else if (params.postChoose ==2){
					sql += " AND u.user_name like '%"+params.keyWord+"%' ";
				}else if (params.postChoose ==3){
					sql += " AND e.exchange_type like '%"+params.keyWord+"%' ";
				}
			}
			if(params.state !='' && null != params.state){
				sql+=" AND e.is_finish = "+params.state;
			}
			return sql;
		}
	};
};
//用户签到情况
User.getUserSignList = function(params){
	return{
		rows:function(){
			var sql = "SELECT u.user_id AS userId,u.nick_name AS nickName,u.user_name AS userName,";
			 	sql +=" max(b.create_date) AS lastDate,";
			 	sql +=" (SELECT max(br.create_date) FROM bean_relation br WHERE br.user_id=b.user_id AND br.bean_type=3007 AND br.create_date not in";
			 	sql +=" (max(b.create_date))) AS topDate ";
			 	sql +=" FROM kp_user u,bean_relation b WHERE u.user_id=b.user_id AND b.bean_type=3007 AND u.user_type='user' ";
			 	if(params.startDate !=null && params.endDate !=null){
			 		sql +=" AND b.create_date >= '"+params.startDate+"' AND b.create_date <= '"+params.endDate+"'";
			 	}
			 	if(params.keyWord !=null && params.keyWord !=''){
			 		if(params.postChoose == 1){
			 			sql += " AND u.nick_name like '%"+params.keyWord+"%' ";
			 		}else if(params.postChoose == 2){
			 			sql += " AND u.user_name like '%"+params.keyWord+"%' ";
			 		}
			 	}
			 	sql +=" GROUP BY u.user_id ";
			 	sql +=" order by lastDate desc";
			 	sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			 return sql;	
		},
		count:function(){
			var sql = "SELECT count(DISTINCT(u.user_id)) AS count ";
			 	sql +=" FROM kp_user u,bean_relation b WHERE u.user_id=b.user_id AND b.bean_type=3007 ";
			 		if(params.startDate !=null && params.endDate !=null){
			 		sql +=" AND b.create_date >= '"+params.startDate+"' AND b.create_date <= '"+params.endDate+"'";
			 	}
			 	if(params.keyWord !=null && params.keyWord !=''){
			 		if(params.postChoose == 1){
			 			sql += " AND u.nick_name like '%"+params.keyWord+"%' ";
			 		}else if(params.postChoose == 2){
			 			sql += " AND u.user_name like '%"+params.keyWord+"%' ";
			 		}
			 	}
			 return sql;	
		}
	};
};
//签到记录
User.getUserSignRecordList = function(params){
	return{
		rows:function(){
			var sql = "SELECT b.bean_date AS beanDate,count(bean_date) signCount,b.user_id,(SELECT dayofweek(b.bean_date)-1) ";
				sql +=" AS weekday,b.user_id,(SELECT subdate(beanDate,date_format(beanDate,'%w')+(7-weekday))) AS topWeekDate,";
				sql +=" (SELECT count(*) FROM bean_relation WHERE bean_date =topWeekDate AND bean_type=3007) AS topWeekCount,";
				sql +=" (SELECT subdate(beanDate,date_format(beanDate,'%w')+((";
				sql +=" SELECT DAYOFMONTH(last_day((SELECT date_sub(date_sub(date_format(now(),'%y-%m-%d'),interval extract(";
				sql +=" day FROM now()) day),interval 0 month) AS date ))))-weekday))) AS topMonthDate,";
				sql +=" (SELECT count(*) FROM bean_relation WHERE bean_date =topMonthDate AND bean_type=3007) AS topMonthCount ";
				sql +=" FROM bean_relation b WHERE b.bean_type=3007 ";
			if(params.startDate !=null && params.endDate !=null){
				sql +=" AND b.bean_date >= '"+params.startDate+"' AND b.bean_date <= '"+params.endDate+"'";
			}
			sql +=" GROUP BY b.bean_date";
			if(params.weekday !='' && params.weekday !=null){
				sql +=" having weekday = "+params.weekday;
			}
			sql +=" order by beanDate desc";
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";	
			return sql;
		},
		count:function(){
			var sql = "SELECT DISTINCT(b.bean_date) AS beanDate,count(bean_date) signCount,(SELECT dayofweek(b.bean_date)-1) AS weekday";
				sql +=" ,b.user_id FROM bean_relation b WHERE b.bean_type=3007 ";
			if(params.startDate !=null && params.endDate !=null){
				sql +=" AND b.bean_date >= '"+params.startDate+"' AND b.bean_date <= '"+params.endDate+"'";
			}
			sql +=" GROUP BY b.bean_date";
			if(params.weekday !='' && params.weekday !=null){
				sql +=" having weekday = "+params.weekday;
			}
			return sql;
		}
	};
};
//豆币加倍列表
User.getBeanDoubleList = function(params){
	return{
		rows:function(){
			var sql = " SELECT bean_double_id AS beanDoubleId,bean_double_state AS beanDoubleState,";
				sql +=" type,bean_star_time AS beanStarTime,bean_end_time AS beanEndTime,bean_multiple AS beanMultiple,";
				sql +=" create_date AS createDate,update_date AS updateDate";
				sql +=" FROM bean_double WHERE 1=1";
				if(params.startDate !='' && params.endDate != ''){
					if(params.postChoose == 1){
						sql +=" AND bean_star_time >= '"+params.startDate+"' && bean_star_time <= '"+params.endDate+"'";
					}else if(params.postChoose ==2){
						sql +=" AND bean_end_time >= '"+params.startDate+"' && bean_end_time <= '"+params.endDate+"'"
					}
				}
				if(params.beanMultiple !=null && params.beanMultiple !=''){
					sql +=" AND bean_multiple = "+params.beanMultiple;
				}
				if(params.state !=null && params.state !=''){
					if(params.state == -1){
						sql +=" AND bean_star_time > now()";
					}else if (params.state == 0){
						sql +=" AND bean_end_time < now()";
					}else if (params.state == 1){
						sql +=" AND bean_star_time <= now() AND bean_end_time >= now()";
					}
				}
				sql +=" order by create_date desc";
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";	
			return sql;
		},
		count:function(){
			var sql =" SELECT count(*) AS count FROM bean_double WHERE 1=1";
			if(params.startDate !='' && params.endDate != ''){
				if(params.postChoose == 1){
					sql +=" AND bean_star_time >= '"+params.startDate+"' && bean_star_time <= '"+params.endDate+"'";
				}else if(params.postChoose ==2){
					sql +=" AND bean_end_time >= '"+params.startDate+"' && bean_end_time <= '"+params.endDate+"'"
				}
			}
			if(params.beanMultiple !=null && params.beanMultiple !=''){
				sql +=" AND bean_multiple = "+params.beanMultiple;
			}
			if(params.state !=null && params.state !=''){
				if(params.state == -1){
					sql +=" AND bean_star_time > now()";
				}else if (params.state == 0){
					sql +=" AND bean_end_time < now()";
				}else if (params.state == 1){
					sql +=" AND bean_star_time <= now() AND bean_end_time >= now()";
				}
			}
			return sql;
		}
	};
};
/**
 * 组织粉丝数加1，减1
 * @param params
 * @returns {{inc: Function, dec: Function}}
 */
User.updateOrgFansCount = function (params) {
	return "UPDATE kp_user SET fans_count = fans_count + ("+ params.action+") WHERE user_id = :orgId";
};

/**
 * 外部组织登录 既要是组织也要是外部的组织才能登录
 */
User.getOuterOrgLogin = function(params){
	var sql ="select u.user_id as userId,u.user_name as userName,u.nick_name as nickName,u.password,u.head_portrait as headPortrait,";
		sql +="u.state,o.verify_state as verifyState,o.token_state as tokenState,u.org_token as orgId ";
		sql +=" from kp_user u,org_verify o where u.user_id=o.user_id and org_type='outer' and user_type='org'";
		sql +=" and u.nick_name = '"+params.nickName+"'";
	return sql;	
};	

/**
 * 打卡礼品列表
 */
User.getRecordGiftList = function(params){
	return{
		rows:function(){
			var sql = "SELECT u.user_id AS userId,u.user_name AS userName,u.nick_name AS nickName,";
				sql +=" rg.create_date AS createDate,rg.exchange_date AS exchangeDate,rg.state,rg.id,";
				sql +=" t.ticket_name AS ticketName,t.par_value AS parValue,ticket_type AS ticketType,";
				sql +=" t.is_substance AS isSubstance,t.ticket_id AS ticketId,u.software_version as softwareVersion ";
				sql +=" FROM kp_user u INNER JOIN kp_record_gift rg on u.user_id = rg.user_id ";
				sql +=" INNER JOIN ticket t on rg.ticket_id = t.ticket_id WHERE u.user_type='user' ";
				if(params.keyWord !=null && params.keyWord !=''){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==2){
						sql +=" AND u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.isSubstance !='' && params.isSubstance !=null){
					sql +=" AND t.is_substance = "+params.isSubstance;
				}
				if(params.state !=null && params.state !=''){
					sql +=" AND rg.state = "+params.state;
				}
				if(params.order == 1){
					 sql +=" order by IFNULL(rg.exchange_date, rg.create_date) desc ";
				}else if(params.order ==2){
					 sql +=" order by IFNULL(rg.exchange_date, rg.create_date) asc ";
				}else{
					 sql +=" order by IFNULL(rg.exchange_date, rg.create_date) desc ";
				}
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
				return sql;
		},
		count:function(){
			var sql = "SELECT count(*) AS count ";
				sql +=" FROM kp_user u INNER JOIN kp_record_gift rg on u.user_id = rg.user_id ";
				sql +=" INNER JOIN ticket t on rg.ticket_id = t.ticket_id WHERE u.user_type='user'";
				if(params.keyWord !=null && params.keyWord !=''){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==2){
						sql +=" AND u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.isSubstance !='' && params.isSubstance !=null){
					sql +=" AND t.is_substance = "+params.isSubstance;
				}
				if(params.state !=null && params.state !=''){
					sql +=" AND rg.state = "+params.state;
				}
				return sql;
			}
	};
};
/**
 * 组织兑换金钱记录
 */
User.getOrgExchangeMoneyList = function(params){
	return{
		rows:function(){
			var sql = "SELECT u.user_id AS userId,u.nick_name AS nickName,oe.money,oe.bean,";
				sql +=" oe.alipay,oe.state,oe.update_date AS updateDate,oe.create_date AS createDate,oe.id";
				sql +=" FROM kp_user u INNER JOIN kp_org_exchange_money AS oe on u.user_id = oe.org_id WHERE u.user_type='org'";
				if(params.keyWord != null){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose ==2){
						sql +=" AND oe.money = "+params.keyWord;
					}
				}
				if(params.state != null && params.state != ''){
					sql +=" AND oe.state = "+params.state;
				}
				if(params.order == 1){
					sql +=" order by ifnull(oe.update_date,oe.create_date) desc";
				}else if(params.order ==2){
					sql +=" order by ifnull(oe.update_date,oe.create_date) asc";
				}else{
					sql +=" order by ifnull(oe.update_date,oe.create_date) desc";
				}
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;
		},
		count:function(){
			var sql = "SELECT count(*) AS count ";
				sql +=" FROM kp_user u INNER JOIN kp_org_exchange_money AS oe on u.user_id = oe.org_id WHERE u.user_type='org'";
				if(params.keyWord != null){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose ==2){
						sql +=" AND oe.money = "+params.keyWord;
					}
				}
				if(params.state != null && params.state != ''){
					sql +=" AND oe.state = "+params.state;
				}
			return sql;
		}
	};
};

/**
 * 修改豆币
 */
User.updateUserBean = function(params){
	var sql = "update kp_user set bean = bean+("+params.beanValue+") WHERE user_id = '"+params.userId+"'";
	return sql;
};
/**
 * by hp
 * 修改邀请码使用次数
 */
User.updateCodeUserCount = function(params){
	return "update invitation_code set use_count = use_count + 1 WHERE code = '"+params.code+"';";
};
/**
 * 查询组织审核
 */
User.getUserOrgInfo = function(params){
	var sql = "SELECT u.user_id AS userId,u.password,u.nick_name AS nickName,u.user_name AS userName,";
		sql +=" u.head_portrait AS headPortrait,u.center_background AS centerBackground,o.group_id AS groupId";
		sql +=" FROM kp_user AS u INNER JOIN org_verify AS o on o.user_id = u.user_id WHERE 1=1 ";
		if(params.userId != null){
			sql +=" AND u.user_id = '"+params.userId+"'";
		}
	return sql;
};

/**
 * 内部组织列表
 */
User.getInnerOrgList = function(params){
	return{
		rows:function(){
			var sql = "SELECT u.user_id AS userId,u.user_name AS userName,u.nick_name AS nickName,u.password,";
				sql +=" u.fans_count AS fansCount,u.state,u.create_date AS createDate,u.update_date AS updateDate,";
				sql +=" g.group_id AS groupId,g.star_name AS starName,o.group_id AS groupId,";
				sql +=" (SELECT count(*) FROM org_user_record our WHERE our.org_id = u.user_id AND DATE_FORMAT(our.update_date,'%Y-%m-%d') = curdate()) AS todayRecordCount";
				sql +=" FROM kp_user u INNER JOIN org_verify o on u.user_id = o.user_id INNER JOIN fans_group g ";
				sql +=" on o.group_id = g.group_id WHERE o.org_type = 'inner' ";
				if(params.keyWord !=null){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose == 2){
						sql +=" AND g.star_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose == 3){
						sql +=" AND u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.state !=null && params.state !=''){
					sql +=" AND u.state = "+params.state;
				}else{
					sql +=" AND u.state != -1";
				}
				if(params.order ==1){
					sql += " order by fans_count desc";
				}else if(params.order ==2){
					sql += " order by fans_count asc";
				}else if(params.order ==3){
					sql += " order by todayRecordCount desc";
				}else if(params.order ==4){
					sql += " order by todayRecordCount asc";
				}else{
					sql += " order by fans_count desc";
				}
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;
		},
		count:function(){
			var sql = "SELECT count(*) AS count ";
				sql +=" FROM kp_user u INNER JOIN org_verify o on u.user_id = o.user_id INNER JOIN fans_group g ";
				sql +=" on o.group_id = g.group_id WHERE o.org_type = 'inner'";
				if(params.keyWord !=null){
					if(params.postChoose == 1){
						sql +=" AND u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose == 2){
						sql +=" AND g.star_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose == 3){
						sql +=" AND u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.state !=null && params.state !=''){
					sql +=" AND u.state = "+params.state;
				}else{
					sql +=" AND u.state != -1";
				}
			return sql;
		}
	};
};

/**
 * 获取所有的激活组织列表
 * @param {Object} params
 */
User.getActivateOrgList = function(params){
	var sql = " SELECT ";
		sql += " ku.user_id AS userId, ku.nick_name AS nickName ";
		sql += " FROM kp_user ku, org_verify ov ";
		sql += " WHERE ku.user_id = ov.user_id ";
		sql += " AND ku.state = " + Constants.STATE.ACTIVE;
		sql += " AND ku.user_type = 'org'";
		sql += " AND ov.verify_state = " + Constants.STATE.ACTIVE;
		sql += " order by ku.create_date desc ";
	return sql;
};

/**
 * in手机号码匹配查询多个
 * (个人)用户信息(适合少量数据查询)
 * @param {Object} params
 */
User.getUserByPhones = function(params){
	var phones = params.phone;
	var phonelist = phones.split(',');
	var sql = " SELECT ";
		sql += " 	user_id AS userId, user_name AS userName ";
		sql += " FROM kp_user WHERE user_type = 'user' ";
		sql += " AND user_name in ( ";
		for(var i = 0; i < phonelist.length; i++){
			// 最后一条不需要逗号
			if(i == phonelist.length-1){
				sql += "'" + phonelist[i] + "'";
			} else {
				sql += "'" + phonelist[i] + "',";
			}
		}
		sql += " )";
	return sql;
};
//获取组织token号
User.getOrgToken = function(){
	var sql = "select v.*,u.org_token as uid from kp_user u,org_verify v where u.user_id = v.user_id and v.org_type='outer' and token_state=1 AND v.verify_state = 1 and access_token is not null";
	return sql;
};


//获取用户错误日志
User.getUserLog = function(params){
	return{
		rows:function(){
			var sql ="select g.lid,g.log,g.create_date as createDate,u.user_name as userName,u.nick_name as nickName, ";
				sql +="g.mobile_type as mobileType,g.platform_type as platformType,g.software_version as softwareVersion,g.os_version as osVersion "
				sql +="from kp_log g INNER JOIN kp_user u on g.user_id = u.user_id where 1=1";
				if(params.keyWord){
					if(params.postChoose ==1){
						sql +=" and u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose ==2){
						sql +=" and u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.startDate != null && params.endDate !=null){
					sql +=" and g.create_date >= '"+params.startDate+"' and g.create_date <= '"+params.endDate+"'";
				}
				sql +=" order by g.create_date desc ";
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;
		},
		count:function(){
			var sql ="select count(*) as count ";
				sql +="from kp_log g INNER JOIN kp_user u on g.user_id = u.user_id where 1=1";
				if(params.keyWord){
					if(params.postChoose ==1){
						sql +=" and u.nick_name like '%"+params.keyWord+"%'";
					}else if(params.postChoose ==2){
						sql +=" and u.user_name like '%"+params.keyWord+"%'";
					}
				}
				if(params.startDate != null && params.endDate !=null){
					sql +=" and g.create_date >= '"+params.startDate+"' and g.create_date <= '"+params.endDate+"'";
				}
			return sql;
		}
	};
};
/**
 * 用户个人中心，我的组织
 * @param {Object} params
 */
User.getUserByOrg = function(params){
	var sql = "SELECT (SELECT create_date FROM topic WHERE user_id = ku.user_id AND topic_state = 1 ORDER BY create_date desc LIMIT 1) AS lastDate,our.create_date as createDate,";
		sql +="ku.user_id as userId,ku.nick_name as nickName,ku.head_portrait as headPortrait,ku.fans_count as fansCount";
		sql +=" FROM kp_user u,org_user_relation our,kp_user ku";
		sql +=" WHERE u.user_id = our.user_id AND u.user_id = '"+params.userId+"' AND ku.user_id = our.org_id";
		if(params.direction == Constants.DIRECTION.LOADMORE){
			sql += " and our.create_date < '" + params.lastDate + "'";	// 加载
		}
		sql +=" ORDER BY our.create_date desc";
		if(params.pageSize) {
			sql += " limit " + params.pageSize;
		}
		return sql;
};
module.exports = User;
