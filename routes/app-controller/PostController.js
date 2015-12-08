"use strict";
var async = require('async');
var moment = require('moment');
var responseObj = require('../../models/ResponseObj.js');
var postService = require('../../services/postService.js');
var pictureService = require('../../services/PictureService.js');
var commentService = require('../../services/CommentService.js');
var LikeRelationService = require('../../services/LikeRelationService.js');
var topicPostService = require('../../services/topicPostService.js');
var beanRelationService = require('../../services/BeanRelationService.js');
var userService = require('../../services/UserService.js');
var messageService = require('../../services/messageService.js');
var messagePushService = require('../../services/MessagePushService.js');
var dateUtils = require('../../utils/dateUtils');
var config = require('../../config/config');
var Constants = require('../../utils/constants');
var commonUtils = require('../../utils/commonUtil.js');

var parseRequest = function(req, response) {

	var params = req.body.object;

	if (params == null) {
		response.object.msg = "参数为空.";
		response.object.code = "4002";
		res.send(response);
	}
};

var postController = function(){};

/**
 * SNS列表接口
 * @param {Object} req
 * @param {Object} res
 */
postController.snslist = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		userId:object.userId,
		categoryId:object.categoryId
	};
	var resObj = responseObj();
	resObj.command = command;
	postService.getSnsObj(params,function(err,postlist){
		async.map(postlist,function(item, callback){
			// 设置官方豆头像
			item.headPortrait = config.qiniu.download_website + item.headPortrait;
			// 设置帖子时间
			item.createDate = dateUtils.formatDate(item.createDate);
			async.parallel([
				// 获取图片
				function(callback0){
					var params0 = {
						postId:item.topicId
					};
					pictureService.getPostImgObj(params0,function(err,imglist){
						callback0(null, imglist);
					});
				},				
				// 评论数
				function(callback1){
					var params1 = {
						commentState:1,
						topicId:item.topicId
					};
					commentService.getNewPostCommentCountObj(params1,function(err,commentCount){
						callback1(null,commentCount);
					});
				},		
				// 是否点赞
				function(callback2){
					var params2 = {
						postId:item.topicId,
						userId:params.userId,
						type:0	// 帖子的点赞关系用0标识
					};
					LikeRelationService.getTopicLikeRelation(params2,function(err,islikeRelation){
						callback2(null, islikeRelation);
					});
				}
			],function (err, result) {
				// 为帖子图片加上前缀
				for(var i = 0; i<result[0].length;i++){
					result[0][i].pictureOriginalPath = config.qiniu.download_website + result[0][i].pictureOriginalPath;
					result[0][i].pictureScreenshotPath = config.qiniu.download_website + result[0][i].pictureScreenshotPath;
				}
				item.picturelist = result[0];
				// 为item对象设置评论数
				item.commentCount = result[1][0].commentCount;
				// 设置是否点赞
				item.likeRelation = result[2] ? result[2].state : 0;
				callback(null, item);
			});
			
		},function(err, results){
			resObj.object = results;
			res.send(resObj);
		});
	});
};

/**
 * SNS帖子详情  
 * @param {Object} req
 * @param {Object} res
 */
postController.snsPostDetails = function(req,res){
	var response = responseObj();
	var params = req.body.object;
	response.command = req.body.command;
	postService.getSnsPostDetails(params,function(err,snsPost){
		if(snsPost.length == 0){
			response.errMsg(4001,'查询结果为空');
			res.send(response);
		} else {
			async.map(snsPost,function(item, callback){
				// 设置官方豆头像
				item.headPortrait = config.qiniu.download_website + item.headPortrait;
				// 设置帖子时间
				item.createDate = dateUtils.formatDate(item.createDate);
				async.parallel([
					// 图片列表
					function(callback0){
						var params0 = {
							postId:item.topicId
						};
						pictureService.getPostImgObj(params0, function(err,imglist){
							callback0(null, imglist);
						});
					},
					// 评论列表
					function(callback1){
						var params1 = {
							topicId:item.topicId,
							direction:params.direction,
							pageSize:params.pageSize,
							lastDate:params.lastDate
						};
						commentService.getNewPostCommentObj(params1, function(err,commentlist){
							// 设置用户是否对评论点过赞
							async.map(commentlist,function(item2,callbacks){
								// 判断评论的用户类型
								item2.userType = item2.userType == "org" ? 1: 3;
								var params12 = {
									postId:item2.commentId,
									userId:params.userId,
									type:1
								};
								LikeRelationService.getTopicLikeRelation(params12, function(err,objs){
									item2.likeRelation = objs ? objs.state : 0;
									callbacks(null,item2);
								});
							},function(err,results7){
								callback1(null, results7);
							});
						});
					},
					// 当前用户是否点过赞
					function(callback2){
						var params2 = {
							postId:item.topicId,
							userId:params.userId,
							type:0	// 帖子的点赞关系用0标识
						};
						LikeRelationService.getTopicLikeRelation(params2, function(err,islikeRelation){
							callback2(null, islikeRelation);
						});
					}
				],function (err, result) {
					// 为帖子图片加上前缀
					for(var i = 0; i<result[0].length;i++){
						result[0][i].pictureOriginalPath = config.qiniu.download_website + result[0][i].pictureOriginalPath;
						result[0][i].pictureScreenshotPath = config.qiniu.download_website + result[0][i].pictureScreenshotPath;
					}
					item.picturelist = result[0];
					// 为评论设置时间格式和评论者头像前缀
					for(var i = 0; i<result[1].length;i++){
						result[1][i].createDate = dateUtils.formatDate(result[1][i].createDate);
						// 头像为空时给出默认头像
						if(null == result[1][i].headPortrait || '' == result[1][i].headPortrait){
							result[1][i].headPortrait = config.qiniu.kp_site + config.qiniu.defaul_user_head;
						} else {
							result[1][i].headPortrait = config.qiniu.kp_site + result[1][i].headPortrait;
						}
						// 文字评论为空时
						result[1][i].commentContent = result[1][i].commentContent ? result[1][i].commentContent : "";
						// 被回复者为空时
						result[1][i].replyUserId = result[1][i].replyUserId ? result[1][i].replyUserId : "";
						// 被回复评论ID为空时
						result[1][i].replyCommentId = result[1][i].replyCommentId ? result[1][i].replyCommentId : "";
						// 被回复者的用户昵称为空时
						result[1][i].replyNickName = result[1][i].replyNickName ? result[1][i].replyNickName : "";
						// 语音评论为空时
						result[1][i].audioAddress = result[1][i].audioAddress ? config.qiniu.kp_site + result[1][i].audioAddress : "";
					}
					item.commentlist = result[1];
					// 判断当前用户是否点过赞
					if(result[2] == null){
						item.likeRelation = 0;
					}else{
						item.likeRelation = result[2] ? result[2].state : 0;
					}
					callback(null,item);
				});
			},function(err,results){
				response.object = results[0];
				res.send(response);
			});
		}
	});
};

/**
   * SNS帖子点赞接口
   * @param {Object} req
   * @param {Object} res
   */
postController.postLikeRelation = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		postId:object.topicId,
		type:0 // 帖子的点赞关系用0表示
	};
	var resObj = responseObj();
	resObj.command = command;
	LikeRelationService.getTopicLikeRelation(params,function(err,userLikeRelation){
		if(userLikeRelation){
			// 修改操作
			async.parallel([
				// 修改点赞关系状态[0 未点赞 、 1已点赞]
				function(callback0){
					var state1 = 0;
					if(userLikeRelation.state == 0){
						state1 = 1;
					}else{
						state1 = 0;
					}
					var setValue = {
						state:state1,
						updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
					};
					LikeRelationService.updateTopicLikeRelation(setValue,params,function(err,obj){
						callback0(obj);
					});
				},
				// 修改帖子的点赞数量
				function(callback1){
					var state2 = 0;
					if(userLikeRelation.state == 0){
						state2 = 1;		// 加1
					}else{
						state2 = -1;	// 减1
					}
					var params2 = {
						postId:params.postId,
						value:state2
					};
					postService.editPostLikeCount(params2,function(err,obj){
						callback1(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		} else {
			// 新增操作
			async.parallel([
				// 新增帖子点赞关系数据
				function(callback2){
					LikeRelationService.createTopicLikeRelation(params,function(obj){
						callback2(obj);
					});
				},
				// 对这条帖子的点赞数加1
				function(callback3){
					var params2 = {
						postId:params.postId,
						value:1
					};
					postService.editPostLikeCount(params2,function(err,obj){
						callback3(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		}
	});
};

 /**
   * SNS帖子评论 / 回复评论
   * @param {Object} req
   * @param {Object} res
   */
postController.postComment = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		topicId:object.topicId,
		replyUserId:object.replyUserId,
		replyCommentId:object.replyCommentId,
		replyNickName:object.replyNickName,
		isReply:object.isReply,
		commentContent:object.commentContent,
		audioAddress:object.audioAddress,
		audioTime:object.audioTime
	};
	var resObj = responseObj();
	resObj.command = command;
	commentService.createTopicComment(params,function(err,topicComment){
		resObj.object.commentId = topicComment.commentId;
		// 如果回复成功了
		if(null != topicComment){
			// 回复评论时需要推送信息
			if(topicComment.isReply == 1){
				async.parallel([
					// 根据帖子ID获取评论的发起人
					function(callback1){
						// 条件
						var params1 = {
							topicId:params.topicId
						};
						// 需要的字段
						var attrs1 = ['commentId','userId'];
						commentService.getTopicCommentByParam(params1,attrs1,function(err, comments){
							callback1(null,comments);
						});
					},
					// 获取发起推送用户的基本信息
					function(callback2){
						// 条件
						var params2 = {
							userId:params.userId
						};
						// 需要的字段
						var attrs2 = ['userId','nickName','headPortrait'];
						userService.getUserByParam(params2,attrs2,function(err, kpUser){
							callback2(null,kpUser);
						});
					}
				],function(err, results){
					if(results[0].userId != params.userId){
						var params3 = {
							userId:results[0].userId,			// 回复评论时推送消息是指定原评论用户 (接收推送人)
							prod:'dev',
							data:{
								userId:results[1].userId,		// 发起推送的人
								headPortrait:commonUtils.headPortrait(results[1]),	// 发起推送人的头像
								action:'app',
								chatContent:results[1].nickName + '回复了你的评论:' + topicComment.commentContent,	// 发起推送人的昵称及推送的内容。
								officalType:2,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
								chatType:3,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
								postId:results[0].commentId,		// 评论ID
								nickName:results[1].nickName,		// 发起人的用户昵称
								replayNickName:"",				// 接收方昵称
								replay:false
							}                          
						};
						// 调用推送方法
						messagePushService.sendMessage(params3);
						res.send(resObj);
					} else {
						console.log('自己评论自己不做推送!');
						res.send(resObj);
					}
				});
			}else{
				res.send(resObj);
			}
		}else{
			res.send(resObj);
		}
	});
};

/**
   * SNS删除用户评论接口
   * @param {Object} req
   * @param {Object} res
   */
postController.delUserComment = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		commentId:object.commentId
	};
	var resObj = responseObj();
	resObj.command = command;
	commentService.getCommentObjById(params,function(err,comment){
		if(null != comment){
			// 判断该评论的所有者是否为当前用户
			if(comment.userId == object.userId){
				commentService.deleteUserTopicComment(params,function(){
					res.send(resObj);
				});
			} else {
				resObj.errMsg(5006,"不能删除别人的评论哦");
				res.send(resObj);
			}
		} 
	});
};

/**
   * SNS帖子评论的点赞关系接口
   * @param {Object} req
   * @param {Object} res
   */
postController.userComLikeRelation = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		commentId:object.commentId
	};
	var resObj = responseObj();
	resObj.command = command;
	LikeRelationService.getCommentLikeRelation(params,function(err,commmentLikeRelation){
		if(commmentLikeRelation){
			// 修改操作
			async.parallel([
				// 修改帖子的点赞状态值
				function(callback0){
					var state0 = 0;
					if(commmentLikeRelation.state == 1){
						state0 = 0;
					}else{
						state0 = 1;
					}
					// 需修改的值
					var setValue = {
						state:state0,
						updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
					};
					LikeRelationService.editCommentLikeRelation(setValue,params,function(err,obj){
						callback0(obj);
					});
				},
				// 修改评论的点赞数
				function(callback1){
					var state1 = 0;
					if(commmentLikeRelation.state == 0){
						state1 = 1;
					}else{
						state1 = -1;
					}
					var params1 = {
						commentId:params.commentId,
						value:state1
					};
					LikeRelationService.updatePostComLikeCount(params1,function(err, obj){
						callback1(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		}else {
			// 新增操作
			async.parallel([
				// 新增帖子评论的点赞关系
				function(callback2){
					LikeRelationService.createCommentLikeRelation(params,function(obj){
						callback2(obj);
					});
				},
				// 修改评论的点赞数
				function(callback3){
					var params3 = {
						commentId:params.commentId,
						value:1
					};
					LikeRelationService.updatePostComLikeCount(params3,function(err, obj){
						callback3(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		}
	});	
};

/**
   * SNS帖子分享接口
   * @param {Object} req
   * @param {Object} res
   */
postController.postShare = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		postId:object.topicId
	};
	var resObj = responseObj();
	resObj.command = command;
	postService.editPostShareCount(params,function(err,obj){
		resObj.object.postShareUrl = config.share_url_text + params.userId + '/' + params.postId;
		res.send(resObj);
	});
};

/**
 * ***********************************************************************
 *  以下为新版本V3.0帖子的数据操作
 * ***********************************************************************
 */

/**
 * (个人 / 组织)帖子列表
 * @param {Object} req
 * @param {Object} res
 */
postController.myPostObj = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		userId:object.userId,		// 个人 或 组织
		loginUser:object.loginUser,	// 当前APP 用户
		topicType:object.topicType	// topicType = 2 粉丝帖子、3组织帖子
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.myPostList(params,function(err,mypostlist){
		async.map(mypostlist,function(item, callback){
			// 帖子标题判空处理
			item.topicName = item.topicName ? item.topicName : "";
			// 帖子内容判空处理
			item.topicDesc = item.topicDesc ? item.topicDesc : "";
			// 语音判空处理
			item.audioAddress = item.audioAddress ? config.qiniu.kp_site + item.audioAddress : "";
			// 图片判空处理
			var imagelist = [];
			if('' == item.topicPics || null == item.topicPics){
				item.topicPics = imagelist;
			} else {
				var imgarry = item.topicPics.split(",");
				for(var i = 0;i<imgarry.length;i++){
					// 判断有无http头
					if(imgarry[i].indexOf("http") > -1){
						imagelist.push(imgarry[i]);
					} else {
						imagelist.push(config.qiniu.kp_site + imgarry[i]);
					}
					//imagelist.push(config.qiniu.kp_site + imgarry[i]);
				}
				item.topicPics = imagelist;
			}
			// 处理图片尺寸
			var picSizelist = [];
			if('' == item.picsSize || null == item.picsSize){
				item.picsSize = picSizelist;
			} else {
				var picSizeArry = item.picsSize.split(",");
				
				for(var j = 0;j<picSizeArry.length;j++){
					picSizelist.push(picSizeArry[j]);
				}
				item.picsSize = picSizelist;			
			}
			
			// 设置头像
			item.headPortrait = commonUtils.headPortrait(item);
			// 判断定时发布帖子时间(定时时间字段不为空时说明该帖子为定时帖子)
			if(null != item.timedReleaseDate && '' != item.timedReleaseDate){
				item.createDate = item.timedReleaseDate;
			} else {
				item.timedReleaseDate = "";
			}
			// 设置帖子时间
			item.createDate = dateUtils.formatDate(item.createDate);				
			// 判断用户类型
			item.userType = item.userType == "org" ? 1: 3;
			// 并行执行 Start
			async.parallel([
				// 获取我的帖子的评论数
				function(callback1){
					var params0 = {
						commentState:1,
						topicId:item.topicId
					};
					commentService.getNewPostCommentCountObj(params0,function(err,commentCount){
						callback1(null,commentCount);
					});
				},
				// 判断当前app用户对该条帖子的点赞状态
				function(callback2){
					var params1 = {
						postId:item.topicId,
						userId:params.loginUser,		// 当前登陆用户
						type:0	// 帖子的点赞关系用0标识
					};
					LikeRelationService.getTopicLikeRelation(params1,function(err,islikeRelation){
						callback2(null, islikeRelation);
					});
				}
			],function (err, result) {
				// 给item对象设置评论数
				item.commentCount = result[0][0].commentCount;
				// 判断当前app用户是否点过赞
				item.likeRelation = result[1] ? result[1].state : 0;
				callback(null, item);
			});
			// 并行执行 End
		},function(err, results){
			resObj.object = results;
			res.send(resObj);
		});
	});
};

/**
 * 帖子的点赞
 * @param {Object} req
 * @param {Object} res
 */
postController.topicLikeRelation = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		postId:object.topicId,
		type:0 // 帖子的点赞关系用0表示
	};
	var resObj = responseObj();
	resObj.command = command;
	LikeRelationService.getTopicLikeRelation(params,function(err,userLikeRelation){
		if(userLikeRelation){
			// 修改操作
			async.parallel([
				// 修改点赞关系状态[0 未点赞 、 1已点赞]
				function(callback0){
					var state1 = 0;
					if(userLikeRelation.state == 0){
						state1 = 1;
					}else{
						state1 = 0;
					}
					var setValue = {
						state:state1,
						updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
					};
					LikeRelationService.updateTopicLikeRelation(setValue,params,function(err,obj){
						callback0(obj);
					});
				},
				// 修改帖子的点赞数量
				function(callback1){
					var state2 = 0;
					if(userLikeRelation.state == 0){
						state2 = 1;		// 加1
					}else{
						state2 = -1;	// 减1
					}
					var params2 = {
						topicId:params.postId,
						value:state2
					};
					topicPostService.editTopicLikeCount(params2,function(err,obj){
						callback1(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		} else {
			// 新增操作
			async.parallel([
				// 新增帖子点赞关系数据
				function(callback2){
					LikeRelationService.createTopicLikeRelation(params,function(obj){
						callback2(obj);
					});
				},
				// 对这条帖子的点赞数加1
				function(callback3){
					var params2 = {
						topicId:params.postId,
						value:1
					};
					topicPostService.editTopicLikeCount(params2,function(err,obj){
						callback3(obj);
					});
				}
			],function(err,results){
				// 瀑布流执行顺序
				async.parallel([
					// 根据帖子ID获取该帖子的发起人
					function(callback4){
						var params4 = {
							topicId:params.postId
						};
						topicPostService.getTopicById(params4,function(err, topicInfo){
							callback4(null,topicInfo);
						});
					},
					// 获取发起推送用户的基本信息
					function(callback5){
						// 条件
						var params5 = {
							userId:params.userId
						};
						// 需要的字段
						var attrs = ['userId','nickName','headPortrait'];
						userService.getUserByParam(params5,attrs,function(err, kpUser){
							callback5(null, kpUser);
						});
					}
				],function(err, results2){
					try{
						if(results2[0].getDataValue("userId") != params.userId){
							var params6 = {
								userId:results2[0].userId,			// 接受推送的人
								prod:'dev',							// 仅对 iOS 有效。设置使用开发证书（dev）还是生产证书（prod）。当设备设置了 deviceProfile 时我们优先按照 deviceProfile 指定的证书推送。
								data:{
									userId:results2[1].userId,			// 发起推送的人
									headPortrait:commonUtils.headPortrait(results2[1]), // 发起推送人的头像
									action:'app',					// 推送信息让客户端显示执行
									chatContent:results2[1].nickName + '赞了你一下哦!',	// 发起推送人昵称及推送内容
									officalType:1,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
									chatType:3,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
									postId:results2[0].topicId,		// 帖子ID
									nickName:results2[1].nickName,		// 发起人的用户昵称
								    replayNickName:"",				// 接收方昵称
								    replay:false					// 
								}
							};
							// 调用推送方法
							messagePushService.sendMessage(params6);
							var params7 = {
								messageText:"赞了你一下哦!",
								sendUserId:results2[1].userId,		// 发起推送人
								reciveUserId:results2[0].userId,	// 接收推送人
								topicId:results2[0].topicId,		// 帖子ID
								pushGoal:"user",					// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
								chatType:3,							// 官方推送
								officalType:1,						// 0、评论 1、点赞 2、回复
								releaseDate:object.releaseDate ? object.releaseDate : new Date()
							};
							messageService.createMessage(params7, function(message){});
						} 
						res.send(resObj);
					} catch(err) {

					}
				});
			});
		}
	});
};

/**
 * 帖子评论 / 回复评论
 * @param {Object} req
 * @param {Object} res
 */
postController.topicComment = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		topicId:object.topicId,
		commentContent:object.commentContent,
		replyUserId:object.replyUserId,
		replyCommentId:object.replyCommentId,
		replyNickName:object.replyNickName,
		isReply:object.isReply,
		userId:object.userId,
		audioAddress:object.audioAddress,
		audioTime:object.audioTime
	};
	var resObj = responseObj();
	resObj.command = command;
	commentService.createTopicComment(params,function(err,topicComment){
		resObj.object.commentId = topicComment.commentId;
		// 评论成功
		if(null != topicComment){
			// 评论
			if(topicComment.isReply == 0){
				// 瀑布流执行操作
				async.parallel([
					// 根据帖子ID获取该帖子的发起人
					function(callback0){
						var params1 = {
							topicId:params.topicId
						};
						topicPostService.getTopicById(params1,function(err, topicInfo){
							callback0(null,topicInfo);
						});
					},
					// 获取发起推送用户的基本信息
					function(callback1){
						// 条件
						var params1 = {
							userId:params.userId
						};
						// 需要的字段
						var attrs = ['userId','nickName','headPortrait'];
						userService.getUserByParam(params1,attrs,function(err, kpUser){
							callback1(null, kpUser);
						});
					}
				],function(err, results){
					if(results[0].userId != params.userId){
						var params2 = {
							userId:results[0].userId,			// 接收推送的人
							prod:'dev',
							data:{
								userId:results[1].userId,		// 发起推送的人
								headPortrait:commonUtils.headPortrait(results[1]),	// 发起推送人的头像
								action:'app',					// 推送让客户端显示并展示
								chatContent:results[1].nickName + '评论了你:' + topicComment.commentContent,	// 发起推送人的昵称及推送内容
								officalType:0,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
								chatType:3,		// 3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 
								postId:results[0].topicId,		// 帖子ID
								nickName:results[1].nickName,	// 发起人的用户昵称
								replayNickName:"",				// 接收方昵称       
								replay:false
							}   					               
						};
						// 调用推送方法
						messagePushService.sendMessage(params2);
						var params7 = {
							messageText: topicComment.commentContent,
							sendUserId:results[1].userId,	// 发起推送人
							reciveUserId:results[0].userId,	// 接收推送人
							topicId:results[0].topicId,		// 帖子ID
							pushGoal:"user",				// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
							chatType:3,						// 官方推送
							officalType:0,					// 0、评论 1、点赞 2、回复
							releaseDate:object.releaseDate ? object.releaseDate : new Date()
						};
						messageService.createMessage(params7, function(message){});
					} 
					res.send(resObj);
				});
			} else {	// 回复评论
				async.parallel([
					// 根据帖子ID获取评论的发起人
					function(callback1){
						// 条件
						var params1 = {
							topicId:params.topicId
						};
						// 需要的字段
						var attrs1 = ['commentId','topicId','userId'];
						commentService.getTopicCommentByParam(params1,attrs1,function(err, comments){
							callback1(null,comments);
						});
					},
					// 获取发起推送用户的基本信息
					function(callback2){
						// 条件
						var params2 = {
							userId:params.userId
						};
						// 需要的字段
						var attrs2 = ['userId','nickName','headPortrait'];
						userService.getUserByParam(params2,attrs2,function(err, kpUser){
							callback2(null,kpUser);
						});
					}
				],function(err, results){
					if(results[0].userId != params.userId){
						var params3 = {
							userId:results[0].userId,			// 回复评论时推送消息是指定原评论用户 (接收推送人)
							prod:'dev',
							data:{
								userId:results[1].userId,		// 发起推送的人
								headPortrait:commonUtils.headPortrait(results[1]),	// 发起推送人的头像
								action:'app',
								chatContent:results[1].nickName + '回复了你的评论:' + topicComment.commentContent,	// 发起推送人的昵称及推送的内容。
								officalType:2,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
								chatType:3,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
								postId:results[0].topicId,		// 评论ID
								nickName:results[1].nickName,	// 发起人的用户昵称
								replayNickName:"",				// 接收方昵称
								replay:false
							}                          
						};
						// 调用推送方法
						messagePushService.sendMessage(params3);
						var params7 = {
							messageText: topicComment.commentContent,
							sendUserId:results[1].userId,	// 发起推送人
							reciveUserId:results[0].userId,	// 接收推送人
							topicId:results[0].topicId,		// 帖子ID
							pushGoal:"user",				// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
							chatType:3,						// 官方推送
							officalType:2,					// 0、评论 1、点赞 2、回复
							releaseDate:object.releaseDate ? object.releaseDate : new Date()
						};
						messageService.createMessage(params7, function(message){});
					} 
					res.send(resObj);
				});
			}
		}
	});
};

/**
 *帖子评论删除
 * @param {Object} req
 * @param {Object} res
 */
postController.removeComment = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		commentId:object.commentId
	};
	var resObj = responseObj();
	resObj.command = command;
	commentService.getCommentObjById(params,function(err,comment){
		// 判断当前用户是否是这条评论的作者
		if(comment.userId == object.userId){
			// 相等执行删除操作
			commentService.deleteUserTopicComment(params,function(){
				res.send(resObj);
			});
		} else {
			// 不相等提示用户信息
			resObj.errMsg(5007,"不能删除别人的评论哦");
			res.send(resObj);
		}
	});
};

/**
 * 帖子分享
 * @param {Object} req
 * @param {Object} res
 */
postController.topicShare = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		topicId:object.topicId
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.editTopicShareCount(params,function(err,obj){
		resObj.object.postShareUrl = config.share_url_text + params.userId + '/' + params.topicId + '?shareType=topic';
		res.send(resObj);
	});
};

/**
 * 帖子评论的点赞关系
 * @param {Object} req
 * @param {Object} res
 */
postController.commentLikeRelation = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		userId:object.userId,
		postId:object.commentId,
		type:1 // 评论的点赞关系用1表示
	};
	var resObj = responseObj();
	resObj.command = command;
	LikeRelationService.getTopicLikeRelation(params,function(err,likeRelation){
		if(likeRelation){
			// 修改操作
			async.parallel([
				// 修改评论点赞关系数据
				function(callback0){
					var state1 = 0;
					if(likeRelation.state == 0){
						state1 = 1;
					}else{
						state1 = 0;
					}
					var setValue = {
						state:state1,
						updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
					};
					LikeRelationService.updateTopicLikeRelation(setValue,params,function(err,obj){
						callback0(resObj);
					});
				},
				// 修改评论的点赞数
				function(callback1){
					var state2 = 0;
					if(likeRelation.state == 0){
						state2 = 1;		// 加1
					}else{
						state2 = -1;	// 减1
					}
					var params2 = {
						commentId:params.postId,
						value:state2
					};
					topicPostService.editTopicCommentLikeCount(params2,function(err,obj){
						callback1(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		} else {
			// 新增操作
			async.parallel([
				// 新增评论的点赞关系
				function(callback2){
					// 新增评论的点赞关系数据
					LikeRelationService.createTopicLikeRelation(params,function(obj){
						callback2(obj);
					});
				},
				// 给评论的点赞数 +1
				function(callback3){
					var params2 = {
						commentId:params.postId,
						value:1
					};
					topicPostService.editTopicCommentLikeCount(params2,function(err,obj){
						callback3(obj);
					});
				}
			],function(err,results){
				res.send(resObj);
			});
		}
	});
};

/**
 * （个人 / 组织）帖子基本信息
 * @param {Object} req
 * @param {Object} res
 */
postController.PostDetailsList = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		topicId:object.topicId
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.PostDetailsList(params,function(err, postDetails){
		if(postDetails.length == 0){
			resObj.errMsg(4001,'查询结果为空');
			res.send(resObj);
		} else {
			// 帖子标题判空处理
			postDetails[0].topicName = postDetails[0].topicName ? postDetails[0].topicName : "";
			// 帖子内容判空处理
			postDetails[0].topicDesc = postDetails[0].topicDesc ? postDetails[0].topicDesc : "";
			// 语音判空处理
			postDetails[0].audioAddress = postDetails[0].audioAddress ? config.qiniu.kp_site + postDetails[0].audioAddress : "";
			// 图片判空处理
			var imagelist = [];
			if(null == postDetails[0].topicPics || '' == postDetails[0].topicPics){
				postDetails[0].topicPics = imagelist;
			} else {
				var imgarry = postDetails[0].topicPics.split(",");
				for(var i = 0;i<imgarry.length;i++){
					// 判断有无http头
					if(imgarry[i].indexOf("http") > -1){
						imagelist.push(imgarry[i]);
					} else {
						imagelist.push(config.qiniu.kp_site + imgarry[i]);
					}
				}
				postDetails[0].topicPics = imagelist;
			}
			// 处理图片尺寸
			var picSizelist = [];
			if(null == postDetails[0].picsSize || '' == postDetails[0].picsSize){
				postDetails[0].picsSize = picSizelist;
			} else {
				var picSizeArry = postDetails[0].picsSize.split(",");
				for(var j = 0;j<picSizeArry.length;j++){
					picSizelist.push(picSizeArry[j]);
				}
				postDetails[0].picsSize = picSizelist;			
			}
			// 设置官方豆头像
			postDetails[0].headPortrait = commonUtils.headPortrait(postDetails[0]);
			// 设置帖子时间
			postDetails[0].createDate = dateUtils.formatDate(postDetails[0].createDate);				
			resObj.object = postDetails[0];
			res.send(resObj);
		}
	});
};

/**
 * 发帖（个人 或者 组织）
 * @param {Object} req
 * @param {Object} res
 */
postController.createPost = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	if(object.topicType == 3 && commonUtils.paramsIsNull(req, res, ['groupId','userId','topicType'])){
		//如果有空值则retrun不继续往下执行
		return;
	}
	var params = {
		topicName:object.topicName,		   // 帖子标题
		topicScope:object.topicScope,      // 指定帖子类型（0、文子帖子 1、图片帖子 2、语音帖子 3、动图帖子）
		topicDesc:object.topicDesc,	   	   // 帖子内容
		audioAddress:object.audioAddress,
		audioTime:object.audioTime,
		topicPics:object.topicPics,		   // 图片信息
		picsSize:object.picsSize,		   // 图片尺寸 列如:559*414,587*328
		parentTopicId:object.parentTopicId,// 频道ID（组织发帖时，需要将帖子挂在对应的频道下）
		userId:object.userId,			   // 普通用户 或者 组织
		groupId:object.groupId,			   // 粉丝团ID (组织要到指定的粉丝团下发帖)
		topicType:object.topicType		   // 区分是普通用户发帖，还是组织发帖
	};
	var resObj = responseObj();
	resObj.command = command;
	
	var paramsother = {
		topicName:params.topicName,
		topicType0:0,
		topicType1:1
	};

	topicPostService.createTopic(params, function(err,topic) {
		// 判断发帖是否成功
		if(err){
			// 失败直接返回
			resObj.errMsg(5009,JSON.stringify(err.errors));
			res.send(resObj);
		} else{
			// 成功则判断是个人发帖 还是 组织发帖
			if(params.topicType == 2){
				// ----------------------------------------------------------------------------------1
				// 修改该频道的最后更新时间
				var setValue2 = {
					updateDate:moment().format("YYYY-MM-DD HH:mm:ss")
				};
				// 修改该频道的条件
				var params11 = {
					topicId:params.parentTopicId
				};
				topicPostService.editTopicByParam(setValue2, params11, function(err, obj){

				});
				// ----------------------------------------------------------------------------------2
				var params1 = {
					userId:params.userId,
					beanType:Constants.BEAN_TYPE.SEND_POST,
					beanDate:moment().format("YYYY-MM-DD")
				};
				// (个人)，查询该用户今日的发帖获取豆币是否超过150[用户豆币获取途径:每发布一个帖子，可获得：15豆币，每天上限150豆币]
				beanRelationService.getBeanRelationObj(params1,function(err,beanRelation){
					// 存在并判断积分是否超过150
					if(beanRelation.length != 0){
						// 积分未超过150，继续加豆币值操作
						if(beanRelation[0].beanValue < 150){
							var BeanCount0 = 0;
							async.parallel([
								// 修改发帖获取豆币记录值
								function(callback0){
									// 修改发帖加豆币的参数
									var params0 = {
										beanRelationId:beanRelation[0].beanRelationId,
										beanValue:15
									};
									beanRelationService.updateBeanValue(params0,function(err,beanRelation){
										callback0(beanRelation);
									});
								},
								// 修改用户总豆币值
								function(callback1){
									// 修改用户总豆币参数
									var params1 = {
										userId:params.userId,
										beanValue:15,
										attributes:['userId','bean']	// 必传
									};
									// 判断是否多倍积分
									beanRelationService.getBeanDouble(params1.beanValue, {type:'post'}, function(beanvalue){
										params1.beanValue = beanvalue;
										console.log('>>>>> beanvalue = ' + beanvalue);
										BeanCount0 = beanvalue;
										console.log('>>>>> BeanCount0 = ' + BeanCount0);
										userService.updateUserBean(params1,function(err,kpUser){
											callback1(kpUser);
										});
									});
								}
							],function(err, results){
								resObj.object.topicId = topic.topicId;
								/** Start */
								var params6 = {
									userId:topic.userId,			// 接受推送的人
									prod:'dev',
									data:{
										userId:'999999',			// 发起推送的人
										headPortrait:commonUtils.headPortrait({headPortrait:""}), // 发起推送人的头像
										action:'app',					// 推送信息让客户端显示执行
										chatContent:'恭喜你发帖获得的' + BeanCount0 + '豆币!',	// 发起推送人昵称及推送内容
										officalType:3,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
										chatType:1,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
										postId:topic.topicId,		// 帖子ID
										nickName:'韩豆官方',		// 发起人的用户昵称
										replayNickName:"",				// 接收方昵称
										replay:false					//
									}
								};
								// 调用推送方法
								messagePushService.sendMessage(params6);

								var params7 = {
									messageText:'恭喜你发帖获得的' + BeanCount0 + '豆币!',
									sendUserId:'999999',		// 发起推送人
									reciveUserId:topic.userId,	// 接收推送人
									topicId:topic.topicId,		// 帖子ID
									pushGoal:"user",					// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
									chatType:1,							// 官方推送
									officalType:0,						// 0、评论 1、点赞 2、回复
									releaseDate:object.releaseDate ? object.releaseDate : new Date()
								};
								messageService.createMessage(params7, function(message){

								});
								/** End */
								res.send(resObj);
							});
						} else {
							resObj.object.topicId = topic.topicId;
							res.send(resObj);
						}
					} else {
						var BeanCount1 = 0;
						// 不存在则新增积分值
						// 并行执行新增 和 修改操作 start
						async.parallel([
							// 新增发帖获取豆币记录
							function(callback3){
								// 新增发帖加豆币参数
								var params3 = {
									userId:params.userId,
									beanType:Constants.BEAN_TYPE.SEND_POST,
									beanValue:15,
									beanDate:moment().format("YYYY-MM-DD")
								};
								beanRelationService.createBeanRealtion(params3,function(beanRelation){
									callback3(beanRelation);
								});
							},
							// 修改用户总豆币值
							function(callback4){
								// 修改用户总豆币参数
								var params4 = {
									userId:params.userId,
									beanValue:15,
									attributes:['userId','bean']	// 必传
								};
								// 判断是否多倍积分
								beanRelationService.getBeanDouble(params4.beanValue, {type:'post'}, function(beanvalue){
									params4.beanValue = beanvalue;
									console.log('##### beanvalue = ' + beanvalue);
									BeanCount1 = beanvalue;
									console.log('##### BeanCount1 = ' + BeanCount1);
									userService.updateUserBean(params4,function(err,kpUser){
										callback4(kpUser);
									});	
								});		
							}
						],function(err, results){
							resObj.object.topicId = topic.topicId;

							/******* Start */
							var params6 = {
								userId:topic.userId,			// 接受推送的人
								prod:'dev',
								data:{
									userId:'999999',			// 发起推送的人
									headPortrait:commonUtils.headPortrait({headPortrait:""}), // 发起推送人的头像
									action:'app',					// 推送信息让客户端显示执行
									chatContent:'恭喜你发帖获得的' + BeanCount1 + '豆币!',	// 发起推送人昵称及推送内容
									officalType:3,	// 官方推送类型（0：帖子，1：活动，2：资讯 3:个人消息[0、评论 1、点赞 2、回复]）
									chatType:1,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
									postId:topic.topicId,		// 帖子ID
									nickName:'韩豆官方',		// 发起人的用户昵称
									replayNickName:"",				// 接收方昵称
									replay:false					//
								}
							};
							// 调用推送方法
							messagePushService.sendMessage(params6);

							var params7 = {
								messageText:'恭喜你发帖获得的' + BeanCount1 + '豆币!',
								sendUserId:'999999',		// 发起推送人
								reciveUserId:topic.userId,	// 接收推送人
								topicId:topic.topicId,		// 帖子ID
								pushGoal:"user",					// 推送目标 all:全体、fans:粉丝团、org:组织、user:个人
								chatType:1,							// 官方推送
								officalType:0,						// 0、评论 1、点赞 2、回复
								releaseDate:object.releaseDate ? object.releaseDate : new Date()
							};
							messageService.createMessage(params7, function(message){});
							/****** End */

							res.send(resObj);
						});
						// 并行执行新增 和 修改操作 end
					}
				});
			} else if(params.topicType == 3) {
				// (组织)
				var params5 = {
					userId:params.userId,
					beanValue:20,
					attributes:['userId','bean']  // 必传
				};
				
				// 判断是否多倍积分
				beanRelationService.getBeanDouble(params5.beanValue, {type:'post'}, function(beanvalue){
					params5.beanValue = beanvalue;
					// 修改组织用户豆币值
					userService.updateUserBean(params5,function(err,kpUser){
						resObj.object.topicId = topic.topicId;
						res.send(resObj);
					});
				});
			} else {
				resObj.errMsg(5012,"帖子类型有误");
				res.send(resObj);
			}
		}
	});
};

/**
 * (个人 / 组织)帖子详情->[帖子评论信息]
 * @param {Object} req
 * @param {Object} res
 */
postController.PostDetails = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	var params = {
		pageSize:object.pageSize,
		direction:object.direction,
		lastDate:object.lastDate,
		userId:object.userId,
		topicId:object.topicId
	};
	var resObj = responseObj();
	resObj.command = command;
	// 获取评论列表
	commentService.getNewPostCommentObj(params,function(err,commentList){
		// 设置用户是否对评论点过赞
		async.map(commentList,function(item2,callbacks){
			// 文字评论判空处理
			item2.commentContent = item2.commentContent ? item2.commentContent : "";
			// 被回复用户ID判空处理
			item2.replyUserId = item2.replyUserId ? item2.replyUserId : "";
			// 被回复评论ID判空处理
			item2.replyCommentId = item2.replyCommentId ? item2.replyCommentId : "";
			// 被回复用户昵称判空处理
			item2.replyNickName = item2.replyNickName ? item2.replyNickName : "";
			// 格式化时间
			item2.createDate = dateUtils.formatDate(item2.createDate);
			// 语音判空处理
			item2.audioAddress = item2.audioAddress ? config.qiniu.kp_site + item2.audioAddress : "";
			// 头像判空处理
			item2.headPortrait = commonUtils.headPortrait(item2);
			// 判断用户类型
			item2.userType = item2.userType == "org" ? 1: 3;
			var params3 = {
				postId:item2.commentId,
				userId:params.userId,
				type:1			// 评论的点赞type值为1
			};
			LikeRelationService.getTopicLikeRelation(params3,function(err,objs){
				item2.likeRelation = objs ? objs.state : 0;
				callbacks(null,item2);
			});
		},function(err,results7){
			resObj.object = results7;
			res.send(resObj);
		});
	});
};

/**
 * by Star
 * 组织贴置顶 / 取消置顶
 * @param req
 * @param res
 */
postController.topOrgTopic = function(req,res){
	var command = req.body.command;
	var object = req.body.object;
	// 条件
	var params = {
		topicId:object.topicId,
		isRecommend:object.isRecommend
	};
	var resObj = responseObj();
	resObj.command = command;
	topicPostService.editTopicIsRecommend(params,function(err,obj){
		res.send(resObj);
	});
};


/**
 * 推送消息
 * @param {Object} req
 * @param {Object} res
 */
postController.kpMessage = function(req, res){
	var command = req.body.command;
	var object = req.body.object;
	// 条件
	var params = {
		messageText:object.messageText,
		sendUserId:object.userId,
		reciveUserId:object.userId,
		topicId:object.topicId,
		pushGoal: "org",
		chatType: 1,
		officalType: 0,
		releaseDate: new Date()
	};
	var resObj = responseObj();
	resObj.command = command;
	async.parallel([
		// 新增推送消息记录
		function(callback0){
			messageService.createMessage(params,function(message){
				callback0(message);
			});
		}
	],function(err,results){
		// 瀑布流执行操作
		async.waterfall([
			// 获取帖子的基本信息
			function(callback2){
				var params2 = {
					topicId:params.topicId
				};
				topicPostService.getTopicById(params2,function(err, topicInfo){
					callback2(null,topicInfo);
				});
			},
			// 获取组织的基本信息
			function(topicInfo, callback3){
				// 条件
				var params1 = {
					userId:params.sendUserId
				};
				// 需要的字段
				var attrs = ['userId','nickName','headPortrait'];
				// 获取组织的基本信息
				userService.getUserByParam(params1, attrs, function(err, kpUser){
					callback3(null, topicInfo, kpUser);
				});
			},
			// 执行推送
			function(topicInfo, kpUser, callback4){
				var params4 = {
					userId:params.sendUserId,			// 接受推送人
					channels:params.sendUserId,
					prod:'dev',
					data:{
						userId:kpUser.userId,		// 发起推送人
						headPortrait:commonUtils.headPortrait(kpUser),	// 发起推送人头像
						action:'app',
						chatContent:kpUser.nickName+'邀你去看看新发布的帖子:'+params.messageText	,	// 发起推送人昵称及推送内容
						officalType:0,	// 官方推送类型（0：帖子，1：活动，2：资讯）
						chatType:1,		// 0: 回答用户提问  1：官方推送  2：账号审核推送  3：帖子推送 （组织推送帖子，帖子点暂，增加评论，喜欢） 4：新粉丝推送
						postId:params.topicId,		// 帖子ID
						nickName:kpUser.nickName,		// 发起人的用户昵称
						replayNickName:"",				// 接收方昵称
						replay:false					//
					}
				};
				// 调用推送方法
				messagePushService.sendMessage(params4);
				callback4(null, kpUser);
			}
		],function(err, results2){
			res.send(resObj);
		});
	});
};

module.exports = postController;
