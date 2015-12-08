/**
 * Created by huopan on 2015/7/16.
 */
var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');
var UserLikeRelation = sequelize.define('user_like_relation', {
    likeId: { type: Sequelize.STRING, primaryKey: true, field:'like_id'},
    postId: {type:Sequelize.STRING,field:'post_id'},
    userId: {type: Sequelize.STRING, field:'user_id'},
    state: {type: Sequelize.INTEGER, field:'state'},//true(1),false(0)
    type: {type: Sequelize.INTEGER, field:'type'},
    createDate: {type: Sequelize.DATE,field:'create_date'},
    updateDate: {type:Sequelize.DATE, field:'update_date'}
}, {
    freezeTableName: true,
    tableName: 'user_like_relation',
    timestamps: false
});
module.exports = UserLikeRelation;























