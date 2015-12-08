require.config({
	paths : {
		jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min",'../jquery-2.1.4.min'],
		bootstrap : ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min","../bootstrap.min"],
		cookie: "jquery.cookie",//是一个轻量级的Cookie管理插件。http://www.jb51.net/article/44557.htm
		history: "jquery.history",//插件是ajax驱动的页面有后退/前进导航和允许书签,折叠菜单必须
		upload: "jquery.uploadify.min",
		webuploader: "webuploader-0.1.5/webuploader",
        jqueryui: "jquery-ui.min"
	},
	shim : {
		"bootstrap" : {
			deps : ["jquery"],
			exports : 'bs'
		},
		"cookie":{
			deps:["jquery"]
		},
		"history":{
			deps:["jquery"]
		},
		"upload":{
            deps:["jquery"]
        },
		"charisma": {
			deps: ["jquery", "bootstrap","cookie", "history"]//简化暂时不需要的插件
		}
	}
});

require(["jquery","bootstrap", "charisma", "common"],function($, bs, char, common){
	$(function(){
		console.log("post-main load finish ... ...!");
		
		common.upload($("#qntoken").val());
		
		// 给推送消息删除按钮绑定事件
		$("a[name='pushDel']").on('click',function(){
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/pushDel?MessageId="+$(this).attr("id")+"";
            }else{
                alert("已取消删除");
            }
		});
		
		// 给推送消息删除按钮绑定事件
		$("a[name='comQDel']").on('click',function(){
			var flag = $(this).attr("flag");
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/commonQuestionDel?flag="+flag+"&secretaryId="+$(this).attr("id")+"";
            }else{
                alert("已取消删除");
            }
		});
		
		// 给常见问题栏超链接绑定事件
		$("a[name='editQuestion']").on('click',function(){
            location.href = "/admin/commonQuestion-edit-ui?secretaryId="+$(this).attr("id")+"";
		});
		
		// 给提问管理列表问题栏超链接绑定事件
		$("a[name='getQuestion']").on('click',function(){
            location.href = "/admin/userQuestionDetail?userId="+$(this).attr("id")+"&secretaryId="+$(this).attr("sid")+"";
		});

		// 给邀请码超链接绑定事件
		$("a[name='icEdit']").on('click',function(){
			location.href = "/admin/invitationCode-edit-ui?invitationCodeId="+$(this).attr("data-id")+"";
		});

		// 给视频列表删除按钮绑定事件
		$("a[name='videoDel']").on('click', function(){
			if(confirm('你确定要删除吗?')){
                location.href = "/admin/video-del?videoId="+$(this).attr("id")+"";
            }else{
                alert("已取消删除");
            }
		});
		
		// 给视频列表视频简介栏超链接绑定事件
		$("a[name='videoDesc']").on('click',function(){
            location.href = "/admin/video-editui?videoId="+$(this).attr("data-id")+"";
		});
		
		// 给视频列表视频地址栏超链接绑定事件
		$("a[name='videoAddress']").on('click',function(){
            location.href = "/admin/video-preview?videoAddress="+$(this).attr("data-vid")+"";
		});
		
		// 删除七牛上的图片
		$("#delImg").bind("click", function() {
    		var key = $(this).attr("value");
    		var headItem = $("#headItem");
    		headItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){
    		});
    	});
		
	});
});













































