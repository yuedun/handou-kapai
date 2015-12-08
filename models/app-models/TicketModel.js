/**
 * Created by admin on 2015/09/07
 * 兑换券
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var ticketModel = sequelize.define('ticket', {
    ticketId: { type: Sequelize.STRING, primaryKey: true,field:'ticket_id'},
    ticketType: { type: Sequelize.INTEGER, field:'ticket_type'},
    ticketName: { type: Sequelize.STRING, field:'ticket_name'},
    parValue: { type: Sequelize.INTEGER, field:'par_value'},
    ticketPictureUrl: { type: Sequelize.STRING, field:'ticket_picture_url'},
    isSubstance: { type: Sequelize.INTEGER, field:'is_substance'},
    ticketUsage: { type: Sequelize.STRING, field:'ticket_usage'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'ticket',
    timestamps: false
});

module.exports = ticketModel;
