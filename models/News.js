/**
 * Created by admin on 2015/5/18.
 * 资讯表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var News = sequelize.define('news', {
    news_id: { type: Sequelize.STRING, primaryKey: true},
    news_number: Sequelize.INTEGER,
    title_kor: Sequelize.STRING,
    title_zh: Sequelize.STRING,
    quote_kor: Sequelize.STRING,
    quote_zh: Sequelize.STRING,
    summary_kor: Sequelize.STRING,
    summary_zh: Sequelize.STRING,
    picture_mini: Sequelize.STRING,
    picture_preview: Sequelize.STRING,
    editor_id: Sequelize.STRING,
    editor_name: Sequelize.STRING,
    sort_field: Sequelize.INTEGER,
    translate_state: Sequelize.INTEGER,
    like_count: Sequelize.INTEGER,
    belittle_count: Sequelize.INTEGER,
    read_count: Sequelize.INTEGER,
    description_kor: Sequelize.STRING,
    description_zh: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE,
    release_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'news',
    timestamps: false
});

module.exports = News;
News.hasMany(require('./NewsComment'), { foreignKey: 'news_id'});


