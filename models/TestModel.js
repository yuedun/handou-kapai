/**
 * Created by admin on 2015/7/16.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var TestModel = sequelize.define('testModel', {
    userId: { type: Sequelize.STRING, primaryKey: true, field:'user_id'},
    userName: {type:Sequelize.STRING,field:'user_name'},
    userPassword: {type: Sequelize.STRING, field:'user_password'},
    userState: {type: Sequelize.INTEGER, field:'user_state'},
    createDate: {type: Sequelize.DATE,field:'create_date'},
    updateDate: {type:Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步If freezeTableName is true, sequelize will not try to alter the DAO name to get the table name. Otherwise, the model name will be pluralized
    tableName: 'test_model',
    timestamps: false
});
module.exports = TestModel;