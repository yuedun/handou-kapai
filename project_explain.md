项目目录说明：
============
handou-node
------------
  --bin             项目启动入口 node ./bin/www或者npm start
  --config          配置文件目录，apiUri.js路由配置，config.json数据库连接配置
    -- 112.124.109.194 lofti2014@
  --models          数据表实体对象，M层。
    --app-models    为app专用的model，实现数据库字段转换为小驼峰命名
  --public          静态文件：图片，javascript文件，css样式文件等
  --routes          路由
    --app-controller  app接口控制器
  --services        主要存放数据库查询文件，供路由和控制器通用
  --test            测试文件
  --utils           工具类
    --commonUtil    通用工具ErrMsg用于生成错误码对象使用方法:导入var ErrMsg = require('../../utils/commonUtil').ErrMsg;创建对象new ErrMsg(1234, "错误码");
  --views           web是图层，V层
  --app.js          路由配置，中间件处理
  --gulpfile.js     gulp配置文件
  --package.json    npm管理
  --project_explain  项目说明文件
  --robots.txt      搜索引擎访问控制

代码风格规范：

* 操作符前后加空格，如：var m = 1, var n = 2; n - m = 1;在同一行中逗号和分号后面加空格
- 文件名：在后面加上对应的后缀以便区分作用，如UserController, UserService
- 变量命名：采用小驼峰命名法，如：var userName;表对应实体和类对象用大驼峰命名法，如：User
- 函数方法使用小驼峰，动词命名，如：function getUser(){}
- 函数需写注释
- 回调函数一般需第一个参数为错误信息，如：getUser(userId, function(err, obj){})，无错误返回null即可，callback(null, obj)
- 数据查询返回一条数据最好用单数小驼峰对象名或obj，返回多条数据用复数或list
- 建数据库表字段要有注释
- 字符串尽量使用单引号
其余待补充……

