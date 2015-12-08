/**
 * Created by admin on 2015/8/12.
 * 记录连续签到次数表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var SignInCountModel = sequelize.define('signInCount', {
    signInId: { type: Sequelize.STRING, primaryKey: true,field:'sign_in_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    signInCount: { type: Sequelize.INTEGER, field:'sign_in_count'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'sign_in_count',
    timestamps: false
});

module.exports = SignInCountModel;
