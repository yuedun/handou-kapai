module.exports = {
	/* 频道内容范围 0：文字频道，1：图片频道，2：语音频道，3：动图频道 */
	TOPIC_SCOPE: {
		TEXT: 0,
		PICTURE: 1,
		AUDIO: 2,
		GIF_PICTURE: 3
	},
	/* 记录状态 */
	STATE: {
		ACTIVE: 1,
		FROZEN: 0
	},
	/* 频道类型 0：普通频道，1：粉丝团频道 */
	CHANNEL: {
		NORMAL: 0,
		GROUP: 1
	},
	/* 帖子类型 2：频道帖子，3,：组织帖子 */
	POST: {
		CHANNEL: 2,
		ORGANIZE: 3
	},
	DIRECTION: {
		BEFORE_DATE: -1,
		LATEST: 0,
		OLDEST: 1,
		AFTER_DATE: 2,
		REFRESH: 'refresh',
		LOADMORE: 'loadmore'
	},
	DEFAULT_PAGE_SIZE: 10,
	NO: 0,
	YES: 1,
	NULL_NICK_NAME:'路人',
	PUSH_USER:'1111111-777777777777777777777777',
	OFFICIAL_USER:'999999',
	USER_TYPE: {
		USER: 3,
		ORGANIZATION: 1
	},
	BEAN_TYPE: {
		SIGN:3007, //表示当月累计签到
		SEND_POST:3008, // 发帖
		CREATE_TOPIC: 3009 //创建频道
	}
};