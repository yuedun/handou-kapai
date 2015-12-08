/**
 * Created by admin on 2015/7/20.
 * 用户地址表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var beanRelationModel = sequelize.define('beanRelation', {
    beanRelationId: { type: Sequelize.STRING, primaryKey: true,field:'bean_relation_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    beanType: { type: Sequelize.INTEGER, field:'bean_type'},
    beanValue: { type: Sequelize.INTEGER, field:'bean_value'},
    beanDate: { type: Sequelize.DATE, field:'bean_date'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'bean_relation',
    timestamps: false
});

module.exports = beanRelationModel;
