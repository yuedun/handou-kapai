/**
 * Created by admin on 2015/1/26.
 * 用户地址表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Address = sequelize.define('address', {
    address_id: { type: Sequelize.STRING, primaryKey: true},
    user_id: Sequelize.STRING,
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    postal_code: Sequelize.STRING,
    country: Sequelize.STRING,
    province: Sequelize.STRING,
    city: Sequelize.STRING,
    area: Sequelize.STRING,
    details: Sequelize.STRING,
    state: Sequelize.INTEGER,
    type: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'address',
    timestamps: false
});

module.exports = Address;
Address.belongsTo(require('./User'), {foreignKey: 'user_id'});
