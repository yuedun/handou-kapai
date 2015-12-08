/**
 * Created by admin on 2015/7/20.
 * 
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var beanDoubleModel = sequelize.define('beanDouble', {
    beanDoubleId: { type: Sequelize.STRING, primaryKey: true,field:'bean_double_id'},
    beanDoubleState: { type: Sequelize.INTEGER, field:'bean_double_state'},
    type: { type: Sequelize.STRING, field:'type'},
    beanStarTime: { type: Sequelize.DATE, field:'bean_star_time'},
    beanEndTime: { type: Sequelize.DATE, field:'bean_end_time'},
    beanMultiple: { type: Sequelize.INTEGER, field:'bean_multiple'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'bean_double',
    timestamps: false
});

module.exports = beanDoubleModel;
