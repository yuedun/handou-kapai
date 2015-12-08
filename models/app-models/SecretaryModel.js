/**
 * Created by admin on 2015/9/6.
 * 咖派小秘书
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var dateUtils = require('../../utils/dateUtils.js');
var Secretary = sequelize.define('secretary',{
    secretaryId: { type: Sequelize.INTEGER, primaryKey: true,field:'secretary_id'},
    content: { type: Sequelize.STRING, field:'content'},
    answerFor: { type: Sequelize.INTEGER, field:'answer_for'},
    state: { type: Sequelize.INTEGER, field:'state'},
    userId: {type: Sequelize.STRING, field: 'user_id'},
    answerUserId: {type: Sequelize.STRING, field: 'answer_user_id'},
    type: { type: Sequelize.STRING, field:'type'},
    createDate: { type: Sequelize.DATE, field:'create_date',
        get: function(){
            return dateUtils.formatDate(this.getDataValue('createDate'));
        }
    },
    updateDate: { type: Sequelize.DATE, field:'update_date'}
},{
    freezeTableName: true,
    tableName: 'kp_secretary',
    timestamps: false
});

module.exports = Secretary;
Secretary.belongsTo(require('./UserModel'), {foreignKey: 'userId', as: 'User'});
Secretary.belongsTo(require('./UserModel'), {foreignKey: 'answerUserId', as: 'AnswerUser'});