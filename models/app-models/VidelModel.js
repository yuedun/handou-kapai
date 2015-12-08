/**
 * Created by admin on 2015/11/05.
 * 咖派视频表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var VideoModel = sequelize.define('Video', {
    videoId: { type: Sequelize.INTEGER, primaryKey: true,field:'video_id'},
    videoDesc: { type: Sequelize.STRING, field:'video_desc'},
    videoAddress: { type: Sequelize.STRING, field:'video_address'},
    picture: { type: Sequelize.STRING, field:'picture'},
    videoTag: { type: Sequelize.STRING, field:'video_tag'},
    likeCount: { type: Sequelize.INTEGER, field:'like_count'},
    shareCount: { type: Sequelize.INTEGER, field:'share_count'},
    readCount: { type: Sequelize.INTEGER, field:'read_count'},
    videoState: { type: Sequelize.INTEGER, field:'video_state'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_video',
    timestamps: false
});

module.exports = VideoModel;
