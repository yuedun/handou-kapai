/**
 * Created by admin on 2015/6/10.
 * 资讯的评论点赞关系表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var NewsCommentLikeRelation = sequelize.define('news_comment_like_relation', {
    like_relation_id: { type: Sequelize.STRING, primaryKey: true},
    news_comment_id: Sequelize.STRING,
    user_id: Sequelize.STRING,
    state: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'news_comment_like_relation',
    timestamps: false
});

module.exports = NewsCommentLikeRelation;
NewsCommentLikeRelation.belongsTo(require('./NewsComment'), {foreignKey: 'news_comment_id'});
