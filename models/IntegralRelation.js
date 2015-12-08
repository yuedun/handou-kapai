/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
//var User = require('./User');
var Sequelize = require('sequelize');
var IntegralRelation = sequelize.define('integral_relation', {
    integral_relation_id: { type: Sequelize.STRING, primaryKey: true},
    user_id: Sequelize.STRING,
    integral_type: Sequelize.INTEGER,
    integral_value: Sequelize.INTEGER,
    integral_date: Sequelize.DATE,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'integral_relation',
    timestamps: false
});
module.exports = IntegralRelation;
IntegralRelation.belongsTo(require('./User'), {foreignKey: 'user_id'});
