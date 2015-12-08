/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Gift = sequelize.define('gift', {
    id: { type: Sequelize.STRING, primaryKey: true},
    gift_name: Sequelize.STRING,
    picture_path: Sequelize.STRING,
    integral: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'gift',
    timestamps: false
});

module.exports = Gift;
Gift.belongsToMany(require('./User'),{through: require('./UserGift'), foreignKey: 'gift_id'});
