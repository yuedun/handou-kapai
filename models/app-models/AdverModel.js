/**
 * on 2015/8/27.
 * 广告表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var AdverModel = sequelize.define('adver', {
    adverId: { type: Sequelize.STRING, primaryKey: true,field:'adver_id'},
    adverTitle: { type: Sequelize.STRING, field:'adver_title'},
    adverPic: { type: Sequelize.STRING, field:'adver_pic'},
    groupId: { type: Sequelize.STRING, field:'group_id'},
    linkType: { type: Sequelize.STRING, field:'link_type'},
    linkValue: { type: Sequelize.STRING, field:'link_value'},
    likeCount: { type: Sequelize.INTEGER, field:'like_count'},
    state: { type: Sequelize.INTEGER, field:'state'},
    releaseDate: { type: Sequelize.DATE, field:'release_date'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'adver',
    timestamps: false
});

module.exports = AdverModel;
