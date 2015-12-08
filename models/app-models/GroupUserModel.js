/**
 * Created by admin on 2015/7/20.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var GroupUserRelation = sequelize.define('GroupUserRelation', {
    groupRelationId: { type: Sequelize.STRING, primaryKey: true, field: 'group_relation_id'},
    groupRelationState: { type: Sequelize.INTEGER, field: 'group_relation_state' },
    selectionState: { type: Sequelize.INTEGER, field: 'selection_state' },
    userId: { type: Sequelize.STRING, field: 'user_id' },
    groupId: { type: Sequelize.STRING, field: 'group_id' },
    userType: { type: Sequelize.STRING, field: 'user_type' },
    createDate: { type: Sequelize.DATE, field: 'create_date' },
    updateDate: { type: Sequelize.DATE, field: 'update_date' }
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'group_user_relation',
    timestamps: false,
    comment: '粉丝团用户关系表.'
});
//导出Topic数据模型对象
module.exports = GroupUserRelation;
// 数据模型关系
GroupUserRelation.belongsTo(require('./UserModel'), {foreignKey: 'userId'});
GroupUserRelation.belongsTo(require('./GroupModel'), {foreignKey: 'groupId'});