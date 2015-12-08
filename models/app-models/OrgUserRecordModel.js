/**
 * Created by hp on 2015/7/22.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var OrgUserRecord = sequelize.define('orgUserRecord', {
    recordId: { type: Sequelize.STRING, primaryKey: true, field:'record_id'},
    orgId: {type:Sequelize.STRING,field:'org_id'},
    userId: {type: Sequelize.STRING, field:'user_id'},
    createDate: {type: Sequelize.DATE,field:'create_date'},
    updateDate: {type:Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步If freezeTableName is true, sequelize will not try to alter the DAO name to get the table name. Otherwise, the model name will be pluralized
    tableName: 'org_user_record',
    timestamps: false
});
module.exports = OrgUserRecord;