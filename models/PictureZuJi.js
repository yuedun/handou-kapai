/**
 * Created by admin on 2015/1/26.
 * 狗血大片图片
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var PictureZuJi = sequelize.define('picture_zuji', {
    picture_id: { type: Sequelize.STRING, primaryKey: true},
    picture_name: Sequelize.STRING,
    picture_original_path: Sequelize.STRING,
    picture_screenshot_path: Sequelize.STRING,
    picture_type: Sequelize.INTEGER,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'picture_zuji',
    timestamps: false
});

module.exports = PictureZuJi;


