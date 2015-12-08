/**
 * Created by admin on 2015/09/09.
 * 用户兑换礼品关系表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserGiftModel = sequelize.define('userGift', {
    id: { type: Sequelize.STRING, primaryKey: true,field:'id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    giftId: { type: Sequelize.STRING, field:'gift_id'},
    freezeBean: { type: Sequelize.INTEGER, field:'freeze_bean'},
    state: { type: Sequelize.INTEGER, field:'state'},
    expressName: { type: Sequelize.STRING, field:'express_name'},
    expressNumber: { type: Sequelize.STRING, field:'express_number'},
    remarks: { type: Sequelize.STRING, field:'remarks'},
    exchangeTime: { type: Sequelize.DATE, field:'exchange_time'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_user_gift',
    timestamps: false
});

module.exports = UserGiftModel;
UserGiftModel.belongsTo(require('./UserModel'),{foreignKey: 'userId'});
UserGiftModel.belongsTo(require('./GiftModel'),{foreignKey: 'giftId'});
