var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var LikeRelation = sequelize.define('like_relation',{
	likeRelationId:{ type: Sequelize.STRING, primaryKey: true,field:'like_relation_id'},
	postId:{ type: Sequelize.STRING, field:'post_id'},
	studioId:{ type: Sequelize.STRING, field:'studio_id'},
	userId:{ type: Sequelize.STRING, field:'user_id'},
	likeRelationState: { type: Sequelize.INTEGER, field:'like_relation_state'},
	postType:{ type: Sequelize.INTEGER, field:'post_type'},
	creatorIp:{ type: Sequelize.STRING, field:'user_id'},
	createDate:{ type: Sequelize.DATE, field:'create_date'},
	updateDate:{ type: Sequelize.DATE, field:'update_date'}
},{
	freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'like_relation',
    timestamps: false
});
module.exports = LikeRelation;



























