/**
 * Created by hp on 2015/7/23.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var OrgUserRelation = sequelize.define('orgUserRelation', {
    relationId: { type: Sequelize.STRING, primaryKey: true, field:'relation_id'},
    orgId: {type:Sequelize.STRING,field:'org_id'},
    userId: {type: Sequelize.STRING, field:'user_id'},
    createDate: {type: Sequelize.DATE,field:'create_date'},
    updateDate: {type:Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步If freezeTableName is true, sequelize will not try to alter the DAO name to get the table name. Otherwise, the model name will be pluralized
    tableName: 'org_user_relation',
    timestamps: false
});

module.exports = OrgUserRelation;
OrgUserRelation.belongsTo(require('./UserModel'), {foreignKey: 'orgId'});
OrgUserRelation.belongsTo(require('./UserModel'), {foreignKey: 'userId'});
