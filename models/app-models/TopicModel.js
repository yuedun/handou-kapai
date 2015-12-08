/**
 * Created by admin on 2015/7/20.
 */
var dateUtils = require('../../utils/dateUtils');
var config = require('../../config/config.json');
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Topic = sequelize.define('topic', {
    topicId: { type: Sequelize.STRING, primaryKey: true, field: 'topic_id' },
    topicNumber: { type: Sequelize.INTEGER, field: 'topic_number'},
    topicName: { type: Sequelize.STRING, field: 'topic_name'},
    topicScope: {type: Sequelize.INTEGER, field: 'topic_scope' },
    topicDesc: {type: Sequelize.STRING,field: 'topic_desc'},
    parentTopicId: { type: Sequelize.STRING, field: 'parent_topic_id' },
    logo: {type: Sequelize.STRING, field: 'logo' },
    smallLogo: {type: Sequelize.STRING, field: 'small_logo' },
    audioAddress: { type: Sequelize.STRING, field: 'audio_address' },
    audioTime: {type: Sequelize.INTEGER,field: 'audio_time' },
    topicPics: {type: Sequelize.STRING, field: 'topic_pics' },
    picsSize: {type: Sequelize.STRING,field: 'pics_size' },
    topicState: {type: Sequelize.INTEGER,field: 'topic_state'},
    isRecommend: {type: Sequelize.INTEGER, field: 'is_recommend' },
    likeCount: {type: Sequelize.INTEGER, field: 'like_count'},
    shareCount: {type: Sequelize.INTEGER, field: 'share_count' },
    topicType: {type: Sequelize.INTEGER,field: 'topic_type'},
    userId: { type: Sequelize.STRING,field: 'user_id'},
    groupId: { type: Sequelize.STRING,field: 'group_id'},
    timedReleaseDate: { type: Sequelize.DATE,field: 'timed_release_date'},
    createDate: {type: Sequelize.DATE,field: 'create_date' },
    updateDate: { type: Sequelize.DATE, field: 'update_date' }
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'topic',
    timestamps: false,
    comment: '保存频道和频道帖子信息.'
});
//导出Topic数据模型对象
module.exports = Topic;
// 数据模型关系
Topic.belongsTo(require('./UserModel'), {foreignKey: 'userId'}); // 一个频道主属于一个人
Topic.belongsTo(require('./GroupModel'), {foreignKey: 'groupId'}); // 一个频道主属于一个人


