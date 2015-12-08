/**
 * Created by admin on 2015/1/26.
 * 用户地址表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Picture = sequelize.define('picture', {
    picture_id: { type: Sequelize.STRING, primaryKey: true},
    picture_name: Sequelize.STRING,
    picture_original_name: Sequelize.STRING,
    picture_description: Sequelize.STRING,
    picture_original_path: Sequelize.STRING,
    picture_screenshot_path: Sequelize.STRING,
    picture_state: Sequelize.INTEGER,
    picture_type: Sequelize.INTEGER,
    picture_class: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'picture',
    timestamps: false
});

module.exports = Picture;


