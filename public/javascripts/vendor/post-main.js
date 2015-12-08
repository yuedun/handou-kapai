require.config({
	paths : {
		jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min",'../jquery-2.1.4.min'],
		bootstrap : ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min","../bootstrap.min"],
		jqueryui: ["http://apps.bdimg.com/libs/jqueryui/1.10.4/jquery-ui.min.js","../jquery-ui.min"],
		cookie: "jquery.cookie",//是一个轻量级的Cookie管理插件。http://www.jb51.net/article/44557.htm
		history: "jquery.history"//插件是ajax驱动的页面有后退/前进导航和允许书签,折叠菜单必须
	},
	shim : {
		"bootstrap" : {
			deps : ["jquery"],
			exports : 'bs'
		},
		"jqueryui" : {
			deps : ["jquery"]
		},
		"cookie":{
			deps:["jquery"]
		},
		"history":{
			deps:["jquery"]
		},
		"charisma": {
			deps: ["jquery", "bootstrap","cookie", "history"]//简化暂时不需要的插件
		}
	}
});

require(["jquery","bootstrap", "charisma"],function($, bs, char){
	$(function(){
		console.log("post-main load finish ... ...!");
		
		// 给用户帖子删除按钮绑定事件
		$("a[name='userDel']").on('click',function(){
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/userPostUpdate?topicId=" + $(this).attr("id") + "&action=del&userType=user";
            }else{
                alert("已取消删除");
            }
		});
		
		// 给用户帖子查看详情链接绑定事件
		$("a[name='usertopicDesc']").on('click',function(){
            location.href = "/admin/userPost/postDetails?topicId=" + $(this).attr("data-id") + "&userType=user";
		});
		
		// 给组织帖子删除按钮绑定事件
		$("a[name='orgDel']").on('click',function(){
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/userPostUpdate?topicId=" + $(this).attr("id") + "&action=del&userType=org";
            }else{
                alert("已取消删除");
            }
		});
		
		// 给组织帖子恢复按钮绑定事件  
		$("a[name='orgRecover']").on('click',function(){
			if(confirm('你确定要恢复吗?')){
                location.href = "/admin/userPostUpdate?topicId=" + $(this).attr("id") + "&action=recover&userType=org";
            }else{
                alert("已取消恢复");
            }
		});
		
		// 给组织帖子查看详情链接绑定事件
		$("a[name='orgtopicName']").on('click',function(){
            location.href = "/admin/userPost/postDetails?topicId=" + $(this).attr("id") + "&userType=org";
		});
		
		// 给帖子评论删除按钮绑定事件
		$("a[name='postCommentDel']").on('click',function(){
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/postCountUpdate?commentId=" + $(this).attr("id");
            }else{
                alert("已取消删除");
            }
		});

		// 给推送按钮绑定事件
		/*$("a[name='pushMessage']").on('click',function(){
			// 激活弹出框
			$(this).attr('data-toggle','modal');
			$(this).attr('data-target','#myModal');
			// 给messageID 赋值
			var mid = $(this).attr('data-id');		// 拿到当前帖子的ID值
			var oid = $(this).attr('data-userid');	// 拿到当前组织的ID值
			
			$("#messageId").val(mid);           // 填充from表单的messageID值
			$("#orgId").val(oid);				// 天仇from表单的orgId值
		});*/

		// 获取表单的值
		/*$("button[name='sendMessage']").on('click', function(){
			// 获取帖子ID，组织ID 和 推送内容
			var postId = $("#messageId").val();
			var orgId  = $("#orgId").val();
			var chatContent = $("#messageText").val();
			console.log('postId = ' + postId + "    chatContent = " + chatContent + "     orgId = " + orgId);
			location.href = "/admin/orgPostMessage?postId="+postId+"&chatContent="+chatContent+"&orgId="+orgId;
		});*/
	});
});

/**
 * 验证按ID查询isNAN
 */
function changeIDisNaN(){
	var postChoose = $("select[name='conditionid']").val();
	var keyWord = $("#keyWord").val();
	if(0 == postChoose){
		if(isNaN(keyWord)){
			$("#keyWord").val("");
			alert("按编号查询请输入数字");
			return false;
		}
	}
};



      




















