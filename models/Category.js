/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Category = sequelize.define('category', {
    category_id: { type: Sequelize.STRING, primaryKey: true},
    category_pid: Sequelize.STRING,
    category_name: Sequelize.STRING,
    category_pinyin: Sequelize.STRING,
    category_pinyin_initial: Sequelize.STRING,
    category_state: Sequelize.INTEGER,
    category_title: Sequelize.STRING,
    is_recommend: Sequelize.INTEGER,
    recommend_start_date: Sequelize.DATE,
    recommend_end_date: Sequelize.DATE,
    is_top: Sequelize.INTEGER,
    top_start_date: Sequelize.DATE,
    top_end_date: Sequelize.DATE,
    fan_count: Sequelize.INTEGER,
    sort_field: Sequelize.INTEGER,
    picture_subscribe: Sequelize.STRING,
    picture_fan_group: Sequelize.STRING,
    column_type_id: Sequelize.INTEGER,
    creator: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'category',
    timestamps: false
});

module.exports = Category;
Category.belongsToMany(require('./User'),{through: require('./CategoryRelation'), foreignKey: 'category_id'});