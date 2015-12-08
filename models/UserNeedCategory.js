/**
 * 用户需要的粉丝团
 * @type {Sequelize|exports}
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserNeedCategory = sequelize.define('user_need_category', {
    unc_id: { type: Sequelize.STRING, primaryKey: true},
    feedback: Sequelize.STRING,
    phone: Sequelize.STRING,
    user_qq: Sequelize.STRING,
    unc_state: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user_need_category',
    timestamps: false
});

module.exports = UserNeedCategory;
