/**
 * Created by admin on 2015/09/17.
 * 组织兑换金钱表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var ExchangeMoneyModel = sequelize.define('exchangeMoney', {
    id: { type: Sequelize.STRING, primaryKey: true,field:'id'},
    orgId: { type: Sequelize.STRING, field:'org_id'},
    money: { type: Sequelize.INTEGER, field:'money'},
    bean: { type: Sequelize.INTEGER, field:'bean'},
    alipay: { type: Sequelize.STRING, field:'alipay'},
    state: { type: Sequelize.INTEGER, field:'state'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_org_exchange_money',
    timestamps: false
});

module.exports = ExchangeMoneyModel;
