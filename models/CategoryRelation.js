/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var CategoryRelaton = sequelize.define('category_relation', {
    category_relation_id: { type: Sequelize.STRING, primaryKey: true},
    user_id: Sequelize.STRING,
    category_id: Sequelize.STRING,
    category_relation_state: Sequelize.INTEGER,
    has_score: Sequelize.INTEGER,
    creator_ip: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'category_relation',
    timestamps: false
});

module.exports = CategoryRelaton;
CategoryRelaton.belongsTo(require('./User'), {foreignKey: 'user_id'});
CategoryRelaton.belongsTo(require('./Category'), {foreignKey: 'category_id'});