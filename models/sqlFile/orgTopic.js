/**
 * Created by admin on 2015/4/24.
 */
function orgTopic() {
    var sql = "";
    /**
	 * 20150819
	 *根据组织编号查询帖子
	 */
	this.getOrgTopic = function(params){
		var sql = "select t.topic_id as topicId,t.topic_number as topicNumber,t.topic_name as topicName,";
		    sql +="t.topic_state as topicState,t.is_recommend as isRecommend,t.like_count as likeCount,";
		    sql +="t.create_date as createDate,t.timed_release_date as timedReleaseDate,t.update_date as updateDate, ";
		    sql +="(select count(*) from kp_message m where m.topic_id = t.topic_id) as pushCount ";
		    sql +="from topic as t ";
		    sql +="where user_id = '"+params.userId+"'";
		    sql +=" and topic_type ="+params.topicType;
		    if(params.topicState != null && params.stateFlag == null){
				sql+= " and t.topic_state != " + params.topicState;
			}
		    if(params.stateFlag !=null){
		    	if(params.stateFlag != 1 && params.stateFlag !=2){//未发布和已删除
		    		sql +=" and t.topic_state = "+params.stateFlag;
		    	}else if (params.stateFlag == 1){//已发布
		    		sql +=" and ((t.topic_state = 1 and t.timed_release_date is null) or (t.topic_state=1 and t.timed_release_date<=now()))";
		    	}else if (params.stateFlag == 2){//定时发布
		    		sql +=" and t.topic_state =1 and t.timed_release_date > now() ";
		    	}
		    }
		    if(params.postChoose !=null && params.keyWord != ''){
		    	if(params.postChoose == 1){
		    		sql += " and t.topic_name like '%"+params.keyWord+"%'";
		    	}else if (params.postChoose == 2){
		    		sql += " and t.topic_number ="+params.keyWord;
		    	}
		    }
		    if(params.isRecommend !=null && params.isRecommend == 1){
		    	sql+= " and t.is_recommend = 1 ";
		    }
		    if(params.startDate !='' &&params.startDate != null && params.endDate !='' && params.endDate !=null){
		    	sql+= " and t.create_date >= '"+params.startDate+"' and t.create_date <= '"+params.endDate+"'";
		    }
		    if(params.order == 1){
		    	sql+= " order by like_count desc";
		    }
		    else if(params.order == 2){
		    	sql+= " order by like_count asc";
		    }
		    else if (params.order == 3){
		    	sql +=" order by pushCount desc";
		    }
		    else if (params.order == 4){
		    	sql +=" order by pushCount asc";
		    }
		    else if(params.order == 5){
		    	sql+= " order by create_date desc";
		    }
		    else if(params.order == 6){
		    	sql+= " order by create_date asc";
		    }
		    else if(params.order == 7){
		    	sql+= " order by ifnull(timed_release_date,update_date) desc";
		    }
		    else if(params.order == 8){
		    	sql+= " order by ifnull(timed_release_date,update_date) asc";
		    }else{
		    	sql +=" order by t.create_date desc";
		    }
		    if(params.pageSize !=null && params.pageIndex !=null ){
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			}
		    
		return sql;
	};

	/**
	 * 统计记录数
	 */
	this.getOrgTopicCount = function(params){
		var sql = "select count(*) as count ";
		    sql +="from topic as t ";
		      sql +="where user_id = '"+params.userId+"'";
		    sql +=" and topic_type ="+params.topicType;
		    if(params.topicState != null && params.stateFlag == null){
				sql+= " and t.topic_state != " + params.topicState;
			}
		    if(params.stateFlag !=null){
		    	if(params.stateFlag != 1 && params.stateFlag !=2){//未发布和已删除
		    		sql +=" and t.topic_state = "+params.stateFlag;
		    	}else if (params.stateFlag == 1){//已发布
		    		sql +=" and ((t.topic_state = 1 and t.timed_release_date is null) or (t.topic_state=1 and t.timed_release_date<=now()))";
		    	}else if (params.stateFlag == 2){//定时发布
		    		sql +=" and t.topic_state =1 and t.timed_release_date > now() ";
		    	}
		    }
		    if(params.postChoose !=null && params.keyWord != ''){
		    	if(params.postChoose == 1){
		    		sql += " and t.topic_name like '%"+params.keyWord+"%'";
		    	}else if (params.postChoose == 2){
		    		sql += " and t.topic_number ="+params.keyWord;
		    	}
		    }
		    if(params.isRecommend !=null && params.isRecommend == 1){
		    	sql+= " and t.is_recommend = 1 ";
		    }
		    if(params.startDate !='' &&params.startDate != null && params.endDate !='' && params.endDate !=null){
		    	sql+= " and t.create_date >= '"+params.startDate+"' and t.create_date <= '"+params.endDate+"'";
		    }
			return sql;
	};
	
	/**
	 * 广告列表
	 */
	this.getAdverList = function(params){
		var sql = "select a.adver_id as adverId,a.adver_title as adverTitle,a.group_id as groupId,";
			sql +="a.adver_pic as adverPic,a.link_type as linkType,a.link_value as linkValue,";
			sql +="a.like_count as likeCount,a.state as state,a.create_date as createDate,";
			sql +='a.update_date as updateDate,a.release_date as releaseDate,f.star_name as starName';
			sql +=" from adver a left join fans_group as f on a.group_id = f.group_id";
			sql +=" where 1=1 ";
			if(params.state !=null && params.stateFlag == null){
				sql +=" and a.state !="+params.state;
			}
			if(params.stateFlag != null){
				if(params.stateFlag !=2 && params.stateFlag !=1){//已删除和未发布
					sql +=" and a.state ="+params.stateFlag;
				}else if (params.stateFlag == 1){//已发布
					sql +=" and ((a.state = 1 and a.release_date is null) or (a.state=1 and a.release_date<=now()))";
				}else if (params.stateFlag == 2){
					sql +=" and a.state=1 and a.release_date>now() ";
				}
			}
			if(params.keyWord !=null){
				if(params.postChoose == 1){
					sql += " and a.adver_title like '%"+params.keyWord+"%'";
				}else if (params.postChoose == 2 && params.keyWord == '全局'){
					sql += " and a.group_id is null ";
				}
			}
			if(params.groupIds !=null && params.groupIds != '()'){
				sql +=" and a.group_id in "+params.groupIds+"";
			}
			if(params.order ==1){
				sql +=" order by a.like_count desc";
			}else if (params.order ==2){
				sql +=" order by a.like_count asc";
			}else if (params.order ==3){
				sql +=" order by a.create_date desc";
			}else if (params.order ==4){
				sql +=" order by a.create_date asc";
			}else if (params.order ==5){
				sql+= " order by ifnull(a.release_date,a.update_date) desc";
			}else if (params.order ==6){
				sql+= " order by ifnull(a.release_date,a.update_date) asc";
			}else{
				sql +=" order by a.create_date desc ";
			}
			if(params.pageSize !=null && params.pageIndex !=null ){
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			}
		return sql;	
	};
	//查询广告记录数
	this.getAdverCount = function(params){
		var sql = "select count(*) as count ";
			sql +=" from adver a left join fans_group as f on a.group_id = f.group_id";
			sql +=" where 1=1 ";
			if(params.state !=null && params.stateFlag == null){
				sql +=" and a.state !="+params.state;
			}
			if(params.stateFlag != null){
				if(params.stateFlag !=2 && params.stateFlag !=1){//已删除和未发布
					sql +=" and a.state ="+params.stateFlag;
				}else if (params.stateFlag == 1){//已发布
					sql +=" and ((a.state = 1 and a.release_date is null) or (a.state=1 and a.release_date<=now()))";
				}else if (params.stateFlag == 2){
					sql +=" and a.state=1 and a.release_date>now() ";
				}
			}
			if(params.keyWord !=null){
				if(params.postChoose == 1){
					sql += " and a.adver_title like '%"+params.keyWord+"%'";
				}else if (params.postChoose == 2 && params.keyWord == '全局'){
					sql += " and a.group_id is null ";
				}
			}
			if(params.groupIds !=null && params.groupIds != '()'){
				sql +=" and a.group_id in "+params.groupIds+"";
			}
		return sql;	
	}
	//单值查询微博帖子列表
	this.getWeiboTopicList = function(params){
		var sql = "select topic_id as topicId,since_id as sinceId,topic_name as topicName ";
			sql +="from weibo_topic where u_id = '"+params.uId+"'";
			sql +=" order by since_id desc LIMIT 1";
		return sql;
	};
	
	
	//微博帖子列表         韩豆后台
	this.getWeiboList = function(params){
		return {
			rows:function(){
				var sql = "select w.topic_id as topicId,w.topic_number as topicNumber,w.topic_name as topicName,";
					sql +="o.group_id as groupId,f.star_name as starName,f.group_name as groupName,"
					sql +="w.topic_desc as topicDesc,w.topic_pics as topicPics,w.topic_state as topicState,w.since_id as sinceId,";
					sql +="w.create_date AS createDate,w.created_at as createAt,u.nick_name as nickName,u.user_id as userId ";
					sql +="from weibo_topic w INNER JOIN kp_user u on w.u_id = u.org_token ";
					sql +="inner join org_verify o on o.user_id=u.user_id inner join fans_group f on o.group_id=f.group_id where 1=1 ";
					if(params.topicId){
						sql +="and w.topic_id = '"+params.topicId+"'";
					}
					if(params.topicState != null){
						sql +=" and w.topic_state = "+params.topicState;
					}
					if(params.startDate && params.endDate){
						sql +=" and w.create_date >= '"+params.startDate+"' and w.create_date <= '"+params.endDate+"'";
					}
					if(params.keyWord){
						if(params.postChoose == 1){
							sql +=" and u.nick_name like '%"+params.keyWord+"%'";
						}else if(params.postChoose ==2){
							sql +=" and w.topic_name like '%"+params.keyWord+"%'";
						}else if(params.postChoose == 3){
							sql +=" and f.star_name like '%"+params.keyWord+"%'";
						}
					}
					if(params.order == 1){
						sql +=" order by w.create_date desc";
					}else if(params.order ==2){
						sql +=" order by w.create_date asc";
					}else if(params.order ==3){
						sql +=" order by w.created_at desc";
					}else if(params.order == 4){
						sql +=" order by w.created_at asc";
					}else{
						sql +=" order by w.create_date desc";
					}
					if(params.pageSize){
						sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
					}
				return sql;
			},
			count:function(){
				var sql = "select count(*) as count ";
					sql +="from weibo_topic w INNER JOIN kp_user u on w.u_id = u.org_token where 1=1 ";
					if(params.topicState != null){
						sql +=" and w.topic_state = "+params.topicState;
					}
					if(params.startDate && params.endDate){
						sql +=" and w.create_date >= '"+params.startDate+"' and w.create_date <= '"+params.endDate+"'";
					}
					if(params.keyWord){
						if(params.postChoose == 1){
							sql +=" and u.nick_name like '%"+params.keyWord+"%'";
						}else if(params.postChoose ==2){
							sql +=" and w.topic_name like '%"+params.keyWord+"%'";
						}
					}
				return sql;
			}
		}
	}
	
	
}

module.exports = orgTopic;