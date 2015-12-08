/**
 * Created by admin on 2015/5/18.
 * 资讯表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var NewsComment = sequelize.define('news_comment', {
    comment_id: { type: Sequelize.STRING, primaryKey: true},
    comment_content: Sequelize.STRING,
    reply_user_id: Sequelize.STRING,
    reply_comment_id: Sequelize.STRING,
    reply_nick_name: Sequelize.STRING,
    is_reply: Sequelize.INTEGER,
    comment_state: Sequelize.INTEGER,
    comment_type: Sequelize.STRING,
    user_id: Sequelize.STRING,
    news_id: Sequelize.STRING,
    news_type: Sequelize.INTEGER,
    sort_field: Sequelize.INTEGER,
    creator_ip: Sequelize.STRING,
    comment_voice: Sequelize.STRING,
    voice_time: Sequelize.INTEGER,
    like_count: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'news_comment',
    timestamps: false
});

module.exports = NewsComment;
NewsComment.belongsTo(require('./News'), {foreignKey: 'news_id'});
NewsComment.belongsTo(require('./User'), {foreignKey: 'user_id'});//本表中有User表的外键
NewsComment.belongsTo(require('./app-models/UserModel'), {foreignKey: 'user_id'});//本表中有User表的外键
NewsComment.hasMany(require('./NewsCommentLikeRelation'), {foreignKey: 'news_comment_id'});//一条评论被多个用户点赞

