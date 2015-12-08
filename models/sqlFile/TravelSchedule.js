/**
 * Created by thinkpad on 2015/7/19.
 */
function TravelSchedule() {
    var sql = "";
}

/**
 * 获得本月行程
 * @param month
 * @returns {*}
 */
TravelSchedule.getMonthSchedule = function () {
    return 'SELECT * from travel where category_id=:categoryId and travel_date >=:currentMonth and travel_date<:nextMonth';
};
/**
 * 今日行程
 * @returns {string}
 */
TravelSchedule.todayTravel = function () {
    return "SELECT"+
        " t.travel_id AS postId,"+
        " t.travel_content AS postDesc,"+
        " 'travel' AS type"+
        " FROM travel t WHERE"+
        " t.category_id = :groupId"+
        " AND DATE_FORMAT(t.travel_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')"+
        " ORDER BY t.travel_date DESC;";
};
/**
 * 今日资讯
 * @returns {string}
 */
TravelSchedule.todayNews = function () {
    return "SELECT"+
        " n.news_id AS postId,"+
        " n.title_zh AS postDesc,"+
        " 'news' AS type"+
        " FROM news n"+
        " INNER JOIN news_cate_relation ncr ON n.news_id = ncr.news_id"+
        " WHERE"+
        " ncr.category_id = :groupId" +
        " AND ((n.state = 0 AND n.release_date is NULL" +
        " AND n.create_date between DATE_ADD(CURDATE(), INTERVAL 1 MINUTE) and NOW())"+
        " OR n.release_date between DATE_ADD(CURDATE(), INTERVAL 1 MINUTE) and NOW()) ";
};
/**
 * 今日sns
 * @returns {string}
 */
TravelSchedule.todaySns = function () {
    return "SELECT"+
        " p.post_id AS postId,"+
        " p.post_description AS postDesc,"+
        " 'sns' AS type"+
        " FROM"+
        " post_column_relation pcr"+
        " INNER JOIN post p ON pcr.post_id = p.post_id"+
        " WHERE"+
        " pcr.category_id = :groupId"+
        " AND p.distinguish_status = 1"+
        " AND DATE_FORMAT(p.create_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')"+
        " ORDER BY p.create_date DESC;";
};
/**
 * 常见问题
 * @returns {string}
 */
TravelSchedule.commonQuestion = function () {
    return "SELECT "
        +" ks1.secretary_id AS secretaryId,"
        +" ks1.content AS question,"
        +" ks2.content AS answer "
        +" FROM "
        +" kp_secretary ks1 "
        +" INNER JOIN kp_secretary ks2 ON ks1.secretary_id = ks2.answer_for "
        +" AND ks1.type = :type";
};

module.exports = TravelSchedule;
