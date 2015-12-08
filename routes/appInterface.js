/**
 * Created by Administrator on 2015/5/20.
 * app接口统一入口，处理参数重定向到其他路由
 */
'use strict';
var express = require('express');
var urlencode = require('urlencode');
var router = express.Router();
var postControl = require('./app-controller/PostController');
var apiUri = require('../config/apiUri.js');
var responseObj = require('../models/ResponseObj.js');
var userControl = require('./app-controller/UserController');
var addressControl = require('./app-controller/AddressController');
var channelControl = require('./app-controller/ChannelController');
var travelScheduleControl = require('./app-controller/TravelScheduleController');
var topicControl = require('./app-controller/TopicController');
var groupControl = require('./app-controller/GroupController');
var bagControl = require('./app-controller/BagController');
var secretaryControl = require('./app-controller/SecretaryController');
var testControl = require('../test/TestController.js');
/**
 * 客户端基础接口,处理所有请求
 */
router.post(apiUri.baseApi, function(req, res) {
    var command = req.body.command;
    var object = req.body.object;
    var params = []; //需要判断是否为空的参数
    var resObj = null;
    switch (command) {
        case '218001':
            //图片列表接口
            params.push("currentPage");
            params.push("pageSize");
            params.push("picture_type");
            if (paramsIsNull(req, res, params)) {
                //不执行任何操作
            } else {
                res.redirect('/getPictures/' + command + '/' + object.currentPage + '/' + object.pageSize + '?picture_type=' + object.picture_type);
            }
            break;
        case '218002':
            //台词接口
            if (object.currentPage == undefined || object.pageSize == undefined) {
                resObj = responseObj();
                resObj.command = command;
                resObj.status = false;
                resObj.code = '4002';
                res.send(resObj);
                return;
            }
            res.redirect('/getDialogues/' + command + '/' + object.currentPage + '/' + object.pageSize);
            break;
        case '218003':
            //拍点啥首页大背景图
            res.redirect('/background?command=' + command);
            break;
        case '218004':
            //拍点啥与星合影
            res.redirect('/withStar?command=' + command);
            break;
        case '218005':
            //拍点啥与星合影某粉丝团下图片列表
            params.push("category_id");
            if (paramsIsNull(req, res, params)) {
                //不执行任何操作
            } else {
                res.redirect('/withStar/' + object.category_id + '?command=' + command);
            }
            break;
        case '218006':
            //拍点啥活动信息列表
            res.redirect('/pdsMsg?command=' + command);
            break;
        case '218007':
            //拍点啥问题反馈
            res.redirect(apiUri.feedbackPdsUri + '?command=' + command + '&feedback=' + urlencode(object.feedback) + '&mobileType=' + req.body.mobileType + '&qq=' + object.qq);
            break;
        case '219001':
            //资讯分类界面数据
            res.redirect('/lofti/api/news/newsFilter?command=' + command + '&userId=' + object.userId);
            break;
        case '219002':
            //资讯详情点赞
            res.redirect('/lofti/api/isLike?command=' + command + '&newsId=' + object.newsId + '&userId=' + object.userId + '&isLiked=' + object.isLiked);
            break;
        case '300000':
            //测试接口
            testControl.getUserInfo(req, res);
            break;
        case '300001':
            //用户注册
            userControl.register(req, res);
            break;
        case '300002':
            //用户/组织登陆,组织登陆同时注册
            userControl.login(req, res);
            break;
        case '300003':
            //首次订阅明星列表
            groupControl.starList(req, res);
            break;
        case '300004':
            //首次订阅绑定用户明星关系
            groupControl.userStarRelation(req, res);
            break;
        case '300005':
            //发送验证码
            userControl.sendMsg(req, res);
            break;
        case '300006':
            //找回密码
            userControl.retrieve(req, res);
            break;
        case '300007':
            //用户收货地址
            addressControl.getAddressInfo(req, res);
            break;
        case '300008':
            //添加或修改用户收货地址
            addressControl.addOrUpdateAddress(req, res);
            break;
        case '300009':
            //账号管理
            userControl.getUserInfo(req, res);
            break;
        case '300010':
            //修改密码
            userControl.updateUserPassword(req, res);
            break;
        case '300011':
            // sns列表
            postControl.snslist(req, res);
            break;
        case '300012':
            // 修改用户信息---账号管理 个人中心
            userControl.updateUserInfo(req, res);
            break;
        case '300013':
            //行程查询
            travelScheduleControl.getTravelSchedule(req, res);
            break;
        case '300014':
            // 组织注册 弃用，合并到用户登录，登录时注册 改为明星今日动态
            //userControl.orgRegister(req, res);
            travelScheduleControl.todaysDynamicStar(req, res);
            break;
        case '300015':
            // SNS帖子点赞
            postControl.postLikeRelation(req, res);
            break;
        case '300016':
            // 组织登录 弃用接口 改为昨日最活跃组织
            //userControl.orgLogin(req, res);
            userControl.mostActive(req, res);
            break;
        case '300017':
            // SNS帖子评论 / 回复评论
            postControl.postComment(req, res);
            break;
        case '300018':
            // SNS删除帖子评论
            postControl.delUserComment(req, res);
            break;
        case '300019':
            // 我的个人中心 弃用 改为广告位
            //userControl.getMyUserInfoObj(req, res);
            travelScheduleControl.advertisingHome(req, res);
            break;
        case '300020':
            // 他人个人中心 弃用
            //userControl.getOtherUserInfoObj(req, res);
            break;
        case '300021':
            // 签到
            userControl.signIn(req, res);
            break;
        case '300022':
            // 我的身份卡
            groupControl.getIDCard(req, res);
            break;
        case '300023':
            // SNS帖子评论的点赞关系
            postControl.commentLikeRelation(req, res);
            break;
        case '300024':
            // 关注频道
            topicControl.followTopic(req, res);
            break;
        case '300025':
            // 我的频道
            topicControl.getTopicList(req, res);
            break;
        case '300026':
            // 频道-最新频道
            channelControl.getLatestChannels(req, res);
            break;
        case '300028':
       		// SNS帖子分享
       		postControl.postShare(req,res);
       		break;
        case '300029':
            // 背包查询接口
            bagControl.getTicketsInBag(req,res);
            break;
        case '300030':
            //创建频道
            channelControl.createChannel(req, res);
            break;
        case '300031':
            // 奖品设置列表
            bagControl.getTicketSet(req, res);
            break;
        case '300032':
            //删除帖子
            channelControl.removePost(req, res);
            break;
        case '300033':
            //频道页-粉丝团频道-明星列表下频道列表
            channelControl.getGroupChannels(req, res);
            break;
        case '300034':
            //频道页-粉丝团频道-明星列表5条明星数据
            groupControl.getGroupListWithTopChannels(req, res);
            break;
        case '300035':
            //查询频道-推荐频道列表
            channelControl.getTopChannels(req, res);
            break;
       	case '300036':
       		// (个人 / 组织)帖子列表
       		postControl.myPostObj(req,res);
       		break;
       	case '300037':
       		// 帖子点赞关系（公共接口）
       		postControl.topicLikeRelation(req,res);
       		break;
       	case '300038':
       		// 帖子评论 / 回复评论（公共接口）
       		postControl.topicComment(req,res);
       		break;
       	case '300039':
       		// 帖子分享(公共接口)
       		postControl.topicShare(req,res);
       		break;
       	case '300040':
       		// 帖子评论删除（公共接口）
       		postControl.removeComment(req,res);
       		break;
       	case '300041':
       		// 帖子评论的点赞关系（公共接口）
       		postControl.commentLikeRelation(req,res);
       		break;
       	case '300043':
       		// 首页明星->我的组织列表（普通用户）
       		userControl.viewOrganizationList(req, res);
       		break;
       	case '300044':
       		// 查看组织信息（用户查看，组织查看，组织自己查看）
       		userControl.userViewOrganization(req,res);
       		break;
       	case '300045':
       		// 查看组织信息（组织自己） 弃用接口，合并到300044
       		//userControl.ownViewOrganization(req,res);
       		break;
       	case '300046':
       		// 修改组织信息（图像，昵称，背景图等）
       		userControl.orgUpdate(req,res);
       		break;
       	case '300047':
       		// 用户关注或取消关注组织
       		userControl.followOrUnFollowOrg(req,res);
       		break;
       	case '300048':
       		// 在关注的组织打卡（普通用户）
       		userControl.userRecord(req,res);
       		break;
        case '300049':
            // 发帖接口（个人 / 组织）
            postControl.createPost(req,res);
            break;
        case '300050':
            // (个人 / 组织)帖子详情 [帖子基本信息]
            postControl.PostDetailsList(req,res);
            break;
       	case '300051':
       		// app日志接口
       		userControl.createLoginfo(req,res);
       		break;
       	case '300052':
       		// 组织帖子置顶/取消置顶（组织）
            postControl.topOrgTopic(req,res);
       		break;
       	case '300054':
       		// 查看组织豆币（组织）
       		userControl.myBean(req, res);
       		break;
       	case '300055':
       		// 组织豆币提现（组织）
       		userControl.cashBean(req,res);
       		break;
       	case '300056':
       		// 组织帖子评论 弃用 改为咖派小秘书 常见问题
       		secretaryControl.getCommonQuestion(req, res);
       		break;
       	case '300057':
       		// 组织帖子点赞
       		secretaryControl.addQuestion(req, res);
       		break;
       	case '300058':
       		// (个人 / 组织)帖子详情
       		postControl.PostDetails(req,res);
       		break;
       	case '300059':
       		// 我的提问
       		secretaryControl.getMyQuestion(req, res);
       		break;
       	case '300062':
       		// 查看组织粉丝列表
            userControl.getOrgFens(req,res);
       		break;
       	case '300063':
       		// 首页明星查看更多组织
            userControl.moreOrganizationList(req, res);
       		break;
       	//case '300066':
       		// 我的身份卡详情        (弃用，与300022接口合并)
       		//groupControl.getIDCardDetail(req,res);
       		//break;
        case '300067':
            // 我的背包中的豆币券使用接口
            bagControl.useDouBiExchange(req,res);
            break;
        case '300068':
            // 我的背包中的打卡券使用接口
            bagControl.useDakaExchange(req,res);
            break;
        case '300069':
            // 我的背包中的专辑券使用接口
            bagControl.useZhuanjiExchange(req,res);
            break;
        case '300070':
            // 我的背包中的鲜花券使用接口
            bagControl.useFlowerExchange(req,res);
            break;
        case '300071':
        	// SNS 帖子详情接口
        	postControl.snsPostDetails(req,res);
        	break;
//      case '300072':
//      	// 粉丝帖 / 频道帖->帖子详情接口
//      	postControl.myPostDetails(req,res);
//      	break;
        case '300073':
        	// 首页（明星）->粉丝团动态
        	groupControl.fansDynamic(req,res);
        	break;
        case '300074':
        	// 频道主基本信息
        	topicControl.topicHostInfo(req,res);
        	break;
        case '300075':
        	// 频道下的帖子列表
        	topicControl.topicPost(req,res);
        	break;
        case '300076':
        	// 我选择的明星列表
        	groupControl.myStarList(req,res);
        	break;
        case '300078':
        	// 加入/退出该明星粉丝团
        	groupControl.joinOrOutGroup(req,res);
        	break;
        case '300079':
        	// 首页（明星）->粉丝团动态->只看我关注的
        	groupControl.ICareAbout(req,res);
        	break;
        case '300080':
            //获得可抽取的奖券列表
            bagControl.getGiftTicketList(req,res);
            break;
        case '300081':
            //向用户背包中添加兑换券
            bagControl.addTicket(req,res);
            break;
        case '300082':
        	// 组织帖子推送
        	postControl.kpMessage(req, res);
        	break;
        case '300083':
          // 咖派1.5版本选择明星
          groupControl.selectStar(req, res);
          break;
        case '300084':
          // 咖派1.5版本取消明星
          groupControl.deselectStar(req, res);
          break;
        case '300085':
          // 推送消息列表-官方、评论、点赞、回复
          secretaryControl.myMessage(req, res);
          break;
        case '300086':
          // 删除消息
          secretaryControl.removeMessage(req, res);
          break;
        case '301001':
          // 个人中心我的频道
          topicControl.getMyTopicList(req, res);
          break;
          //用户个人中心    我的组织
     	case '301002':
	     	 userControl.getUserByOrg(req, res);
	      	break;
	      //判断今天是否创建过频道
	    case '301003':
	     	 channelControl.isUpTopic(req, res);
	      	break;
        default:
          resObj = responseObj();
          resObj.command = command;
          resObj.status = false;
          resObj.code = '5000';
          res.send(resObj);
    }
});

/**
 * 判断Object对象中的参数是否为空
 * 为空返回参数为空错误信息
 * @param req
 * @param res
 * @param params
 */
function paramsIsNull(req, res, params) {
    var command = req.body.command;
    var object = req.body.object;
    var resObj = responseObj();
    console.log("command:" + command);
    for (var i = 0; i < params.length; i++) {
        if (object.hasOwnProperty(params[i]) == false) {
            resObj.command = command;
            resObj.status = false;
            resObj.code = '4002';
            resObj.object.msg = params[i] + '参数为空';
            res.send(resObj);
            return true;
        }
    }
}
//module.exports.paramsIsNull = paramsIsNull;
module.exports = router;