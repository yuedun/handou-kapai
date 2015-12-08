/**
 * Created by admin on 2015/7/20.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var TopicComment = sequelize.define('TopicComment', {
    commentId: { type: Sequelize.STRING, primaryKey: true, field: 'comment_id' },
    topicId: { type: Sequelize.STRING, field: 'topic_id' },
    commentContent: { type: Sequelize.STRING, field: 'comment_content' },
    replyUserId: { type: Sequelize.STRING, field: 'reply_user_id' },
    replyCommentId: { type: Sequelize.STRING, field: 'reply_comment_id' },
    replyNickName: { type: Sequelize.STRING, field: 'reply_nick_name' },
    isReply: { type: Sequelize.INTEGER, field: 'is_reply' },
    commentState: { type: Sequelize.INTEGER, field: 'comment_state' },
    userId: { type: Sequelize.STRING, field: 'user_id' },
    audioAddress: { type: Sequelize.STRING, field: 'audio_address'},
    audioTime: { type: Sequelize.INTEGER, field: 'audio_time'},
    likeCount: { type: Sequelize.INTEGER, field: 'like_count' },
    createDate: {type: Sequelize.DATE, field: 'create_date'},
    updateDate: { type: Sequelize.DATE, field: 'update_date' }
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'topic_comment',
    timestamps: false
});
//导出TopicComment数据模型对象
module.exports = TopicComment;
// 数据模型关系