/**
 * Created by admin on 2015/09/07.
 * 豆币兑换金钱表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var MoneyModel = sequelize.define('money', {
    moneyId: { type: Sequelize.STRING, primaryKey: true,field:'money_id'},
    bean: { type: Sequelize.INTEGER, field:'bean'},
    money: { type: Sequelize.INTEGER, field:'money'},
    state: { type: Sequelize.INTEGER, field:'state'},
    sort: { type: Sequelize.INTEGER, field:'sort'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_money',
    timestamps: false
});

module.exports = MoneyModel;

