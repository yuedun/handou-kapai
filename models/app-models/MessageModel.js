/**
 * created by admin on 2015/8/17
 * 消息推送表
 */
var Sequelize = require('sequelize');
var sequelize = require('../../utils/sequelizeDB');

var MessageModel = sequelize.define('message', {
    messageId: { type: Sequelize.STRING, primaryKey: true,field:'message_id'},
    messageText: { type: Sequelize.STRING, field:'message_text'},
    sendUserId: { type: Sequelize.STRING, field:'send_user_id'},
    reciveUserId: { type: Sequelize.STRING, field:'recive_user_id'},
    topicId: { type: Sequelize.STRING, field:'topic_id'},
    pushGoal: { type: Sequelize.STRING, field:'push_goal'},
    chatType: { type: Sequelize.INTEGER, field:'chat_type'},
    officalType: { type: Sequelize.INTEGER, field:'offical_type'},
    releaseDate: { type: Sequelize.DATE, field:'release_date'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_message',
    timestamps: false
});

module.exports = MessageModel;
MessageModel.belongsTo(require('./UserModel'), {foreignKey: 'sendUserId', as: 'sendUser'});
MessageModel.belongsTo(require('./UserModel'), {foreignKey: 'reciveUserId', as: 'reciveUser'});





































