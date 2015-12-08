/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserGift = sequelize.define('user_gift', {
    id: { type: Sequelize.STRING, primaryKey: true},
    user_id: Sequelize.STRING,
    gift_id: Sequelize.STRING,
    freeze_integral: Sequelize.INTEGER,
    delivery_status: Sequelize.INTEGER, //0待确认，1准备中，2已发出，-1已取消
    express_name: Sequelize.STRING,
    express_number: Sequelize.STRING,
    exchange_time: Sequelize.DATE,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user_gift',
    timestamps: false
});
module.exports = UserGift;
UserGift.belongsTo(require('./User'),{foreignKey: 'user_id'});
UserGift.belongsTo(require('./Gift'),{foreignKey: 'gift_id'});

