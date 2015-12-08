require.config({
    paths : {
        jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min", '../jquery-2.1.4.min'],	//配置第三方库，不能加.js后缀
        bootstrap: ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min", "../bootstrap.min"],
        chosen: ["http://apps.bdimg.com/libs/chosen/1.1.0/chosen.jquery.min"],
        colorbox: "jquery.colorbox-min",//Chosen是一款让又长又笨拙的选择框变得让用户感觉很友好的jQuery插件http://www.aitiblog.com/test/chosen/
        autogrow: "jquery.autogrow-textarea",//文本域自动增长
        cookie: "jquery.cookie",//是一个轻量级的Cookie管理插件。http://www.jb51.net/article/44557.htm
        history: "jquery.history",//插件是ajax驱动的页面有后退/前进导航和允许书签
        iphone: "jquery.iphone.toggle",
        raty: "jquery.raty.min",//一个能够自动生成可定制的星级评分jQuery插件。
        upload: "jquery.uploadify.min",
        datatable: "jquery.dataTables.min",
        fullcalendar: "fullcalendar.min",
        moment: "moment.min",
        charisma: "charisma",
        webuploader: "webuploader-0.1.5/webuploader",
        jqueryui: "jquery-ui.min"
    },
    shim: {
        "bootstrap" : {
            deps : ["jquery"],//非AMD模块依赖jquery
            exports :'bs'  
        },
        "chosen": {
            deps: ["jquery"]
        },
        "raty":{
            deps:["jquery"]
        },
        "autogrow":{
            deps:["jquery"]
        },
        "cookie":{
            deps:["jquery"]
        },
        "colorbox":{
            deps:["jquery"]
        },
        "history":{
            deps:["jquery"]
        },
         "iphone":{
            deps:["jquery"]
        },
        "datatable":{
            deps:["jquery"]
        },
        "upload":{
            deps:["jquery"]
        },
        "charisma": {
            deps: ["jquery", "bootstrap", "autogrow", "chosen", "cookie","colorbox", "history", "iphone", "raty", "upload", "datatable", "fullcalendar", "moment"]
        }
    }
});
var saveFlag = 2;
require(["jquery", "charisma","common"], function($, cha,common){
    $(function(){
    	/*var verifyState = $("#verifyState").val();
    	if(verifyState == 1){
    		$("#verifyTrue").attr('checked','true');
    	}else if (verifyState == 0){
    		$("#verifyFalse").attr('checked','true');
    	}else{
    		$("#verifyTrue").attr('checked','true');
    	}*/
    	
    	
    	common.upload($("#qntoken").val());
    	common.uploadPic($("#qntoken").val());
    	
    	//删除logo图片
    	$("#delImg").bind("click", function() {
    		var userId = $("#userId").val();
    		var key = $(this).attr("headvalue");
    		var headItem = $("#headItem");
    		headItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){});
    	});
    	//删除背景大图
    	$("#delImg2").bind("click", function() {
    		var userId = $("#userId").val();
    		var key = $(this).attr("beakvalue");
    		var backItem = $("#backItem");
    		backItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){});
    	});
    	
    	
    	
        //物理删除组织
    	$("a[name='chedi-delete-user']").on("click", function(){
            if(confirm('你确定要删除吗？删除后将不可恢复')){
                location.href = "/admin/user/delete-user?userId="+$(this).attr("id");
            }
        });
        
         //物理删除用户日志
    	$("a[name='deleteLogs']").on("click", function(){
            if(confirm('你确定要删除吗？删除后将不可恢复')){
            	var key = $(this).attr("qkey");
            	/*alert(key)
            	$.get('/admin/image/delete/'+key,function(data){
            	});*/
            	location.href = "/admin/deleteUserLogs?key="+key+"&lid="+$(this).attr("id");
            }
        });
        
        //修改组织和用户状态
        $("a[name='updateState']").on("click", function(){
        	var arr = new Array();
        	var idAndState = $(this).attr("id");
        	arr = idAndState.split(",");
        	var userId = arr[0];
        	var userState = arr[1];
            location.href = "/admin/user/update-state?userId="+userId+"&userState="+userState;
        });
        
        //修改组织登录密码
        $("#updateOrgPwd").click(function(){
        	var oldPwd = $("#oldPwd").val();
        	var newPwd = $("#newPwd").val();
        	var newPwd2 = $("#newPwd2").val();
        	var oldPwdSpan = $("#oldPwdSpan");
        	var newPwdSpan = $("#newPwdSpan");
        	var newPwdSpan2 = $("#newPwdSpan2");
        	if("" == oldPwd){
        		oldPwdSpan.text("旧密码不能为空!");
        	}else{
        		oldPwdSpan.text("");
        	}
        	if("" == newPwd || "" == newPwd2){
        		newPwdSpan.text("新密码不能为空!");
        	}else{
        		newPwdSpan.text("");
        	}
        	if(newPwd != newPwd2){
        		newPwdSpan2.text("两次输入的密码不一致!");
        	}else{
        		newPwdSpan2.text("");
        	}
        	// ajax异步请求后台数据
        	if("" !=oldPwd && "" != newPwd && "" != newPwd2 && newPwd == newPwd2){
				$.post('/outside-admin/org-update-pwd', {
	                password:oldPwd,
	                newpassword:newPwd2
	            }, function(data) {
	            	console.log('data = ' + JSON.stringify(data));
	            	if(data.code == 4005){
	            		oldPwdSpan.text(data.message);
	            	} else {
						Load("/outside-admin/logout");
	            	}
	            });
	        }
        });
        
        //删除兑换券
        $("a[name='delete-ticket']").on('click',function(){
        	var ticketId = $(this).attr("id");
        	if(confirm('你确定要删除吗？删除后将不可恢复')){
                location.href = "/admin/delete-ticket?ticketId="+ticketId;
            }
        });
        
        
        var select1 = $("#select1").val();
        if(undefined != select1){
			if(select1 == 3){
				 $("#select2").attr('disabled',false);
			}else{
				$("#select2").get(0).selectedIndex = 0;
				$("#select2").attr('disabled',true);
			};
		}
		 $("button[name='save']").on('click',function(){
	 	 	saveFlag = $(this).attr("value");
	 	 });	
    });
});

function checkForm(){
	var flag = $("#flag").val();
	var userName = $("#userName").val();
	var password = $("#password").val();
	var groupId = $("#groupId").val();
	var verifyState =  $("input[type='radio']:checked").val();
	var pushDesc = $("#pushDesc").val();
	if(userName == ""){
		$("#userNameSpan").text("组织名称不能为空!");
		return false;
	}else{
		$("#userNameSpan").text("");
	}
	if(password == ""){
		$("#passwordSpan").text("组织密码不能为空!");
		return false;
	}else{
		$("#passwordSpan").text("");
	}
	if(flag == 1){
		$("#userNameSpan").text("组织名称已存在!");
		return false;
	}
	if(groupId == ""){
		$("#starSpan").text("请选择明星!");
		return false;
	}else{
		$("#starSpan").text("");
	}
	var pushFlag = 0;
	if(saveFlag == 2 && verifyState ==0 && pushDesc == ''){
		pushFlag = 1;
		$("#pushDescSpan").text('请输入推送内容!');
		return false;
	}else{
		$("#pushDescSpan").text('');
	}
	if(userName !="" && password !="" && falg != 1 && groupId !="" && pushFlag == 0){
		$("#fm").submit;
		return true;
	}
}
function checkUserName(){
	var userName = $("#userName").val();
	var userId = $("#userId").val();
	$.post('/admin/check/userName', {
		userName: userName,
		userId :userId
	}, function(data) {
		if(data.code == 1909){
			$("#userNameSpan").text(data.message);
			$("#flag").val(1);
		}else{
			$("#flag").val(0);
		}
	});
}


var secs = 3; //倒计时的秒数
var URL ;
function Load(url){
URL = url;
	for(var i=secs;i>=0;i--)
	{
	   window.setTimeout('doUpdate(' + i + ')', (secs-i) * 1000);
	}
}
function doUpdate(num)
{
	$("#success").text ('密码修改成功,将在  '+num+' 秒后自动跳转到登录页') ;
	if(num == 0) { window.location = URL; }
}

function openBean(){
	var select1 = $("#select1").val();
	if(select1 == 3){
		 $("#select2").attr('disabled',false);
	}else{
		$("#select2").get(0).selectedIndex = 0;
		$("#select2").attr('disabled',true);
	};
};
function getText(obj1,obj2){
	var oCtl = document.forms[0].elements[obj2];
	oCtl.value = obj1.options[obj1.selectedIndex].text;
};
function checkBagForm(){
	var select1 = $("#select1").val();
	var select2 = $("#select2").val();
	var isSubstance = $("#isSubstance").val();
	var starLogo = $("input[name = 'starLogo']").val();
	var ticketUsage = $("#ticketUsage").val();
	if(select1 == 3){
		if(select2 == ''){
			if($("#seleSpan").text()==''){
				$("#div_1").append("<label for='sSpan' class='control-label'><font color='DB4854'><span id='seleSpan'>请选择豆币值!</span></font></label>");
			}
			return false;
		}
	}
	else if(starLogo == undefined || starLogo == ''){
		if($("#picSpan").text()==''){
			$("#div_2").append("<label for='picSpan' class='control-label'><font color='DB4854'><span id='picSpan'>图片不能为空!</span></font></label>");
		}
		return false;
	}
	else if(ticketUsage == ""){
		if($("#ticketUsage").text()==''){
			$("#div_3").append("<label for='ticketUsage' class='control-label'><font color='DB4854'><span id='ticketUsage'>券说明不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#bagForm").submit;
		return true;
	};
};




/**
 * 全选.
 */
function checkAll(){
	$("input[name='ids']").each(function(){
		   $(this).prop("checked","checked");
	});  
	$("input[name='keys']").each(function(){
		   $(this).prop("checked","checked");
	});  
	$("#checkAll").css("display","none");
	$("#uncheckAll").css("display","");
}

/**
 * 全不选.
 */
function uncheckAll(){
	$("input[name='ids']").each(function(){
		   $(this).prop("checked","");
	}); 
	$("input[name='keys']").each(function(){
		   $(this).prop("checked","");
	}); 
	$("#uncheckAll").css("display","none");
	$("#checkAll").css("display","");
}

/**
 * 批量删除.
 */
function batchDelete(){
	//判断帖子ID是否为空
	if($("input[name='ids']:checked").size() == 0){
		alert('请至少选择一条!');
		return false;
	}else{
		var delsize = $("input[name='ids']:checked").size();
		if(confirm("确定要删除这" + delsize + "条数据吗?")){
			$("#postForm").attr("action","/admin/batchDeleteLogs");
			$("#postForm").submit();
		}
	}
}

function checkKeys(obj){
	if(obj.checked == true){
		var key=$(obj).closest("td").find("input[name=keys]").prop("checked","checked");;
	}else{
		var key=$(obj).closest("td").find("input[name=keys]").prop("checked","");;
	}
}
    	

