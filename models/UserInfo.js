/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserInfo = sequelize.define('user_info', {
    user_info_id: { type: Sequelize.STRING, primaryKey: true},
    nick_name: Sequelize.STRING,
    phone: Sequelize.STRING,
    user_info_state: Sequelize.INTEGER,
    user_id: Sequelize.STRING,
    user_integral: Sequelize.STRING,
    gender: Sequelize.STRING,
    country:Sequelize.STRING,
    country_code:Sequelize.STRING,
    device_id:Sequelize.STRING,
    os_version:Sequelize.STRING,
    software_version: Sequelize.STRING,
    platform_type: Sequelize.STRING,
    mobile_type: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user_info',
    timestamps: false
});
module.exports = UserInfo;

UserInfo.belongsTo(require('./User'),{foreignKey: 'user_id'});

