var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var Post = sequelize.define('post',{
	postId: { type: Sequelize.STRING, primaryKey: true,field:'post_id'},
	userId: { type: Sequelize.STRING, field:'user_id'},
    postDescription: { type: Sequelize.STRING, field:'post_description'},
    distinguishStatus: { type: Sequelize.INTEGER, field:'distinguish_status'},
	postState: { type: Sequelize.INTEGER, field:'post_state'},
    shareCount: { type: Sequelize.INTEGER, field:'share_count'},
    createDate: { type: Sequelize.DATE, field:'create_date'}
},{
	freezeTableName: true, 
    tableName: 'post',
    timestamps: false
});

module.exports = Post;
Post.belongsTo(require('./UserModel'),{foreignKey:'userId'});


























































