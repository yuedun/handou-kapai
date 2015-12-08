/**
 * Created by hp on 2015/6/3.
 * 拍点啥活动表
 */
var sequelize = require('../utils/sequelizeDB');
var Sequelize = require('sequelize');
var ActivityPds = sequelize.define('activity_pds', {
    activity_id: { type: Sequelize.STRING, primaryKey: true},
    activity_title: Sequelize.STRING,//活动标题
    activity_pic: Sequelize.STRING,//活动图片
    activity_summary: Sequelize.STRING,//活动简介
    activity_desc: Sequelize.STRING,//活动详情
    activity_state: Sequelize.INTEGER,//活动状态：获奖名单0，活动预告1，活动中2，已结束3
    is_award_list: Sequelize.INTEGER,//是否为获奖名单状态：1
    activity_start_date: Sequelize.DATE,//活动开始时间
    activity_end_date: Sequelize.DATE,//活动结束时间
    release_date: Sequelize.DATE,//定时发布时间
    create_date: Sequelize.DATE,
    update_date: Sequelize.DATE
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'activity_pds',
    timestamps: false
});
module.exports = ActivityPds;



