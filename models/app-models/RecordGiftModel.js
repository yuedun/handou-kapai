/**
 * Created by admin on 2015/09/16.
 * 打卡礼品表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var RecordGiftModel = sequelize.define('RecordGift', {
    id: { type: Sequelize.STRING, primaryKey: true,field:'id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    ticketId: { type: Sequelize.INTEGER, field:'ticket_id'},
    state: { type: Sequelize.INTEGER, field:'state'},
    exchangeDate: { type: Sequelize.DATE, field:'exchange_date'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_record_gift',
    timestamps: false
});

module.exports = RecordGiftModel;
