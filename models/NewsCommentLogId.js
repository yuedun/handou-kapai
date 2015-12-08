/**
 * Created by admin on 2015/1/26.
 * 用户地址表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var NewsComLogId = sequelize.define('newscomlog', {
    id: { type: Sequelize.INTEGER, primaryKey: true, field: "id"},
    lastLogId: { type: Sequelize.INTEGER, field: "last_log_id"},
    updateAt: {type: Sequelize.DATE, field: "update_at"}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'news_comment_log_id',
    timestamps: false
});

module.exports = NewsComLogId;


