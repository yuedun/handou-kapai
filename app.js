var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var ejs = require('ejs');
var config = require('./config/config');
var Response = require('./models/ResponseObj');

// application inferface routes
var gift = require('./routes/giftRoute');
var users = require('./routes/usersRoute');
var news = require('./routes/newsRoute');
var newswx = require('./routes/newsWXRoute');
var picture = require('./routes/pictureRoute');
var weixin = require('./routes/weixinRoute');
var post = require('./routes/postRoute');
var appInterface = require('./routes/appInterface');
var test = require('./test/TestRoute'); //测试路由
var html = require('./routes/html');
var portal = require('./routes/portalRoute');
var duoshuo = require('./routes/duoshuoRoute');
var kpUser = require('./routes/kpUserRoute');
var group = require('./routes/groupRoute');//粉丝团（明星）
var outTopic = require('./routes/topicOutRoute');//帖子（频道）
var topic = require('./routes/topicRoute');//内部小编帖子（频道）
var adver = require('./routes/adverRoute');//（广告）
var pushTest = require('./routes/pushTest');
var message = require('./routes/messageRoute');	// 消息
var kpGift = require('./routes/kpGiftRoute');	// 咖派礼品
var video = require('./routes/videoRoute');
var weiboDataRoute = require('./routes/weiboDataRoute');	// 微博数据爬取Route

var app = express();
app.set('env', 'production');//测试环境使用，生产注释掉
//app.set('env', 'production');//生产环境
if (app.get('env') !== 'development') {
    app.enable('trust proxy');
}
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/images/favicon32.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({
    reviver: function(k, v) {
        //console.log(k);//输出post请求的json数据
        return v;
    },
    verify: function(req, res, buf, encoding) { 
        //console.log('encoding is: ' + encoding);//输出post请求的编码
    }
})); // for parsing application/json
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
})); // for parsing application/x-www-form-urlencoded with qs
app.use(multer()); // for parsing multipart/form-data
app.use(cookieParser());

// 设置会话超时时间
var timeout = 60 * 60 * 1000;			// 一个小时
var effectiveTime = new Date(Date.now());
// 设置会话参数
app.use(session({
	//	store:8000 RedisStore(options),
	name:'connect.sid',//这里的name值得是cookie的name，默认cookie的name是：connect.sid 
	secret:'1234567890QWERTY',
	cookie: {
//		maxAge:effectiveTime,  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期 
		secure: false
	},  
	resave: true, // 即使 session 没有被修改，也保存 session 值，默认为 true。
  	saveUninitialized: true
}));

//登陆验证
app.use('/admin',function(req,res,next){
	//session不存在并且不是登陆页面时跳转到对应的页面
	if (!req.session.sessionUser && req.url == "/login") {
		next();
	} else if(req.session.sessionUser){
		app.locals.sessionUser = req.session.sessionUser;
		next();
	} else {
		//否则跳转到登陆页面
		res.render('admin/login',{});
	}
});

//外部组织登录验证
app.use('/outside-admin',function(req,res,next){
	//session不存在并且不是登陆页面时跳转到对应的页面
	if (!req.session.outsideSessionUser && req.url == "/orglogin") {
		next();
	} else if(req.session.outsideSessionUser){
		app.locals.outsideSessionUser = req.session.outsideSessionUser;
		next();
	} else {
		//否则跳转到登陆页面
		res.render('outside/org_login',{});
	}
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(gift);
app.use(users);
app.use(news); //资讯
app.use(newswx); //微信资讯
app.use(picture); //狗血大片
app.use('/weixin', weixin); //微信狗血大片
app.use(post); //帖子分享
app.use(appInterface); //app统一接口入口
app.use(test); //测试
app.use('/html', html);
app.use('/portal', portal);
app.use(duoshuo);
app.use('/admin', kpUser);	// 咖派用户模块路由
app.use('/admin', group);//明星（粉丝团）
app.use('/outside-admin', outTopic);//帖子（频道）
app.use('/admin', topic);//内部帖子（频道）
app.use('/admin', adver);//（广告）
app.use('/admin', message);// 消息
app.use('/push',pushTest);
app.use('/admin', kpGift);// 咖派礼品
app.use('/videos',video);//咖派视频
app.use(weiboDataRoute);// 微博数据爬取
app.locals.download_website = config.qiniu.download_website;
app.locals.defaul_gift_img = config.qiniu.defaul_gift_img;
app.locals.defaul_user_head = config.qiniu.defaul_user_head;
app.locals.portal_base_url = config.portal_base_url;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//错误处理程序

//开发错误处理程序
//将打印堆栈跟踪
if (app.get('env') === 'development') {
    console.log("******err******"+app.get('env'));
    app.use(function(err, req, res, next) {
        if((req.url === '/lofti/api/' || req.url === '/lofti/api') && req.body.command != null){
            //如果是接口返回json错误数据
            var resObj = Response();
            resObj.command = req.body.command;
            resObj.errMsg(500, err.message);
            res.send(resObj);//在生产环境中也会执行，需要修改
        } else {
            //页面路由返回错误页面
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
}

//生产错误处理程序
//没有堆栈跟踪泄露给用户
app.use(function(err, req, res, next) {
    console.log("******err******"+app.get('env'));
    if((req.url === '/lofti/api/' || req.url === '/lofti/api') && req.body.command != null){
        //如果是接口返回json错误数据
        var resObj = Response();
        resObj.command = req.body.command;
        resObj.errMsg(500, err.message);
        res.send(resObj);//在生产环境中也会执行，需要修改
    } else {
        //页面路由返回错误页面
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});

module.exports = app;