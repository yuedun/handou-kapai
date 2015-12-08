/**
 * Created by admin on 2015/10/15.
 * 微博帖子表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var WeiboTopicModel = sequelize.define('weiboTopic', {
    topicId: { type: Sequelize.STRING, primaryKey: true,field:'topic_id'},
    topicNumber: { type: Sequelize.INTEGER, field:'topic_number'},
    topicName: { type: Sequelize.STRING, field:'topic_name'},
    topicDesc: { type: Sequelize.STRING, field:'topic_desc'},
    topicPics: { type: Sequelize.STRING, field:'topic_pics'},
    topicState: { type: Sequelize.INTEGER, field:'topic_state'},
    uId: { type: Sequelize.STRING, field:'u_id'},
    sinceId: { type: Sequelize.INTEGER, field:'since_id'},
    createdAt: { type: Sequelize.DATE, field:'created_at'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'weibo_topic',
    timestamps: false
});

module.exports = WeiboTopicModel;
