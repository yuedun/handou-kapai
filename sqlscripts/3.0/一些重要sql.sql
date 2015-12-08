-- 昨日活跃=昨日打卡人数/100+昨日发帖总数+昨日创建频道数（最多一个）*10（粉丝数除不进时，按四舍五入方式进行判断）

SELECT org_id AS org_id, ROUND(COUNT(*)/100) AS c from org_user_record GROUP BY org_id; -- 某组织打卡数
SELECT t.user_id AS org_id, COUNT(*) AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type < 2 AND ku.user_type='org' GROUP BY org_id; -- 发频道总数
SELECT t.user_id AS org_id, COUNT(*) AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type > 1 AND ku.user_type='org' GROUP BY org_id; -- 发帖总数

SELECT oc.org_id, COUNT(*) FROM ((SELECT org_id AS org_id, ROUND(COUNT(*)/100) AS c from org_user_record GROUP BY org_id) UNION
(SELECT t.user_id AS org_id, COUNT(*)*3 AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type < 2 AND ku.user_type='org' GROUP BY org_id) UNION
(SELECT t.user_id AS org_id, COUNT(*) AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type > 1 AND ku.user_type='org' GROUP BY org_id)
) AS oc GROUP BY org_id


SELECT final.org_id AS userId, ku.nick_name AS nickName, MAX(final.active) AS active, ku.user_type FROM
(
	SELECT oc.org_id AS org_id, SUM(oc.c) AS active FROM ((SELECT org_id AS org_id, ROUND(COUNT(*)/100) AS c from org_user_record GROUP BY org_id) UNION
	(SELECT t.user_id AS org_id, COUNT(*)*3 AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type < 2 AND ku.user_type='org' GROUP BY org_id) UNION
	(SELECT t.user_id AS org_id, COUNT(*) AS c FROM topic t LEFT JOIN kp_user ku ON t.user_id=ku.user_id WHERE t.topic_type > 1 AND ku.user_type='org' GROUP BY org_id)
	) AS oc GROUP BY org_id ORDER BY active DESC
) final INNER JOIN kp_user ku ON final.org_id = ku.user_id


-- 行程
SELECT
	t.travel_id AS travelId,
	t.travel_content AS travelContent,
	t.travel_date AS travelDate
FROM
	travel t
WHERE
	t.category_id = 'cdcc95457bc846f2abea9a6b06a8bec8'
AND t.travel_date = DATE_FORMAT(NOW(), '%Y-%m-%d') ORDER BY t.travel_date DESC;


-- 资讯
SELECT
	n.news_id AS newsId,
	n.title_zh AS titleZh
FROM
	news n
INNER JOIN news_cate_relation ncr ON n.news_id = ncr.news_id
WHERE
	ncr.category_id = 'cdcc95457bc846f2abea9a6b06a8bec8'
 AND n.create_date = DATE_FORMAT(NOW(), '%Y-%m-%d')  ORDER BY n.create_date DESC;


-- sns
SELECT * FROM post p where p.distinguish_status = 1;
SELECT * FROM post_column_relation pcr WHERE pcr.category_id = 'cdcc95457bc846f2abea9a6b06a8bec8';

SELECT
	p.post_id AS postId,
	p.post_description AS postDesc
FROM
	post_column_relation pcr
INNER JOIN post p ON pcr.post_id = p.post_id
WHERE
	pcr.category_id = 'cdcc95457bc846f2abea9a6b06a8bec8'
 AND p.create_date = DATE_FORMAT(NOW(), '%Y-%m-%d')  ORDER BY p.create_date DESC;


-- 导原粉丝团表部分数据到新粉丝团（明星表）INSERT INTO 目标表 (字段1, 字段2, ...) SELECT 字段1, 字段2, ... FROM 来源表;
INSERT INTO fans_group (
	group_id,
	star_name,
	group_name,
	create_date
) SELECT
	c.category_id AS group_id,
	c.category_name AS star_name,
	c.category_name AS group_name,
	c.create_date AS create_date
FROM
	category c where c.column_type_id = '100001'
	
-- 官方后台面向全体和粉丝团推送的固定用户
INSERT INTO `handouer_cms`.`kp_user` (`user_id`, `user_name`, `password`, `nick_name`, `state`, `org_token`, `gender`, `head_portrait`, `birthday`, `center_background`, `fans_count`, `bean`, `user_type`, `country`, `country_code`, `this_life`, `device_id`, `mobile_type`, `platform_type`, `software_version`, `os_version`, `create_ip`, `create_date`, `update_date`, `push_installationId`, `push_objectId`, `push_channels`) VALUES ('1111111-777777777777777777777777', 'pushuser', '7777777', '推送用户', '1', NULL, '0', NULL, NULL, NULL, NULL, '0', 'user', '中国', '86', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2015-09-24 11:17:29', '2015-09-24 11:17:32', NULL, NULL, NULL);















