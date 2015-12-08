var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var Picture = sequelize.define('picture', {
    pictureId: { type: Sequelize.STRING, primaryKey: true, field:'picture_id'},
    pictureName: { type: Sequelize.STRING, field:'picture_name'},
    pictureOriginalName: { type: Sequelize.STRING, field:'picture_original_name'},
    pictureDescription: { type: Sequelize.STRING, field:'picture_description'},
    pictureOriginalPath: { type: Sequelize.STRING, field:'picture_original_path'},
    pictureScreenshotPath: { type: Sequelize.STRING, field:'picture_screenshot_path'},
    pictureState: { type: Sequelize.INTEGER, field:'picture_state'},
    pictureType: { type: Sequelize.INTEGER, field:'picture_type'},
    pictureClass: { type: Sequelize.INTEGER, field:'picture_class'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'picture',
    timestamps: false
});

module.exports = Picture;
































