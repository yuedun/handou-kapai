var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var InvitationCode = sequelize.define('invitationCode', {
    invitationCodeId: { type: Sequelize.STRING, primaryKey: true,field:'invitation_code_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    nickName: { type: Sequelize.STRING, field:'nick_name'},
    phone: { type: Sequelize.STRING, field:'phone'},
    userName: { type: Sequelize.STRING, field:'user_name'},
    code: { type: Sequelize.STRING, field:'code'},
    useCount: { type: Sequelize.INTEGER, field:'use_count'},
    state: { type: Sequelize.INTEGER, field:'state'},
    type: { type: Sequelize.INTEGER, field:'type'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'invitation_code',
    timestamps: false
});
module.exports = InvitationCode;



