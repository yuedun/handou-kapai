/**
 * Created by admin on 2015/7/20.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Group = sequelize.define('Group', {
    groupId: { type: Sequelize.STRING, primaryKey: true, field: 'group_id' },
    starName: { type: Sequelize.STRING, field: 'star_name', comment: "明星名称" },
    starLogo: { type: Sequelize.STRING, field: 'star_logo', comment: "明星logo" },
    groupName: { type: Sequelize.STRING, field: 'group_name', unique: true, comment: "粉丝团名称" },
    groupLogo: { type: Sequelize.STRING, field: 'group_logo' },
    groupState: { type: Sequelize.INTEGER, field: 'group_state' },
    fanCount: { type: Sequelize.INTEGER, field: 'fan_count' },
    cardNumber: { type: Sequelize.INTEGER, field: 'card_number' },
    createDate: { type: Sequelize.DATE, field: 'create_date', allowNull: false, defaultValue: Sequelize.NOW, validate: { isDate: true } },
    updateDate: { type: Sequelize.DATE, field: 'update_date', allowNull: false, defaultValue: Sequelize.NOW }
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'fans_group',
    timestamps: false,
    comment: '粉丝团表.'
});
//导出Topic数据模型对象
module.exports = Group;
// 数据模型关系
Group.hasOne(require('./IdCardModel'), {foreignKey: 'groupId'});
Group.belongsToMany(require('./UserModel'), { through: 'GroupUserModel', foreignKey: 'groupId'});//粉丝团与用户关系，由一个粉丝团获取多个粉丝
Group.hasOne(require('./GroupUserModel'), {foreignKey: 'groupId'});//由一个粉丝团获取一个粉丝，需要在查询时带上userId参数才能确定一条关系
Group.hasMany(require('./UserModel'), {foreignKey: 'groupId'});
