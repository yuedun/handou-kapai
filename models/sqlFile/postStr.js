var Constants = require('../../utils/constants');

/**
 * direction:
 * refresh 刷新
 * loadmore 加载
 * @return {[type]} [description]
 */
function postStr(){
	var sql = "";
	
	// SNS数据
	this.snsList = function(params){
		sql  = " SELECT";
		sql += " p.post_id AS topicId, p.post_description AS postDescription,";
		sql += " p.create_date AS createDate, p.like_count AS likeCount,";
		sql += " p.share_count AS shareCount, pcr.category_id AS categoryId,";
		sql += " ui.nick_name AS nickName, ui.head_portrait AS headPortrait,";
		sql += " ui.user_id AS userId";
		sql += " FROM post p, post_column_relation pcr, user_info ui";
		sql += " WHERE p.post_id = pcr.post_id";
		sql += " AND p.user_id = ui.user_id";
		sql += " AND p.post_state = 0";			// 旧的帖子表post ， post_state=0 为激活状态
		sql += " AND p.distinguish_status = 1";	// 帖子指定SNS
		if(null != params.categoryId || '' != params.categoryId){
			sql += " AND category_id = '" + params.categoryId +"'";		// 粉丝团ID
		}
		if(params.direction === Constants.DIRECTION.REFRESH){
			sql += " ORDER BY p.create_date DESC";   // 刷新
		} else {
			sql += " AND p.create_date < '" + params.lastDate + "'";	// 加载
			sql += " ORDER BY p.create_date DESC";
		}
		if(params.pageSize != null) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};
	// SNS帖子详情
	this.snsPostByPostId = function(params){
		sql = " SELECT";
		sql+= " p.post_id AS topicId, p.post_description AS postDescription,";
		sql+= " p.create_date AS createDate, ui.user_id AS userId ,";
		sql+= " ui.head_portrait AS headPortrait , p.star_name AS starName,";
		sql+= " p.share_count AS shareCount, p.like_count AS likeCount";
		sql+= " FROM post p, user_info ui";
		sql+= " WHERE p.user_id = ui.user_id";
		sql+= " AND p.distinguish_status = 1";
		sql+= " AND p.post_state = 0";
		sql+= " AND p.post_id = '" + params.topicId + "'";
		return sql;
	};
	// SNS帖子图片数据
	this.postImgList = function(params){
		sql = " SELECT";
		sql+= " pic.picture_id AS pictureId , pic.picture_state AS pictureState ,";
		sql+= " pic.picture_original_path AS pictureOriginalPath ,";
		sql+= " pic.picture_screenshot_path AS pictureScreenshotPath";
		sql+= " FROM picture pic";
		sql+= " WHERE pic.picture_state = 0";
		sql+= " AND pic.post_id = '" + params.postId + "'";
		return sql;
	};
	// 修改帖子的点赞数
	this.updatePostLikeCount = function(params){
		sql = " UPDATE post";
		sql+= " set like_count = like_count + (" + params.value + ")";
		sql+= " WHERE ";
		sql+= " post_id = '" + params.postId + "';";
		return sql;
	};
	// 修改帖子的分享数
	this.updatePostShareCount = function(params){
		sql = " UPDATE post";
		sql+= " set share_count = share_count + (" + params.value + ")";
		sql+= " WHERE";
		sql+= " post_id = '" + params.postId +"';";
		return sql;
	};
	/**
	 * ***********************************************************************
	 * 以下为新版本V3.0数据库表
	 */
	// 帖子数据（公共）
	this.myPost = function(params){
		sql = " SELECT";
		sql+= " tc.topic_id AS topicId, tc.topic_name AS topicName,";
		sql+= " tc.topic_scope AS topicScope, tc.topic_desc AS topicDesc,";
		sql+= " tc.audio_address AS audioAddress, tc.audio_time AS audioTime,";
		sql+= " tc.topic_pics AS topicPics, tc.pics_size AS picsSize,";
		sql+= " tc.is_recommend AS isRecommend, tc.like_count AS likeCount,";
		sql+= " tc.share_count AS shareCount, tc.create_date AS createDate,";
		sql+= " tc.timed_release_date AS timedReleaseDate, ui.user_id AS userId ,";
		sql+= " ui.nick_name AS nickName, ui.head_portrait AS headPortrait,";
		sql+= " ui.user_type AS userType";
		sql+= " FROM topic tc, kp_user ui";
		sql+= " WHERE tc.user_id = ui.user_id";
		sql+= " AND ui.state = " + Constants.STATE.ACTIVE;
		sql+= " AND tc.topic_state = " + Constants.STATE.ACTIVE;
		sql+= " AND ((tc.timed_release_date is null) or (tc.timed_release_date <= NOW()))";  // 过滤定时发布内容
		// 类型 2：粉丝帖子，3：组织帖子
		if(params.topicType != null){
			sql+= " AND tc.topic_type = " + params.topicType +"";
		}
		// 个人、组织ID
		if(params.userId != null){
			sql+= " AND tc.user_id = '" + params.userId + "'";
		}
		// 分页方向
		if(params.direction == Constants.DIRECTION.LOADMORE){
			sql += " AND IFNULL(tc.timed_release_date, tc.create_date) < '" + params.lastDate + "'";	// 加载
		}
		sql += " ORDER BY tc.is_recommend DESC, IFNULL(tc.timed_release_date, tc.create_date) DESC";
		// 分页条目
		if(params.pageSize) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};

	// 频道下的帖子列表
	this.topicPost = function(params){
		sql = " SELECT";
		sql+= " tc.topic_id AS topicId, tc.topic_name AS topicName,";
		sql+= " tc.topic_scope AS topicScope, tc.topic_desc AS topicDesc,";
		sql+= " tc.audio_address AS audioAddress, tc.audio_time AS audioTime,";
		sql+= " tc.topic_pics AS topicPics, tc.pics_size AS picsSize,";
		sql+= " tc.is_recommend AS isRecommend, tc.like_count AS likeCount,";
		sql+= " tc.share_count AS shareCount, tc.create_date AS createDate,";
		sql+= " tc.timed_release_date AS timedReleaseDate, ui.user_id AS userId ,";
		sql+= " ui.nick_name AS nickName, ui.head_portrait AS headPortrait,";
		sql+= " ui.user_type AS userType";
		sql+= " FROM topic tc INNER JOIN kp_user ui ON tc.user_id = ui.user_id";
		sql+= " WHERE tc.parent_topic_id = '" + params.parentTopicId + "'";
		sql+= " AND ui.state = " + Constants.STATE.ACTIVE;
		sql+= " AND tc.topic_state = " + Constants.STATE.ACTIVE;
		// 分页方向
		if(params.direction == Constants.DIRECTION.LOADMORE){
			sql += " AND tc.create_date < '" + params.lastDate + "'";	// 加载
		}
		sql += " ORDER BY tc.create_date DESC";
		// 分页条目
		if(params.pageSize) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};

	// （个人 / 组织）我的帖子的评论
	this.myPostComment = function(params){
		sql = " SELECT";
		sql+= " tc.comment_id AS commentId, tc.topic_id AS topicId,";
		sql+= " tc.comment_content AS commentContent, tc.reply_user_id AS replyUserId,";
		sql+= " tc.reply_comment_id AS replyCommentId, tc.reply_nick_name AS replyNickName,";
		sql+= " tc.is_reply AS isReply, tc.audio_address AS audioAddress,";
		sql+= " tc.audio_time AS audioTime, tc.like_count AS likeCount,";
		sql+= " tc.create_date AS createDate, ui.user_id AS userId ,";
		sql+= " ui.nick_name AS nickName , ui.head_portrait AS headPortrait,";
		sql+= " ui.user_type AS userType";
		sql+= " FROM topic_comment tc, kp_user ui";
		sql+= " WHERE tc.user_id = ui.user_id";
		sql+= " AND tc.comment_state = 1";
		sql+= " AND tc.topic_id = '" + params.topicId + "'";
		if(params.direction === Constants.DIRECTION.REFRESH){
			sql += " ORDER BY tc.create_date DESC";   // 刷新
		} else {
			sql += " AND tc.create_date < '" + params.lastDate + "'";	// 加载
			sql += " ORDER BY tc.create_date DESC";
		}
		if(params.pageSize != null) {
			sql += " limit " + params.pageSize;
		} else {
			sql += " limit " + Constants.DEFAULT_PAGE_SIZE;
		}
		return sql;
	};
	// 帖子的评论数
	this.myPostCommentCount = function(params){
		sql = " SELECT count(*) AS commentCount FROM topic_comment";
		sql+= " WHERE comment_state = 1";
		sql+= " AND topic_id =  '" + params.topicId + "'";
		return sql;
	};
	// 修改帖子的点赞数
	this.updateTopicLikeCount = function(params){
		sql = " UPDATE topic";
		sql+= " set like_count = like_count + (" + params.value + ")";
		sql+= " WHERE";
		sql+= " topic_id = '" + params.topicId + "'";
		return sql;
	};
	// 修改帖子的分享数
	this.updateTopicShareCount = function(params){
		sql = " UPDATE topic";
		sql+= " set share_count = share_count + (" + params.value + ")";
		sql+= " WHERE";
		sql+= " topic_id = '" + params.topicId + "'";
		return sql;
	};
	// (个人 / 组织)帖子详情
	this.PostDetails = function(params){
		sql = " SELECT";
		sql+= " t.topic_id AS topicId, ku.user_id AS userId,t.pics_size AS picsSize,";
		sql+= " ku.head_portrait AS headPortrait, t.topic_pics AS topicPics,";
		sql+= " t.audio_address AS audioAddress, t.audio_time AS audioTime,";
		sql+= " t.topic_desc AS topicDesc, t.topic_name AS topicName,";
		sql+= " ku.nick_name AS nickName, t.is_recommend AS isRecommend,";
		sql+= " t.like_count AS likeCount, t.create_date AS createDate";
		sql+= " FROM kp_user ku, topic t";
		sql+= " WHERE ku.user_id = t.user_id";  
		sql+= " AND ku.state = " + Constants.STATE.ACTIVE;      // 激活用户 或者 审核通过的组织
		sql+= " AND t.topic_state = " + Constants.STATE.ACTIVE; // 激活帖子
		sql+= " AND t.topic_id = '" + params.topicId + "'";		// 帖子ID 
		return sql;
	};
	// 修改评论的点赞数
	this.updateTopicCommentLikeCount = function(params){
		sql = " UPDATE topic_comment";
		sql+= " set like_count = like_count + (" + params.value + ")";
		sql+= " WHERE";
		sql+= " comment_id = '" + params.commentId + "'";
		return sql;
	};
	// 根据ID修改豆币关系表里面的豆币值
	this.updateBeanValue = function(params){
		sql = " UPDATE bean_relation";
		sql+= " set bean_value = bean_value + (" + params.beanValue + ")";
		sql+= " WHERE";
		sql+= " bean_relation_id = '" + params.beanRelationId + "'";
		return sql;
	};

	/** ***********************后台管理SQL*********************** */
	// 用户帖子列表
	this.adminUserPost = function(params){
		sql  = " SELECT";
		sql += " tc.topic_number AS topicNumber, tc.topic_id AS topicId,";
		sql += " tc.topic_name AS topicName, tc.topic_scope AS topicScope,";
		sql += " tc.topic_desc AS topicDesc, tc.audio_address AS audioAddress,";
		sql += " tc.audio_time AS audioTime, tc.topic_pics AS topicPics,";
		sql += " tc.is_recommend AS isRecommend, tc.like_count AS likeCount,";
		sql += " tc.share_count AS shareCount, tc.create_date AS createDate,";
		sql += " tc.topic_type AS topicType, tc.topic_state AS topicState,";
		sql += " ui.user_id AS userId , ui.head_portrait AS headPortrait ,";
		sql += " ui.nick_name AS nickName, ui.user_name AS userName";
		sql += " FROM topic tc, kp_user ui";
		sql += " WHERE tc.user_id = ui.user_id";
		sql += " AND ui.state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_type = " + Constants.POST.CHANNEL;
		/** ### 时间查询处理 ### */
		if(null != params.StartDate && '' != params.StartDate){
			sql += " AND tc.create_date >= '" + params.StartDate +"'";
			sql += " AND tc.create_date <= '" + params.EndDate + "'";
		}
		/** ### 条件查询处理 ### */
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND tc.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 帖子内容查询
				sql += " AND tc.topic_desc like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 帖子标题查询
				sql += " AND tc.topic_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 3){
				// 用户名查询
				sql += " AND ui.nick_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 4){
				// 手机号码查询
				sql += " AND ui.user_name = " + params.ConditionText;
			} else {
				sql += " AND tc.topic_number = " + params.ConditionText;
			}
		}
		/** ### 类型查询 ### **/
		if(null != params.typeId && "" != params.typeId){
			sql += " AND tc.topic_scope = " + params.typeId;
		}
		/** ### 条件排序处理 ### */
		if(null != params.SortId && "" != params.SortId){
			if(params.SortId == 0){
				sql += " ORDER BY tc.like_count ASC";
			} else if(params.SortId == 1){
				sql += " ORDER BY tc.like_count DESC";
			} else if(params.SortId == 2){
				sql += " ORDER BY tc.create_date ASC";
			} else if(params.SortId == 3){
				sql += " ORDER BY tc.create_date DESC";
			} else {
				sql += " ORDER BY tc.create_date DESC";
			}
		} else {
			sql += " ORDER BY tc.create_date DESC";
		}
		sql += " limit " + params.offset + " , " + params.limit;
		return sql;
	};

	// 用户帖子总数
	this.adminUserPostCount = function(params){
		sql  = " SELECT";
		sql += " count(*) AS postCount";
		sql += " FROM topic tc, kp_user ui";
		sql += " WHERE tc.user_id = ui.user_id";
		sql += " AND ui.state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_type = " + Constants.POST.CHANNEL;
		/** ### 时间查询处理 ### */
		if(null != params.StartDate && '' != params.StartDate){
			sql += " AND tc.create_date >= '" + params.StartDate +"'";
			sql += " AND tc.create_date <= '" + params.EndDate + "'";
		}
		/** ### 条件查询处理 ### */
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND tc.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 帖子内容查询
				sql += " AND tc.topic_desc like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 帖子标题查询
				sql += " AND tc.topic_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 3){
				// 用户名查询
				sql += " AND ui.nick_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 4){
				// 手机号码查询
				sql += " AND ui.user_name = " + params.ConditionText;
			} else {
				sql += " AND tc.topic_number = " + params.ConditionText;
			}
		}
		/** ### 类型查询 ### **/
		if(null != params.typeId && "" != params.typeId){
			sql += " AND tc.topic_scope = " + params.typeId;
		}
		return sql;
	};
	// 组织帖子列表
	this.adminOrgPost = function(params){
		sql  = " SELECT";
		sql += " tc.topic_number AS topicNumber, tc.topic_id AS topicId,";
		sql += " tc.topic_name AS topicName, tc.topic_scope AS topicScope,";
		sql += " tc.topic_desc AS topicDesc, tc.audio_address AS audioAddress,";
		sql += " tc.audio_time AS audioTime, tc.topic_pics AS topicPics,";
		sql += " tc.is_recommend AS isRecommend, tc.like_count AS likeCount,";
		sql += " tc.share_count AS shareCount, tc.create_date AS createDate,";
		sql += " tc.topic_type AS topicType, tc.topic_state AS topicState,";
		sql += " ui.user_id AS userId , ui.head_portrait AS headPortrait ,";
		sql += " ui.nick_name AS nickName, ui.user_name AS userName";
		sql += " FROM topic tc, kp_user ui";
		sql += " WHERE tc.user_id = ui.user_id";
		sql += " AND ui.state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_type = " + Constants.POST.ORGANIZE;
		/** ### 时间查询处理 ### */
		if(null != params.StartDate && '' != params.StartDate){
			sql += " AND tc.create_date >= '" + params.StartDate +"'";
			sql += " AND tc.create_date <= '" + params.EndDate + "'";
		}
		/** ### 条件查询处理 ### */
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND tc.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 帖子标题查询
				sql += " AND tc.topic_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 组织名称查询
				sql += " AND ui.nick_name like '%" + params.ConditionText + "%'";
			} else {
				sql += " AND tc.topic_number = " + params.ConditionText;
			}
		}
		/** ### 条件排序处理 ### */
		if(null != params.SortId){
			if(params.SortId == 0){
				sql += " ORDER BY tc.like_count ASC";
			} else if(params.SortId == 1){
				sql += " ORDER BY tc.like_count DESC";
			} else if(params.SortId == 2){
				sql += " ORDER BY tc.create_date ASC";
			} else if(params.SortId == 3){
				sql += " ORDER BY tc.create_date DESC";
			} else {
				sql += " ORDER BY tc.create_date DESC";
			}
		}
		sql += " limit " + params.offset + " , " + params.limit;
		return sql;
	};
	// 组织帖子总数
	this.adminOrgPostCount = function(params){
		sql  = " SELECT";
		sql += " count(*) AS postCount";
		sql += " FROM topic tc, kp_user ui";
		sql += " WHERE tc.user_id = ui.user_id";
		sql += " AND ui.state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.topic_type = " + Constants.POST.ORGANIZE;
		/** ### 时间查询处理 ### */
		if(null != params.StartDate && '' != params.StartDate){
			sql += " AND tc.create_date >= '" + params.StartDate +"'";
			sql += " AND tc.create_date <= '" + params.EndDate + "'";
		}
		/** ### 条件查询处理 ### */
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND tc.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 帖子标题查询
				sql += " AND tc.topic_name like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 组织名称查询
				sql += " AND ui.nick_name like '%" + params.ConditionText + "%'";
			} else {
				sql += " AND tc.topic_number = " + params.ConditionText;
			}
		}
		return sql;
	};
	// 帖子评论
	this.adminPostComment = function(params){
		sql  = " SELECT";
		sql += " tc.comment_id AS commentId, tc.comment_content AS commentContent,";
		sql += " tc.audio_address AS audioAddress, tc.audio_time AS audioTime,";
		sql += " t.topic_number AS topicNumber, tc.like_count AS likeCount,";
		sql += " ku.nick_name AS nickName, ku.user_name AS userName,";
		sql += " tc.create_date AS createDate";
		sql += " FROM topic t, topic_comment tc, kp_user ku";
		sql += " WHERE t.topic_id = tc.topic_id";
		sql += " AND tc.user_id = ku.user_id";
		sql += " AND t.topic_state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.comment_state = " + Constants.STATE.ACTIVE;
		/** ### 条件查询处理 ### */ 
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND t.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 评论内容查询
				sql += " AND tc.comment_content like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 用户名查询
				sql += " AND ku.nick_name like '%" + params.ConditionText + "%'";
			} else if (params.ConditionId == 3){
				// 手机号码
				sql += " AND ku.user_name = " + params.ConditionText;
			} else {
				sql += " AND t.topic_number = " + params.ConditionText;
			}
		}
		/** ### 条件排序处理 ### */
		if(null != params.SortId){
			if(params.SortId == 0){
				sql += " ORDER BY tc.like_count ASC";
			} else if(params.SortId == 1){
				sql += " ORDER BY tc.like_count DESC";
			} else if(params.SortId == 2){
				sql += " ORDER BY tc.create_date ASC";
			} else if(params.SortId == 3){
				sql += " ORDER BY tc.create_date DESC";
			} else {
				sql += " ORDER BY tc.create_date DESC";
			}
		}
		sql += " limit " + params.offset + " , " + params.limit;
		return sql;
	};
	// 帖子评论总数
	this.adminPostCommentCount = function(params){
		sql  = " SELECT";
		sql += " count(*) AS totalCount";
		sql += " FROM topic t, topic_comment tc, kp_user ku";
		sql += " WHERE t.topic_id = tc.topic_id";
		sql += " AND tc.user_id = ku.user_id";
		sql += " AND t.topic_state = " + Constants.STATE.ACTIVE;
		sql += " AND tc.comment_state = " + Constants.STATE.ACTIVE;
		/** ### 条件查询处理 ### */ 
		if(null != params.ConditionText && 'undefined' !== params.ConditionText && '' != params.ConditionText){
			// 帖子ID查询
			if(params.ConditionId == 0){
				sql += " AND t.topic_number = " + params.ConditionText;
			} else if(params.ConditionId == 1){
				// 评论内容查询
				sql += " AND tc.comment_content like '%" + params.ConditionText + "%'";
			} else if(params.ConditionId == 2){
				// 用户名查询
				sql += " AND ku.nick_name like '%" + params.ConditionText + "%'";
			} else if (params.ConditionId == 3){
				// 手机号码
				sql += " AND ku.user_name = " + params.ConditionText;
			} else {
				sql += " AND t.topic_number = " + params.ConditionText;
			}
		}
		return sql;
	};
	
	// 视频列表(热度 和 最新)
	this.getVideoInfo = function(params){
		sql  = " select ";
		sql += " video_id as videoId, video_desc as videoDesc,";
		sql += " video_address as videoAddress, picture as picture,";
		sql += " like_count as likeCount, share_count as shareCount,";
		sql += " read_count as readCount, create_date as createDate";
		sql += " from kp_video ";
		sql += " where video_state = 1 ";				// 只查询激活状态数据 

		// 排序方式 (热度 和 最新)
		if(params.order == "createDate"){
			sql += " order by create_date desc ";		// 按最新
		} else if(params.order == "readCount") {
			sql += " order by read_count desc ";		// 按热度
		} else {
			sql += " order by read_count desc";			// 默认按热度
		}

        // 加载更多
        if(params.direction == Constants.DIRECTION.LOADMORE){
            sql += " limit "+params.beginrow+",10 ";
        }else{
            sql += " limit 10 ";		// 每次只取10条
        }


		return sql;
	};
	
	// 官网视频列表
	this.officiaVideoList = function(params){
		sql  = " select ";
		sql += " video_id as videoId, video_desc as videoDesc,";
		sql += " video_address as videoAddress, picture as picture,";
		sql += " like_count as likeCount, share_count as shareCount,";
		sql += " read_count as readCount, create_date as createDate";
		sql += " from kp_video ";
		sql += " where video_state = 1 ";			// 只查询激活状态数据 
		sql += " order by read_count desc ";		// 按热度
		return sql;
	};
	
	// 官方相关视频
	this.officiaTagVideoList = function(params){
		sql  = " select ";
		sql += " video_id as videoId, video_desc as videoDesc,";
		sql += " video_address as videoAddress, picture as picture,";
		sql += " like_count as likeCount, share_count as shareCount,";
		sql += " read_count as readCount, create_date as createDate";
		sql += " from kp_video ";
		sql += " where video_state = 1 ";			// 只查询激活状态数据 
		if(null != params.videoTag && '' != params.videoTag){
			sql += "   and video_tag like '%" + params.videoTag + "%'";
		} else {
			sql += "   and video_tag is null ";
		}
		sql += " order by read_count desc ";		// 按热度
		return sql;
	};
	
	// 修改阅读量
	this.editVideoReadCountById = function(params){
		sql  = " update kp_video ";
		sql += " set read_count = read_count + (1) ";
		sql += " where video_id = " + params.videoId;
		return sql;
	};
	
}

module.exports = postStr;
