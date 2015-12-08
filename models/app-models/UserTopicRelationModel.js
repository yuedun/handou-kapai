/**
 * Created by admin on 2015/7/20.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserTopicRelation = sequelize.define('UserTopicRelation', {
    relationId: { type: Sequelize.STRING, primaryKey: true, field: 'relation_id' },
    topicId: { type: Sequelize.STRING, field: 'topic_id' },
    userId: { type: Sequelize.STRING, field: 'user_id' },
    relationState: { type: Sequelize.INTEGER, field: 'relation_state' },
    isHost: { type: Sequelize.INTEGER, field: 'is_host' },
    createDate: { type: Sequelize.DATE, field: 'create_date' },
    updateDate: { type: Sequelize.DATE, field: 'update_date' }
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user_topic_relation',
    timestamps: false
});
//导出UserTopicRelation数据模型对象
module.exports = UserTopicRelation;
// 数据模型关系