/**
 * Created by admin on 2015/09/09.
 * 咖派礼品表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var GiftModel = sequelize.define('gift', {
    giftId: { type: Sequelize.STRING, primaryKey: true,field:'gift_id'},
    giftName: { type: Sequelize.STRING, field:'gift_name'},
    bean: { type: Sequelize.INTEGER, field:'bean'},
    picturePath: { type: Sequelize.STRING, field:'picture_path'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_gift',
    timestamps: false
});

module.exports = GiftModel;
GiftModel.belongsToMany(require('./UserModel'),{through: require('./UserGiftModel'), foreignKey: 'giftId'});
