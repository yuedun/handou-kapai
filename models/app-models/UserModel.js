var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var UserModel = sequelize.define('user', {
    userId: { type: Sequelize.STRING, primaryKey: true,field:'user_id'},
    userName: { type: Sequelize.STRING, field:'user_name'},
    password: { type: Sequelize.STRING, field:'password'},
    nickName: { type: Sequelize.STRING, field:'nick_name'},
    state: { type: Sequelize.INTEGER, field:'state'},
    orgToken: { type: Sequelize.STRING, field:'org_token'},
    gender: { type: Sequelize.INTEGER, field:'gender'},
    headPortrait: { type: Sequelize.STRING, field:'head_portrait'},
    birthday: { type: Sequelize.DATE, field:'birthday'},
    centerBackground: { type: Sequelize.STRING, field:'center_background'},
    fansCount: { type: Sequelize.INTEGER, field:'fans_count'},
    bean: { type: Sequelize.INTEGER, field:'bean'},
    userType: { type: Sequelize.STRING, field:'user_type'},
    country: { type: Sequelize.STRING, field:'country'},
    countryCode: { type: Sequelize.STRING, field:'country_code'},
    thisLife: { type: Sequelize.STRING, field:'this_life'},
    deviceId: { type: Sequelize.STRING, field:'device_id'},
    mobileType: { type: Sequelize.STRING, field:'mobile_type'},
    platformType: { type: Sequelize.STRING, field:'platform_type'},
    softwareVersion: { type: Sequelize.STRING, field:'software_version'},
    osVersion: { type: Sequelize.STRING, field:'os_version'},
    createIp: { type: Sequelize.STRING, field:'create_ip'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'},
    installationId: {type: Sequelize.STRING, field:'push_installationId'},
    deviceToken: {type: Sequelize.STRING, field:'push_deviceToken'},
    objectId: {type: Sequelize.STRING, field:'push_objectId'},
    channels: {type: Sequelize.TEXT, field:'push_channels'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'kp_user',
    timestamps: false
});
module.exports = UserModel;
UserModel.hasOne(require('./AddressModel'),{foreignKey: 'userId'});
UserModel.belongsToMany(require('./UserModel'), {as:'org', through: require('./OrgUserRelationModel'),  foreignKey: 'orgId'});//一个组织有多个用户
UserModel.belongsToMany(require('./UserModel'), {as:'user', through: require('./OrgUserRelationModel'), foreignKey: 'userId'});//一个用户关注多个组织
UserModel.hasMany(require('./TopicModel'), {foreignKey: 'userId'});//一个用户关注多个粉丝团
UserModel.hasOne(require('./OrgVerifyModel'),{foreignKey: 'userId'});
UserModel.hasMany(require('./SecretaryModel'), {foreignKey: 'answerUserId'});
UserModel.hasMany(require('./SecretaryModel'), {foreignKey: 'userId'});
UserModel.belongsToMany(require('./GiftModel'),{through: require('./UserGiftModel'), foreignKey: 'userId'});



