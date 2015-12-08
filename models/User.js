/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var User = sequelize.define('user', {
    user_id: { type: Sequelize.STRING, primaryKey: true},
    user_name: Sequelize.STRING,
    user_password: Sequelize.STRING,
    user_state: Sequelize.INTEGER,
    user_identify: Sequelize.INTEGER,
    position: Sequelize.STRING,
    creator_ip: Sequelize.STRING,
    creator: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user',
    timestamps: false
});
module.exports = User;
User.hasOne(require('./IntegralRelation'),{foreignKey: 'user_id'});
User.hasOne(require('./UserInfo'),{foreignKey: 'user_id'});
User.hasOne(require('./Address'),{foreignKey: 'user_id'});
User.belongsToMany(require('./Gift'),{through: require('./UserGift'), foreignKey: 'user_id'});
User.belongsToMany(require('./Category'),{through: require('./CategoryRelation'), foreignKey: 'user_id'});
User.hasOne(require('./NewsComment'), {foreignKey: 'user_id'});


