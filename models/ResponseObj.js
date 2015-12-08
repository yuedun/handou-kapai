/**
 * Created by admin on 2015/4/2.
 */
/**
 * 约定优于配置
 序号	错误码	错误描述（中文）	备注
 1.	0000	成功	ERR_CODE_SUCCESS
 2.	4000	未知命令	ERR_CODE_UNKNOWN_COMMAND
 3.	4001	查询结果为空	ERR_CODE_NO_DATA
 4.	4002	输入参数为空	ERR_CODE_PARAMETER_EMPTY
 5.	4003	输入参数编号为空	ERR_CODE_PARAMETER_ID_EMPTY
 6.	4004	手机号码错误，请重新输入	ERR_CODE_PARAMETER_PHONE_ERROR
 7.	4005	密码错误	ERR_CODE_PARAMETER_PHONE_ERROR
 8.	4009	用户昵称已存在，请重新输入.	ERR_CODE_PARAMETER_NICKNAME_ALREADY_EXISTS
 9.	4010	用户不存在，请重新输入.	ERR_CODE_PARAMETER_USER_NOT_EXISTS
 10.	4011	记录已存在，请重新输入	ERR_CODE_PARAMETER_RECORD_ALREADY_EXISTS
 11.	4012	权限不足,服务器拒绝.	ERR_CODE_INSUFFICIENT_PERMISSIONS
 12.	4013	设备号已注册
 13.	4014	手机号已注册
 14.	4015	邀请码不存在
 15.	4016    组织已存在
 16.    4017    兑换券无效
 16.	5000	内部异常	ERR_CODE_EXCEPTION
 17.	5001	数据读写异常	ERR_CODE_EXCEPTION_IO
 18.	5002	验证码发送失败	ERR_CODE_EXCEPTION
 19.	5003	已经签过到了	
 20.	4017	验证码失效
 21.	5004	昵称已存在,请重新输入
 22.	5005	该用户没有收货信息
 23.	5006  	不能删除别人的帖子哦
 24.	5007        不能删除别人的评论哦
 25. 	5008	每天最多给10条帖子加豆币哦
 26.	5009	发帖失败了哦
 27.    5010    没有奖券
 28.	5011	频道已存在
 29.	5012	帖子类型有误
 30.	5013	用户被锁定
 31.	5014	用户已逻辑删除
 32.	5015	未知用户
 33.    4018    空指针异常，对象为null时获取对象的属性值
 34.    5016    没有可用的打卡券
 35.    5017    今日已经创建过频道了
**/
//var response = {
//    timestamp:new Date().getTime(),
//    command : 0,
//    status : true,
//    code : "0000",
//    object : {},
//    errMsg : function(code, msg){
//        response.code = code;
//        response.object.msg = msg;
//    }
//};
var Response = function() {
    this.timestamp = new Date().getTime();
    this.command = 0;
    this.status = true;
    this.code = "0000";
    this.errorMsg = "";
    this.object = {};
    this.errMsg = function(code, msg) {
        this.code = code;
        this.errorMsg = msg;
    };
    this.setObject = function(object) {
        if (object == null || typeof object !== 'object') {
            this.object = {};
        } else {
            this.object = object;
        }
    };
};

module.exports = function(options) {
    return new Response(options);
};