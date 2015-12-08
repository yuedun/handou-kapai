/**
 * 台词表
 * @type {Sequelize|exports}
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var FeedbackPds = sequelize.define('feedback_pds', {
    feedback_id: { type: Sequelize.STRING, primaryKey: true},
    feedback: Sequelize.STRING,
    mobile_type: Sequelize.STRING,
    user_qq: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'feedback_pds',
    timestamps: false
});

module.exports = FeedbackPds;
