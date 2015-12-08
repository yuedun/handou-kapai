/**
 * Created by admin on 2015/10/23.
 * 用户错误日志表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var LogModel = sequelize.define('log', {
    lid:{ type: Sequelize.INTEGER, primaryKey: true,field:'lid'},
    userId:{ type: Sequelize.STRING, field:'user_id'},
    log:{ type: Sequelize.STRING, field:'log'},
    state: { type: Sequelize.INTEGER, field:'state'},
    mobileType: { type: Sequelize.STRING, field:'mobile_type'},
    platformType: { type: Sequelize.STRING, field:'platform_type'},
    softwareVersion: { type: Sequelize.STRING, field:'software_version'},
    osVersion: { type: Sequelize.STRING, field:'os_version'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_log',
    timestamps: false
});

module.exports = LogModel;
