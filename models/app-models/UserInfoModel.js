/**
 * Created by admin on 2015/1/26.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var config = require('../../config/config.json');
var UserInfoModel = sequelize.define('userInfo', {
    userInfoId: { type: Sequelize.STRING, primaryKey: true, field:'user_info_id'},
    nickName:{ type: Sequelize.STRING, field:'nick_name',
        get: function() {
            return this.getDataValue("nickName")?
            	this.getDataValue("nickName"):"路人";
        }
    },
    phone:{ type: Sequelize.STRING, field:'phone'},
    headPortrait:{ type: Sequelize.STRING, field:'head_portrait',
        defaultValue: config.qiniu.defaul_user_head,
        get: function() {
            return this.getDataValue("headPortrait")?
                config.qiniu.download_website + this.getDataValue("headPortrait"):config.qiniu.download_website + config.qiniu.defaul_user_head;
        }
    },
    centerBackground:{ type: Sequelize.STRING, field:'center_background',
        defaultValue:config.qiniu.defaul_center_background,
        get: function() {
            return this.getDataValue("centerBackground")?
                config.qiniu.download_website + this.getDataValue("centerBackground"):config.qiniu.download_website + config.qiniu.defaul_center_background;
        }
    },
    useInfoState: { type: Sequelize.INTEGER, field:'user_info_state'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    userIntegral: { type: Sequelize.INTEGER, field:'user_integral'},
    gender: { type: Sequelize.STRING, field:'gender'},
    country: { type: Sequelize.STRING, field:'country'},
    countryCode: { type: Sequelize.STRING, field:'country_code'},
    deviceId:{ type: Sequelize.STRING, field:'device_id'},
    birthday:{ type: Sequelize.DATE, field:'birthday'},
    osVersion:{ type: Sequelize.STRING, field:'os_version'},
    softwareVersion: { type: Sequelize.STRING, field:'software_version'},
    platformType: { type: Sequelize.STRING, field:'platform_type'},
    mobileType: { type: Sequelize.STRING, field:'mobile_type'},
	thisLife: { type: Sequelize.STRING, field:'this_life'},    
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'user_info',
    timestamps: false
});
module.exports = UserInfoModel;

UserInfoModel.belongsTo(require('./UserModel.js'),{foreignKey: 'userId'});

