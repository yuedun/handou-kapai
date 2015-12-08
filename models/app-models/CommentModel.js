var sequelize = require('../../utils/sequelizeDB');
var Sequelize = require('sequelize');

var Comment = sequelize.define('comment',{
	commentId:{ type: Sequelize.STRING, primaryKey: true,field:'comment_id'},
	commentContent:{ type: Sequelize.STRING, field:'comment_content'},
	replyUserId:{ type: Sequelize.STRING, field:'reply_user_id'},
	replyCommentId:{ type: Sequelize.STRING, field:'reply_comment_id'},
	replyNickName:{ type: Sequelize.STRING, field:'reply_nick_name'},
	isReply:{ type: Sequelize.INTEGER, field:'is_reply'},
	commentState:{ type: Sequelize.INTEGER, field:'comment_state'},
	userId:{ type: Sequelize.STRING, field:'user_id'},
	postId:{ type: Sequelize.STRING, field:'post_id'},
	postType:{ type: Sequelize.INTEGER, field:'post_type'},
	commentVoice:{ type: Sequelize.STRING, field:'comment_voice'},
	voiceTime:{ type: Sequelize.INTEGER, field:'voice_time'},
	pictureId:{ type: Sequelize.STRING, field:'picture_id'},
	createDate:{ type: Sequelize.DATE, field:'create_date'},
	updateDate:{ type: Sequelize.DATE, field:'update_date'},
	likeCount:{ type: Sequelize.INTEGER, field:'like_count'}
},{
	freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步
    tableName: 'comment',
    timestamps: false
});
module.exports = Comment;



















