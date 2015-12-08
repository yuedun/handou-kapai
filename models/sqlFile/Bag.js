/**
 * Created by thinkpad on 2015/7/23.
 */
var Bag = function () {
};

Bag.DAKATicketID = {
    DailyDaka:1,
    Daka:2
};

Bag.EXCHANGE_TYPE = {
    ALBUM:'专辑兑换',
    GIFT:'礼包兑换'
};

Bag.getTicketsInBag = function () {
    var sql = "select bag_id,user_id,ticket_amount,ticket.ticket_id,ticket_type,ticket_picture_url,ticket_name,ticket_usage,produceDate,expireDate from bag,ticket where user_id =:userId and bag.ticket_id=ticket.ticket_id";
    return sql;
};

/**
 * 查询是否有效的兑换操作，需要判断：
 * 1、兑换券数量是否有效，及兑换券的总数大于等于兑换量
 * @param params
 */
Bag.isValidExchange = function (params) {
    var userId = params.userId;
    var ticketId = params.ticketId;
    var ticketAmount = params.ticketAmount;

    var sql = "select * from bag where user_id='" + userId + "' and ticket_id=" + ticketId + " and ticket_amount>=" + ticketAmount;
    //
    //console.log(params);
    //console.log(sql);

    return sql;
};

/**
 * 兑换券兑换
 * @param params
 */
Bag.useTicketInBag = function (params) {
    var userId = params.userId;
    var ticketId = params.ticketId;
    var ticketAmount = params.ticketAmount;

    var sql = "update bag set ticket_amount=ticket_amount-" + ticketAmount + " where user_id='" + userId + "' and ticket_id=" + ticketId;
    return sql;
};

Bag.deleteTicketInBag = function (params) {
    var userId = params.userId;
    var ticketId = params.ticketId;

    var sql = "delete from bag where user_id='" + userId + "' and ticket_id=" + ticketId;
    return sql;
};

/**
 * 将数量为0的兑换券，从用户背包中删除,除了每日打卡券
 * @param params
 * @returns {string}
 */
Bag.clearTicketInBag = function (params) {
    var userId = params.userId;

    var sql = "delete from bag where user_id='" + userId + "' and ticket_amount=0 and ticket_id!="+Bag.DAKATicketID.DailyDaka;
    return sql;
};

/**
 * 获得指定券的面值
 * @param params
 */
Bag.getTicketParValue = function (params) {
    var ticketId = params.ticketId;
    var sql = "select par_value from ticket where ticket_id=" + ticketId;
    return sql;
};

/**
 * 向用户背包中添加兑换券
 * @param params
 * @returns {string}
 */
Bag.addTicket = function () {
    var sql = "insert into bag values(:bagId,:userId,:ticketAmount,:ticketId,:createDate)";
    return sql;
};

/**
 * 更新每日打卡券数量，每日打卡券每天只有5张
 * @param params
 * @returns {string}
 */
Bag.updateDailyTicketofDaka = function () {
    var sql = "update bag set ticket_amount=5,create_date=SYSDATE() where user_id=:userId and date(create_date) != date(SYSDATE()) and ticket_id="+Bag.DAKATicketID.DailyDaka;
    return sql;
};

/**
 * 确认是否存在每日打卡券的记录
 * @returns {string}
 */
Bag.confirmDailyTicketofDaka = function(){
    var sql = "select * from bag where user_id=:userId and ticket_id="+Bag.DAKATicketID.DailyDaka;
    return sql;
};

/**
 * 获得当前用户打卡券总数
 * @returns {string}
 */
Bag.getTotalTicketsofDaka = function(){
    var sql = "SELECT sum(ticket_amount) total_amount FROM bag where user_id=:userId and (ticket_id="+Bag.DAKATicketID.DailyDaka+" or ticket_id="+Bag.DAKATicketID.Daka+")";
    return sql;
};

/**
 * 确定当前用户每日打卡券数量是否充足
 * @returns {string}
 */
Bag.hasEnoughTicketofDailyDaka = function(){
    var sql = "SELECT * FROM bag where user_id=:userId and ticket_amount>0 and ticket_id="+Bag.DAKATicketID.DailyDaka;
    return sql;
};

/**
 * 获得除了每日打卡券以外的奖券
 * @returns {string}
 */
Bag.getTicketListWithoutDailyDaka = function(){
    var sql = "select * from ticket where ticket_id!="+Bag.DAKATicketID.DailyDaka;
    return sql;
};

/**
 * 判断是否有相同类型的券
 * @returns {string}
 */
Bag.hasSameTicketRecord = function(){
    var sql = "select * from bag where user_id=:userId and ticket_id=:ticketId";
    return sql;
};

/**
 * 向背包中增加兑换券数量
 * @returns {string}
 */
Bag.updateTicketAmount = function(){
    var sql = "update bag set ticket_amount=ticket_amount+:ticketAmount where user_id=:userId and ticket_id=:ticketId";
    return sql;
};

/**
 * 保存兑换详细记录
 * @returns {string}
 */
Bag.insertExchangeInfo = function(){
    var sql = "insert into kp_user_exchange_center(exchange_no,user_id,exchange_type,exchange_info,create_date) values(:exchangeNo,:userId,:exchangeType,:exchangeInfo,:createDate)";
    return sql;
};

module.exports = Bag;
