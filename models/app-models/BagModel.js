/**
 * Created by admin on 2015/09/16.
 * 背包
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var BagModel = sequelize.define('bag', {
    bagId: { type: Sequelize.STRING, primaryKey: true,field:'bag_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    ticketAmount: { type: Sequelize.INTEGER, field:'ticket_amount'},
    ticketId: { type: Sequelize.INTEGER, field:'ticket_id'},
    createDate: { type: Sequelize.DATE, field:'create_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'bag',
    timestamps: false
});

module.exports = BagModel;
