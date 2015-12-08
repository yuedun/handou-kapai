var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var CommentLikeRelation = sequelize.define('comment_like_relation',{
	id:{ type: Sequelize.STRING, primaryKey: true,field:'id'},
	commentId:{ type: Sequelize.STRING, primaryKey: true,field:'comment_id'},
	userId:{ type: Sequelize.STRING, primaryKey: true,field:'user_id'},
	state:{ type: Sequelize.INTEGER, field:'state'},
	creatorIp:{ type: Sequelize.STRING, primaryKey: true,field:'creator_ip'},
	createDate:{ type: Sequelize.DATE, field:'create_date'},
	updateDate:{ type: Sequelize.DATE, field:'update_date'},
},{
	freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'comment_like_relation',
    timestamps: false
});
module.exports = CommentLikeRelation;






































































