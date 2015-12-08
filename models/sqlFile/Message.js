var Constants = require('../../utils/constants');

function message(){
	var sql = "";
	// 推送列表
	this.pushList = function(params){
		return {
			count: function(){
				sql  = " SELECT ";
				sql += " COUNT(*) as count";
				sql += " FROM kp_message";
				sql += " WHERE chat_type = 1";
				if(null != params.ConditionText && '' != params.ConditionText){
					sql += " AND message_text like '%" + params.ConditionText +"%'";
				}
				if(null != params.ConditionId && '' != params.ConditionId){
					sql += " AND push_goal = '" + params.ConditionId + "'";
				}
				return sql;
			},
			rows: function(){
				sql  = " SELECT";
				sql += " message_id as messageId, message_text as messageText, ";
				sql += " send_user_id as sendUserId, recive_user_id as reciveUserId, ";
				sql += " topic_id as topicId, push_goal as pushGoal, ";
				sql += " chat_type as chatType, offical_type as officalType, ";
				sql += " release_date as releaseDate, create_date as createDate, ";
				sql += " update_date as updateDate ";
				sql += " FROM kp_message ";
				sql += " WHERE chat_type = 1 ";
				if(null != params.ConditionText && '' != params.ConditionText){
					sql += " AND message_text like '%" + params.ConditionText +"%'";
				}
				if(null != params.ConditionId && '' != params.ConditionId){
					sql += " AND push_goal = '" + params.ConditionId + "'";
				}
				sql += " ORDER BY " + params.order;
				sql += " limit " + params.offset + " , " + params.limit;
				return sql;
			}
		};
	};
	
	// 常见问题
	this.commonQuestion = function(params){
		return {
			rows: function(){
				sql  = " SELECT";
				sql += " ks1.secretary_id as secretaryId, ks1.content as question,";
				sql += " ks2.content as answer, ks1.create_date as createDate,";
				sql += " ks2.secretary_id as answerId, ks1.type as type";
				sql += " from kp_secretary ks1, kp_secretary ks2";
				sql += " where ks1.secretary_id = ks2.answer_for";
				sql += "   AND ks1.type = '" + params.type +"'";
				if(null != params.ConditionText && '' != params.ConditionText){
					if(params.ConditionId == "question"){
						sql += " AND ks1.content like '%" + params.ConditionText + "%'";
					} else if(params.ConditionId == "answer"){
						sql += " AND ks2.content like '%" + params.ConditionText + "%'";
					} else {
						sql += " AND ks1.content like '%" + params.ConditionText + "%'";
					}
				}
				sql += " order by ks1." + params.order;
				sql += " limit " + params.offset + " , " + params.limit;
				return sql;
			},
			count: function(){
				sql  = " SELECT";
				sql += " count(*) as count";
				sql += " from kp_secretary ks1, kp_secretary ks2";
				sql += " where ks1.secretary_id = ks2.answer_for";
				sql += "   AND ks1.type = '" + params.type + "'";
				if(null != params.ConditionText && '' != params.ConditionText){
					if(params.ConditionId == "question"){
						sql += " AND ks1.content like '%" + params.ConditionText + "%'";
					} else if(params.ConditionId == "answer"){
						sql += " AND ks2.content like '%" + params.ConditionText + "%'";
					} else {
						sql += " AND ks1.content like '%" + params.ConditionText + "%'";
					}
				}
				return sql;
			}
		};
	};
	
	// 根据ID获取常见问题
	this.commonQuestionById = function(params){
		sql  = " SELECT";
		sql += " ks1.secretary_id as secretaryId, ks1.content as question,";
		sql += " ks2.content as answer, ks1.create_date as createDate,";
		sql += " ks2.secretary_id as answerId";
		sql += " from kp_secretary ks1, kp_secretary ks2";
		sql += " where ks1.secretary_id = ks2.answer_for";
		sql += " AND ks1.secretary_id = " + params.secretaryId;
		return sql;
	};

	// 用户提问集合
	this.userQuestionRows = function(params){
		sql  = " SELECT";
		sql += " ks.secretary_id as secretaryId, ks.content as content,";
		sql += " ku.nick_name as nickName, ku.user_name as userName,";
		sql += " ks.create_date as createDate, ks.user_id as userId,";
		sql += " ks.state as isAnswer,ku.head_portrait as headPortrait ";
		sql += " from kp_secretary ks INNER JOIN kp_user ku";
		sql += " ON ks.user_id = ku.user_id";
		sql += " INNER JOIN (SELECT MAX(kss.secretary_id) AS secretary_id FROM kp_secretary kss GROUP BY kss.user_id ORDER BY kss.secretary_id DESC) kse ";
		sql += " ON ks.secretary_id = kse.secretary_id ";
		sql += " WHERE 1=1 ";
		sql += " AND ks.user_id is not null";
		// sql += " AND ks.type = '" + params.type + "'";
		// 搜索框条件
		if(null != params.ConditionText && '' != params.ConditionText){
			sql += " AND ks.content like '%" + params.ConditionText + "%'";
		}
		// 状态搜索条件
		if(null != params.isAnswer && '' != params.isAnswer){
			sql += " AND ks.state = " + params.isAnswer;
		}
		// sql += " group by ks.user_id";
		sql += " order by ks." + params.order;
		sql += " limit " + params.offset + " , " + params.limit;
		return sql;
	};
	
	// 用户提问总数
	this.userQuestionCount = function(params){
		sql  = " select count(*) as totalCount from";
		sql += " (SELECT ks.secretary_id";
		sql += " from kp_secretary ks INNER JOIN kp_user ku";
		sql += " ON ks.user_id = ku.user_id";
		sql += " INNER JOIN (SELECT MAX(kss.secretary_id) AS secretary_id FROM kp_secretary kss GROUP BY kss.user_id ORDER BY kss.secretary_id DESC) kse ";
		sql += " ON ks.secretary_id = kse.secretary_id ";
		sql += " WHERE 1=1 ";
		sql += " AND ks.user_id is not null";
		// sql += " AND ks.type = '" + params.type + "'";
		// 搜索框条件
		if(null != params.ConditionText && '' != params.ConditionText){
			sql += " AND ks.content like '%" + params.ConditionText + "%'";
		}
		// 状态搜索条件
		if(null != params.isAnswer && '' != params.isAnswer){
			sql += " AND ks.state = " + params.isAnswer;
		}
		sql += ") as T";
		// sql += " group by ks.user_id) as T";
		return sql;
	};

	// 获取该用户最近的一条提问
	this.findOneQuestion = function(params){
		sql  = " SELECT";
		sql += " ks.secretary_id as secretaryId, ks.content as content,";
		sql += " ks.type as type, ks.answer_user_id as answerUserId,";
		sql += " ks.answer_for as answerFor, ks.state as isAnswer, ks.create_date as createDate";
		sql += " from kp_secretary ks";
		sql += " where ks.user_id = '" + params.userId + "'";
		sql += " AND ks.type = '" + params.type + "'";
		sql += " order by ks.create_date desc limit 1";
		return sql;
	};

	// 用户提问和回答
	this.userQuestionAndAnswer = function(params){
		sql  = " SELECT";
		sql += " ks.secretary_id as secretaryId, ks.content as content,";
		sql += " ks.type as type, ks.answer_user_id as answerUserId,";
		sql += " ks.answer_for as answerFor, ks.create_date as createDate";
		sql += " from kp_secretary ks";
		sql += " where ks.user_id = '" + params.userId + "'";
		sql += " order by ks.create_date asc";
		return sql;
	};

}

module.exports = message;
