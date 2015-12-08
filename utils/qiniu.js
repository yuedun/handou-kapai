/**
 * Created by admin on 2015/3/26.
 */
var qiniu = require('qiniu');
//var accessKey = '6CG6fo8XjOhLV-z7g9a-RdfntNFqFEuhTMil-3vy';
//var secretKey = 'NxeiNiy1DATcwu_BBrYQCb8GxVREalSHZi7hSzJ9';
//2015-08-04新建
var accessKey = 'MMk8KcrWCVcd0bHJ2CdeWkBRIkz6wODK8q90mEaE';
var secretKey = 'Axr2rcQQqssCOH9utXAGtrgkQ4XhGH4fFDJ96usm';
// @gist init
qiniu.conf.ACCESS_KEY = accessKey;
qiniu.conf.SECRET_KEY = secretKey;
var qiniuObj ={};
// @endgist

// @gist uptoken获取token
qiniuObj.upToken = function(bucketName, callbackUrl, callbackBody, returnUrl) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName);//只传递一个参数实际上是scope(bucket),其余参数暂不指定
    putPolicy.callbackUrl = callbackUrl || null;//回调地址，即上传成功后七牛服务器调用我的服务器地址,七牛发出的是post请求
    putPolicy.callbackBody = callbackBody || null;//form表单提交的内容会返回
    //putPolicy.returnUrl = returnUrl || null;//上传成功后会返回303重定向状态码，本地会转向这个地址
    //putPolicy.returnBody = returnBody || null;
    //putPolicy.asyncOps = asyncOps || null;
    putPolicy.expires = 3600 * 24 * 365|| null;//uptoken过期时间，默认3600s=1小时
    putPolicy.getFlags(putPolicy);
    return putPolicy.token();
};
// @endgist

// @gist downloadUrl
qiniuObj.downloadUrl = function(domain, key) {
    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var policy = new qiniu.rs.GetPolicy();
    return policy.makeRequest(baseUrl);
};
// @endgist
qiniuObj.uploadBuf = function(body, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;
    qiniu.io.put(uptoken, key, body, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
};

qiniuObj.uploadFile = function(localFile, key, upToken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(upToken, key, localFile, extra, function(err, ret) {
        if(!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
};

/**
   * 删除七牛服务器上的文件
   * @param {Object} bucketName 七牛空间名称
   * @param {Object} key	图片key值
   * @param {Object} callback
   */
qiniuObj.delImage = function(bucketName, key, callback){
	var client = new qiniu.rs.Client();
	client.remove(bucketName, key, function(err, ret) {
	 	if (!err) {
	    	callback();
	 	} else {
	    	callback(err);
	  	}
	});
};

module.exports=qiniuObj;