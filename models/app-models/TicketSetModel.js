/**
 * Created by admin on 2015/10/22.
 * 奖品设置表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var TicketSetModel = sequelize.define('ticketSet', {
    id: { type: Sequelize.INTEGER, primaryKey: true,field:'id'},
    ticketId: { type: Sequelize.INTEGER, field:'ticket_id'},
    ticketName: { type: Sequelize.STRING, field:'ticket_name'},
    ticketCount: { type: Sequelize.INTEGER, field:'ticket_count'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_ticket_set',
    timestamps: false
});

module.exports = TicketSetModel;
