/**
 * Created by admin on 2015/7/20.
 * 用户地址表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var IdCardModel = sequelize.define('idCard', {
    cardId: { type: Sequelize.STRING, primaryKey: true,field:'card_id'},
    cardNumber: { type: Sequelize.INTEGER, field:'card_number'},
    groupId: { type: Sequelize.STRING, field:'group_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    cardState: { type: Sequelize.INTEGER, field:'card_state'},
    type: { type: Sequelize.INTEGER, field:'type'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'id_card',
    timestamps: false
});

module.exports = IdCardModel;
IdCardModel.belongsTo(require('./GroupModel'),{foreignKey: 'groupId'});
IdCardModel.belongsTo(require('./UserModel'),{foreignKey: 'userId'});