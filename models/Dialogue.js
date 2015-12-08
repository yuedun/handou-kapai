/**
 * 台词表
 * @type {Sequelize|exports}
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Dialogue = sequelize.define('dialogue', {
    dialogue_id: { type: Sequelize.STRING, primaryKey: true},
    zh_content: Sequelize.STRING,
    kor_content: Sequelize.STRING,
    editor_id: Sequelize.STRING,
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'dialogue',
    timestamps: false
});

module.exports = Dialogue;
