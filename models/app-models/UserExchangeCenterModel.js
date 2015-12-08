/**
 * Created by admin on 2015/09/08.
 * 兑换中心表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserExchangeModel = sequelize.define('userExchange', {
    exchangeNo: { type: Sequelize.STRING, primaryKey: true,field:'exchange_no'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    exchangeType: { type: Sequelize.STRING, field:'exchange_type'},
    exchangeInfo: { type: Sequelize.STRING, field:'exchange_info'},
    operator: { type: Sequelize.STRING, field:'operator'},
    isFinish: { type: Sequelize.INTEGER, field:'is_finish'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_user_exchange_center',
    timestamps: false
});

module.exports = UserExchangeModel;
