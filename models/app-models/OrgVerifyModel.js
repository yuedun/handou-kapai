var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var OrgVerifyModel = sequelize.define('OrgVerify', {
    orgVerifyId: { type: Sequelize.STRING, primaryKey: true,field:'org_verify_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    verifier: { type: Sequelize.STRING, field:'verifier'},
    orgType: { type: Sequelize.STRING, field:'org_type'},
    groupId: { type: Sequelize.STRING, field:'group_id'},
    verifyState: { type: Sequelize.INTEGER, field:'verify_state'},
    verifyDate: { type: Sequelize.DATE, field:'verify_date'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'},
    accessToken: { type: Sequelize.STRING, field:'access_token'},
    tokenState: { type: Sequelize.INTEGER, field:'token_state'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'org_verify',
    timestamps: false
});
module.exports = OrgVerifyModel;
OrgVerifyModel.belongsTo(require('./UserModel'),{foreignKey: 'userId'});
OrgVerifyModel.belongsTo(require('./GroupModel'),{foreignKey: 'groupId'});



