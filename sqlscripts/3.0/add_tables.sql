aa/* 
 * 频道帖子表 
 * 记录频道信息，频道里的帖子信息
 * 加索引后的sql
 */
DROP TABLE IF EXISTS `topic`;
CREATE TABLE `topic` (
  `topic_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '频道帖子编号',
  `topic_number` int(11) NOT NULL AUTO_INCREMENT COMMENT 'topic自增ID',
  `topic_name` varchar(150) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '频道名称',
  `topic_desc` varchar(2000) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '频道描述，帖子内容',
  `parent_topic_id` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '帖子的所属频道编号',
  `topic_scope` int(2) DEFAULT '0' COMMENT '0：文字频道，1：图片频道，2：语音频道，3：动图频道',
  `audio_address` varchar(200) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '音频地址',
  `audio_time` int(4) DEFAULT '0' COMMENT '音频时间',
  `logo` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '暂时帖子和频道都没用到',
  `small_logo` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '暂时帖子和频道都没用到',
  `topic_pics` varchar(500) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '图片七牛key,可以为多个，用逗号&符号分开。',
  `pics_size` varchar(500) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '图片尺寸',
  `topic_state` int(2) DEFAULT '1' COMMENT '帖子状态：0未发布，1发布，-1删除',
  `is_recommend` int(2) DEFAULT '0' COMMENT '韩豆推荐频道 0：未推荐，1：推荐',
  `like_count` int(11) DEFAULT '0',
  `share_count` int(11) DEFAULT '0' COMMENT '分享数',
  `topic_type` int(2) DEFAULT '0' COMMENT '0：普通频道，1：粉丝团频道，2：频道帖子，3：组织帖子',
  `user_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '发布者的id',
  `group_id` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '频道所属粉丝团编号',
  `timed_release_date` datetime DEFAULT NULL COMMENT '定时发布时间',
  `create_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `topic_number_unique_key` (`topic_number`),
  KEY `create_idx` (`create_date`),
  KEY `update_idx` (`update_date`),
  KEY `user_id_idx` (`user_id`),
  KEY `parent_topic_id_idx` (`parent_topic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=123193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='频道帖子表';




/* 
 * 用户频道关系表 
 * 记录用户是否关注了频道，这个用户是否我此频道的频道主
 */
DROP TABLE IF EXISTS `user_topic_relation`;
CREATE TABLE `user_topic_relation` (
  `relation_id` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `topic_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '被关注的频道编号',
  `user_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '关注此频道用户的id',
  `relation_state` int(2) DEFAULT '1' COMMENT '此记录状态：可用1，禁用0',
  `is_host` int(2) DEFAULT '0' COMMENT '0：不是频道主，1：是频道主',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `topic_id_index` (`topic_id`),
  KEY `user_id_index` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户关注频道关系表';

/*
 * topic评论表 
 * 记录评论和评论的评论信息
 */
DROP TABLE IF EXISTS `topic_comment`;
CREATE TABLE `topic_comment` (
  `comment_id` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `topic_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '评论所在的topic编号',
  `comment_content` varchar(400) COLLATE utf8mb4_bin DEFAULT NULL,
  `reply_user_id` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL COMMENT ' 被回复的评论的用户编号',
  `reply_comment_id` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '被回复的评论编号',
  `reply_nick_name` varchar(16) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '被回复的评论的用户昵称',
  `is_reply` int(2) DEFAULT '0' COMMENT '是否是回复0：不是，1：是',
  `comment_state` int(2) DEFAULT '1',
  `user_id` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL,
  `audio_address` varchar(512) COLLATE utf8mb4_bin DEFAULT NULL,
  `audio_time` int(11) DEFAULT '0',
  `like_count` int(11) DEFAULT '0' COMMENT '评论点赞数',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `user_id_reply_user_id_state_idx` (`user_id`, `reply_user_id`, `comment_state`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='评论表';

/**
 * 粉丝团(明星)表
 */
DROP TABLE IF EXISTS `fans_group`;
CREATE TABLE `fans_group` (
  `group_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `star_name` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '明星名称',
  `star_logo` varchar(128) COLLATE utf8_bin DEFAULT NULL COMMENT '明星logo',
  `group_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `group_logo` varchar(512) COLLATE utf8_bin DEFAULT NULL COMMENT '粉丝团logo',
  `group_state` int(2) DEFAULT '1' comment '可用状态：0未发布，1发布，-1删除',
  `fan_count` int(11) DEFAULT '0',
  `sort_field` int(11) DEFAULT '0',
  `picture_fan_group` varchar(512) COLLATE utf8_bin DEFAULT NULL COMMENT '粉丝团大图',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `AK_UQ_group_name` (`group_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='粉丝团表';

/**
 * 粉丝团用户/组织关系表
 */
DROP TABLE IF EXISTS `group_user_relation`;
CREATE TABLE `group_user_relation` (
  `group_relation_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '普通用户或组织id',
  `group_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '粉丝团id(即明星id)',
  `group_relation_state` int(2) DEFAULT '0' COMMENT '用户(非组织)和粉丝团加入关系，选择明星不一定加入粉丝团，非必须',
  `selection_state` int(2) DEFAULT '1' COMMENT '用户包括组织和明星的选择关系,先选择明星后加入粉丝团，必须',
  `user_type` varchar(10) DEFAULT NULL COMMENT '用户类型：user普通用户，org组织用户',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`group_relation_id`),
  KEY `group_id_user_id_state_idx` (`group_id`,`user_id`,`group_relation_state`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户 粉丝团 关系';

/* 我的背包 */
DROP TABLE IF EXISTS `bag`;
CREATE TABLE `bag` (
  `bag_id` varchar(128) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '用户的id',
  `ticket_amount` int(10) DEFAULT '0' COMMENT '该类型兑换券的数量',
  `ticket_id` int(10) NOT NULL COMMENT '该类型兑换券的编号，具体信息需关联表ticket',
  `create_date` datetime DEFAULT NULL,
  PRIMARY KEY (`bag_id`),
  KEY `user_id_index` (`user_id`),
  KEY `exchange_index` (`user_id`,`ticket_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='背包表';

/* 兑换券 */
DROP TABLE IF EXISTS `ticket`;
CREATE TABLE `ticket` (
  `ticket_id` int(10) NOT NULL AUTO_INCREMENT,
  `ticket_type` int(1) NOT NULL COMMENT '兑换券类型，1：每日打卡券 2：打卡券 3：豆币券 4：零食礼包 5:专辑券 6:追星大礼包',
  `ticket_name` varchar(32) DEFAULT NULL,
  `par_value` int(10) DEFAULT '0' COMMENT '面值',
  `ticket_picture_url` varchar(128) NOT NULL COMMENT '兑换券图片存放地址',
  `ticket_usage` varchar(256) DEFAULT NULL COMMENT '兑换券使用说明',
  `is_substance` int(1) DEFAULT 0 COMMENT '1:实物   0:虚拟',
  `produceDate` datetime DEFAULT NULL COMMENT '兑换券有效期的开始时间',
  `expireDate` datetime DEFAULT NULL COMMENT '兑换券有效期的结束时间',
  PRIMARY KEY (`ticket_id`),
  KEY `ticket_type_index` (`ticket_type`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of ticket
-- ----------------------------
INSERT INTO `ticket` VALUES ('1', '1', '每日打卡券', '0', 'GIFT_DAKA_DAILY', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('3', '3', '豆币券', '10', 'GIFT_DOUBI_10', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('2', '2', '打卡券', '0', 'GIFT_DAKA', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('8', '4', '零食礼包', '0', 'GIFT_LINSHI', '直接使用', '1', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('4', '3', '豆币券', '20', 'GIFT_DOUBI_20', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('7', '5', '专辑券', '0', 'GIFT_ZHUANJI', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('5', '3', '豆币券', '50', 'GIFT_DOUBI_50', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('9', '6', '追星大礼包', '0', 'GIFT_ZHUIXINGDALIBAO', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');
INSERT INTO `ticket` VALUES ('6', '3', '豆币券', '100', 'GIFT_DOUBI_100', '直接使用', '0', '2015-09-01 00:00:00', '2017-09-01 00:00:00');

/* 用户打卡记录表 */
DROP TABLE IF EXISTS `org_user_record`;
CREATE TABLE `org_user_record` (
  `record_id` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `org_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '组织id',
  `user_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '打卡用户',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime NOT NULL COMMENT '打卡日期，每次打卡修改',
  PRIMARY KEY (`record_id`),
  KEY `org_id_index` (`org_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户对组织打卡记录';

/* 用户关注组织关系表 */
DROP TABLE IF EXISTS `org_user_relation`;
CREATE TABLE `org_user_relation` (
  `relation_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '用户关注组织关系id',
  `org_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '组织id(被关注用户id)',
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '用户id',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`relation_id`),
  UNIQUE KEY `org_user_relation_id_index` (`relation_id`) USING BTREE,
  KEY `org_id_index` (`org_id`) USING BTREE,
  KEY `user_id_index` (`user_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户关注组织关系表';

/* 点赞关系表 */
DROP TABLE IF EXISTS `user_like_relation`;
CREATE TABLE `user_like_relation` (
  like_id varchar(32) COLLATE utf8_bin NOT NULL,
	post_id varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '被点赞的外建id',
	user_id varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '点赞的用户的id',
	state int(2) DEFAULT '0' COMMENT '1:已赞 0:未赞',
	type int(2) DEFAULT 0 COMMENT '0:帖子点赞 1:评论点赞',
	create_date datetime DEFAULT NULL,
	update_date datetime DEFAULT NULL,
	PRIMARY KEY (`like_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='点赞关系表';


/* 身份卡表 */
DROP TABLE IF EXISTS `id_card`;
CREATE TABLE `id_card` (
  `card_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `card_number` int(32) NOT NULL AUTO_INCREMENT COMMENT '身份卡号',
  `group_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '粉丝团编号',
  `user_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '用户编号',
  `card_state` int(1) DEFAULT '1' COMMENT '可用状态',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`card_id`),
  -- UNIQUE KEY (`card_number`)
) ENGINE=MyISAM AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='身份卡表';

/* 咖派用户表 不再使用韩豆用户表*/
DROP TABLE IF EXISTS `kp_user`;
CREATE TABLE `kp_user` (
  `user_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_name` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '登陆账号',
  `password` varchar(48) COLLATE utf8_bin NOT NULL COMMENT '密码',
  `nick_name` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '昵称',
  `state` smallint(1) DEFAULT '1' COMMENT '是否可用，可用1，不可用0',
  `org_token` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '微博id',
  `gender` smallint(1) DEFAULT '0' COMMENT '男1，女0',
  `head_portrait` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '头像（组织logo）',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `center_background` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '用户中心背景图',
  `fans_count` int(11) DEFAULT NULL COMMENT '粉丝数（针对组织用户）',
  `bean` int(11) DEFAULT '0' COMMENT '豆币',
  `user_type` enum('org','user') COLLATE utf8_bin DEFAULT 'user' COMMENT '用户类型：普通用户-user，组织用户-org',
  `country` varchar(50) COLLATE utf8_bin DEFAULT '中国' COMMENT '国籍',
  `country_code` varchar(10) COLLATE utf8_bin DEFAULT '86' COMMENT '国家代码',
  `this_life` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '本命',
  `device_id` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '设备id',
  `mobile_type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `platform_type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `software_version` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `os_version` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `create_ip` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT '注册IP地址',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `push_installationId` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT 'LeanCloud注册的设备信息编号',
  `push_objectId` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT 'LeanCloud注册推送消息分配的对象编号',
  `push_channels` text COLLATE utf8_bin COMMENT '推送消息订阅的频道列表',
  PRIMARY KEY (`user_id`),
  KEY `user_name_index` (`user_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC COMMENT='咖派用户表';


/* 豆币关系表*/
DROP TABLE IF EXISTS `bean_relation`;
CREATE TABLE `bean_relation` (
  `bean_relation_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '用户编号',
  `bean_type` int(11) DEFAULT '0'  COMMENT '豆币类型',
  `bean_value` int(11) DEFAULT '0' COMMENT '记录当天豆币',
  `bean_date` date DEFAULT NULL COMMENT '记录当天签到时间',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`bean_relation_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='豆币关系表';



/* 豆币加倍表*/
/* 豆币加倍表*/
DROP TABLE IF EXISTS `bean_double`;
CREATE TABLE `bean_double` (
  `bean_double_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `type` enum('sign','post','share') COLLATE utf8_bin DEFAULT NULL COMMENT '加倍类型(sign:签到,post:发帖,share:分享)',
  `bean_double_state` int(2) DEFAULT '1' COMMENT '状态1表示可用',
  `bean_star_time` datetime DEFAULT NULL COMMENT '豆币开始时间',
  `bean_end_time` datetime DEFAULT NULL COMMENT '豆币结束时间',
  `bean_multiple` int(2) DEFAULT '0' COMMENT '豆币倍数',
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`bean_double_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='豆币加倍表';



/*记录连续签到次数表*/
DROP TABLE IF EXISTS `sign_in_count`;
CREATE TABLE `sign_in_count` (
  `sign_in_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '用户编号',
  `sign_in_count` int(11) COLLATE utf8_bin DEFAULT '0' COMMENT '连续签到次数',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`sign_in_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='记录连续签到次数';

/*兑换中心(礼品兑换记录，如专辑券、礼包等)*/
DROP TABLE IF EXISTS `kp_user_exchange_center`;
CREATE TABLE `kp_user_exchange_center` (
  `exchange_no` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '兑换登记编号',
  `user_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '用户编号',
  `exchange_type` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '兑换操作名称，如：专辑券兑换',
  `exchange_info` text COLLATE utf8mb4_bin COMMENT '兑换详情，用JSON对象封装',
  `operator` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '完成本地兑换操作的工作人员',
  `is_finish` int(11) DEFAULT '0' COMMENT '兑换工作是否完成，0：未确认 1：已准备 2：已发送 -1：已删除',
  `create_date` datetime DEFAULT NULL COMMENT '兑换记录创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '兑换记录更新时间，如兑换完成时间',
  PRIMARY KEY (`exchange_no`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

/** 咖派消息推送表 */
DROP TABLE IF EXISTS `kp_message`;
CREATE TABLE `kp_message` (
	`message_id`  varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL ,
	`message_text`  varchar(640) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '推送内容' ,
	`user_id`  varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '用户ID 或 组织ID' ,
	`topic_id`  varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT '帖子ID' ,
	`push_type`  int(2) NULL DEFAULT 0 COMMENT '推送状态0:手动推送 1：自动推送' ,
	`push_goal`  int(2) NULL DEFAULT 0 COMMENT '推送目标 0:全体、1:粉丝团、2:组织、3:个人' ,
	`bean_value`  int(11) NULL DEFAULT 0 COMMENT '推送积分值' ,
	`release_date`  datetime NULL DEFAULT NULL COMMENT '定时时间' ,
	`create_date`  datetime NULL DEFAULT NULL COMMENT '创建时间' ,
	`update_date`  datetime NULL DEFAULT NULL COMMENT '更新时间' ,
PRIMARY KEY (`message_id`),
UNIQUE INDEX `message_id_index` (`message_id`) USING BTREE 
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='咖派消息推动表';



/*组织审核关系表*/
DROP TABLE IF EXISTS `org_verify`;
CREATE TABLE `org_verify` (
  `org_verify_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '用户编号',
  `verifier` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '审核人',
  `org_type` enum('outer','inner') COLLATE utf8_bin DEFAULT 'outer' COMMENT '组织类型：outer外部组织，inner内部组织',
  `group_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '粉丝团编号',
  `verify_state` int(11) DEFAULT NULL COMMENT '审核状态 null未审核 0未通过 1审核通过 -1已删除',
  `verify_date` datetime DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`org_verify_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='记录组织审核，前端展示的组织都需要在此表中通过审核';


/**
 * 广告表
 */
DROP TABLE IF EXISTS `adver`;
CREATE TABLE `adver` (
  `adver_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `adver_title` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '广告标题',
  `adver_pic` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '广告图片',
  `group_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '明星编号',
  `link_type` enum('page','news','topic','post') COLLATE utf8_bin DEFAULT 'post' COMMENT '链接类型 post帖子 topic频道 news资讯 page外部H5',
  `link_value` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '具体链接',
  `like_count` int(11) DEFAULT '0' COMMENT '点击数',
  `state` int(1) DEFAULT '1' COMMENT '状态 0未发布 1已发布 -1已删除',
  `release_date` datetime DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`adver_id`),
  UNIQUE KEY `adver_title` (`adver_title`)
) ENGINE=MyISAM AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='广告表';

/* 咖派小秘书 */
CREATE TABLE `kp_secretary` (
  `secretary_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '小秘书id',
  `content` varchar(200) COLLATE utf8_bin DEFAULT NULL COMMENT '问题或回答的内容',
  `type` enum('c','a','q') COLLATE utf8_bin DEFAULT NULL COMMENT '常见问题c(common），问题q（question），回答a（answer）',
  `user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '提问或回答用户id',
  `answer_user_id` varchar(32) COLLATE utf8_bin DEFAULT NULL COMMENT '回答问题的后台管理人员',
  `answer_for` int(11) DEFAULT NULL COMMENT '针对哪一条问题的回答',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`secretary_id`),
  KEY `secretary_idx` (`secretary_id`),
  KEY `create_idx` (`create_date`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='咖派小秘书：常见问题，我的问题';

/* 豆币兑换金钱表 */
DROP TABLE IF EXISTS `kp_money`;
CREATE TABLE `kp_money` (
  `money_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `bean` int(11)  COMMENT '所需豆币',
  `money` int(11) COMMENT '豆币兑换的金钱',
  `state` int(1) DEFAULT 1 COMMENT '状态',
  `sort` int(1) DEFAULT 0 COMMENT '排序顺序',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`money_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='豆币兑换金钱表';


/* 咖派礼品表 */
DROP TABLE IF EXISTS `kp_gift`;
CREATE TABLE `kp_gift` (
  `gift_id` varchar(32) COLLATE utf8_bin NOT NULL,
  `gift_name` varchar(32)  COMMENT '礼品名称',
  `bean` int(11) COMMENT '所需豆币',
  `picture_path` varchar(120) DEFAULT NULL COMMENT '图片路径',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`gift_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='咖派礼品表';

/* 用户兑换礼品关系表 */
DROP TABLE IF EXISTS `kp_user_gift`;
CREATE TABLE `kp_user_gift` (
  `id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32)  COMMENT '用户编号',
  `gift_id` varchar(32)  COMMENT '礼品编号',
  `freeze_bean` int(11) DEFAULT 0 COMMENT '冻结豆币',
  `state` int(1) DEFAULT 0 COMMENT '0:待确认 1：已准备 2:已发送 -1:已取消',
  `express_name` varchar(32) DEFAULT NULL COMMENT '快递名称',
  `express_number` varchar(32) DEFAULT NULL  COMMENT '快递单号',
  `remarks` varchar(32) DEFAULT NULL,
  `exchange_time` datetime DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='咖派用户兑换礼品关系表';

/* 打卡礼品表 */
DROP TABLE IF EXISTS `kp_record_gift`;
CREATE TABLE `kp_record_gift` (
  `id` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '用户的id',
  `ticket_id` int(10) NOT NULL COMMENT '该类型兑换券的编号，具体信息需关联表ticket',
  `state` int(10) DEFAULT 0 COMMENT '0:待确认 1:准备中 2:已发送 -1:已删除',
  `exchange_date` datetime DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='打卡礼品表';

/* 组织--豆币兑换金钱关系表 */
DROP TABLE IF EXISTS `kp_org_exchange_money`;
CREATE TABLE `kp_org_exchange_money` (
  `id` varchar(32) COLLATE utf8_bin NOT NULL,
  `org_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '组织编号',
  `money` int(10) DEFAULT 0 COMMENT '豆币所兑换的金钱',
  `bean` int(10) DEFAULT 0 COMMENT '所需豆币',
  `alipay` varchar(32) DEFAULT NULL COMMENT '支付宝账号',
  `state` int(10) DEFAULT 0 COMMENT '0:待确认 1:兑换中 2:已完成',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='组织--豆币兑换金钱关系表';

/** 邀请码表新增字段 */
alter table invitation_code add column type int(2) default 0 comment '区分韩豆和咖派' after state;

alter table kp_user_gift change state state int(1) DEFAULT 0 COMMENT '0:待确认 1：已准备 2:已发送 -1:已取消 -2:已删除';
alter table news_comment add column type enum('kp','hd') DEFAULT 'hd' COMMENT 'kp咖派，kd韩豆';
alter table fans_group change picture_fan_group card_number int(11) DEFAULT 100000 comment '用于标记该粉丝团身份卡号，每次有粉丝加入都增加';
//同时需要修改id_card表中的card_number字段为非自增类型

//资讯多说反向同步最后一条评论id
DROP TABLE IF EXISTS news_comment_log_id;
CREATE TABLE `news_comment_log_id` (
  `id` tinyint(4) NOT NULL DEFAULT '1' COMMENT '记录id',
  `last_log_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '最后更新一条id,下次以此为七点',
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='多说反向同步评论，最后一条评论id,每次同步从本条记录开始';


//微博topic表
CREATE TABLE `weibo_topic` (
  `topic_id` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `topic_number` int(11) NOT NULL AUTO_INCREMENT COMMENT 'topic自增ID',
  `topic_name` varchar(300) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '帖子名称',
  `topic_desc` varchar(2000) COLLATE utf8mb4_bin DEFAULT '' COMMENT '帖子内容',
  `topic_pics` varchar(2000) COLLATE utf8mb4_bin DEFAULT '' COMMENT '图片路径',
  `topic_state` int(2) DEFAULT '1' COMMENT '帖子状态：0未审核，1已审核，-1已删除',
  `u_id` varchar(32) COLLATE utf8mb4_bin NOT NULL COMMENT '发布者的id',
  `since_id` bigint(50) DEFAULT '0' COMMENT '微博id',
  `created_at` datetime DEFAULT NULL COMMENT '微博创建时间',
  `create_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `topic_number_unique_key` (`topic_number`),
  KEY `create_idx` (`create_date`),
  KEY `since_idx` (`since_id`),
  KEY `user_id_idx` (`u_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='微博帖子表';





/*组织审核表新增字段*/
alter table org_verify add column access_token varchar(32) comment 'accessToken' after update_date;
alter table org_verify add column token_state int(2)  DEFAULT NULL  comment '记录token是否有效' after access_token;



/*奖品设置表*/
CREATE TABLE `kp_ticket_set` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(2) NOT NULL COMMENT '关联的ticket表中的ticket_id',
  `ticket_name` varchar(20) COLLATE utf8_bin NOT NULL COMMENT '奖品名称',
  `ticket_count` int(2) NOT NULL COMMENT '数量',
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='奖品设置表';



/*app日志表*/
DROP TABLE IF EXISTS kp_log;
CREATE TABLE `kp_log` (
  `lid` int(3) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '用户ID',
  `log` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT '日志文件地址信息',
  `state` int(2) DEFAULT '1' COMMENT '状态 1激活、0 冻结',
  `mobile_type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `platform_type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `software_version` int(4) DEFAULT NULL,
  `os_version` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  PRIMARY KEY (`lid`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='app日志表';

/*视频表*/
DROP TABLE IF EXISTS kp_video;
CREATE TABLE `kp_video` (
  `video_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'video自增ID',
  `video_desc` varchar(2000) COLLATE utf8mb4_bin DEFAULT '' COMMENT '视频简介',
  `video_address` varchar(100) COLLATE utf8mb4_bin DEFAULT '' COMMENT '视频地址',
  `picture` varchar(50) COLLATE utf8mb4_bin DEFAULT '' COMMENT '视频截图',
  `like_count` int(11) DEFAULT '0' COMMENT '点赞数',
  `share_count` int(11) DEFAULT '0' COMMENT '分享数',
  `read_count` int(11) DEFAULT '0' COMMENT '阅读数',
  `video_state` int(2) DEFAULT '1' COMMENT '状态值1为激活、0为冻结',
  `create_date` datetime NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`video_id`),
  KEY `create_date_idx` (`create_date`),
  KEY `like_count_idx` (`like_count`),
  KEY `read_count_idx` (`read_count`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='视频表';


alter table kp_secretary add column state int(2) default 0 comment '状态 0 未回答、1已回答' after answer_for;









