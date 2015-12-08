/**
 * Created by admin on 2015/7/20.
 * 用户地址表
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var AddressModel = sequelize.define('address', {
    addressId: { type: Sequelize.STRING, primaryKey: true,field:'address_id'},
    userId: { type: Sequelize.STRING, field:'user_id'},
    name: { type: Sequelize.STRING, field:'name'},
    phone: { type: Sequelize.STRING, field:'phone'},
    postalCode: { type: Sequelize.STRING, field:'postal_code'},
    country: { type: Sequelize.STRING, field:'country'},
    province: { type: Sequelize.STRING, field:'province'},
    city: { type: Sequelize.STRING, field:'city'},
    area: { type: Sequelize.STRING, field:'area'},
    details: { type: Sequelize.STRING, field:'details'},
    state: { type: Sequelize.INTEGER, field:'state'},
    type: { type: Sequelize.INTEGER, field:'type'},
    createDate: { type: Sequelize.DATE, field:'create_date'},
    updateDate: { type: Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'address',
    timestamps: false
});

module.exports = AddressModel;
AddressModel.belongsTo(require('./UserModel'), {foreignKey: 'userId'});
