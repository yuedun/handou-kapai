/**
 * 帖子表
 * @type {Sequelize|exports}
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Post = sequelize.define('post', {
    post_id: { type: Sequelize.STRING, primaryKey: true},
    post_description: Sequelize.STRING,
    audio_address: Sequelize.STRING,
    audio_time: Sequelize.STRING,
    like_count: Sequelize.INTEGER,
    share_count: Sequelize.INTEGER,
    user_id: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'post',
    timestamps: false //不自动添加时间戳createAt，updateAt
});
module.exports = Post;
Post.belongsTo(require('./User'),{foreignKey: 'user_id'});
/**
 * Post表中有UserInfo的外键user_id，用belongTo
 * 在UserInfo表中用hasOne
 */
