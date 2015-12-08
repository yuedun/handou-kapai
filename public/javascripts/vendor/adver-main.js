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
require(["jquery", "charisma","common","cookie","history"], function($, cha,common){
    $(function(){
    	
    	
    	
    	common.upload($("#qntoken").val());
    	
    	/**
    	 * 修改广告状态
    	 */
    	 $("a[name='updateState']").on("click", function(){
    	 	var releaseState = $(this).attr("releaseState");
        	var arr = new Array();
        	var idAndState = $(this).attr("id");
        	arr = idAndState.split(",");
        	var adverId = arr[0];
        	var state = arr[1];
            location.href = "/admin/update-adver-state?adverId="+adverId+"&releaseState="+releaseState+"&state="+state;
        });
        
        /**
         * 逻辑删除广告
         */
         $("a[name='delete']").on("click", function(){
        	var adverId = $(this).attr("id");
        	if(confirm("确认要删除吗？")){
        		location.href = "/admin/update-adver-state?adverId="+adverId+"&state=-1";
        	}
        });
        /**
         * 物理删除广告
         */
        $("a[name='chedi_delete']").on('click',function(){
        	var adverId = $(this).attr("id");
        	if(confirm("确认要删除吗？删除后将不可恢复!!!")){
        		location.href = "/admin/delete-adver?adverId="+adverId;
        	}
        });
        
        $("#delImg").bind("click", function() {
    		var key = $(this).attr("value");
    		var headItem = $("#headItem");
    		headItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){
    		});
    	});
    	
    	
    	if($("#scope1").attr('checked')=='checked'){
    		$("select[name='groupId']").attr('disabled',true);
    	}else{
    		$("select[name='groupId']").attr('disabled',false);
    	}
    	$("#scope1").on('click',function(){
    		$("select[name='groupId']").get(0).selectedIndex = 0;
    		$("select[name='groupId']").attr('disabled',true);
    	});
    	$("#scope2").on('click',function(){
    		$("select[name='groupId']").attr('disabled',false);
    	});
    	
    	if(document.getElementById('atReleaseDate').checked){
    		$("#timedReleaseDate").attr('disabled','true');
    	}else{
    		$("#timedReleaseDate").removeAttr('disabled');
    	}
    	
    	$("#atReleaseDate").on('click',function(){
    		var timedReleaseDate = $("#timedReleaseDate");
    		if(document.getElementById('atReleaseDate').checked){
    			timedReleaseDate.attr("disabled",true);
    		}else{
	    		timedReleaseDate.removeAttr('disabled');
    		}
    	});
        
    });
});

function checkForm(){
	var scope2 = document.getElementById("scope2");
	var adverTitle = $("#adverTitle").val();
	var starLogo = $("input[name = 'starLogo']").val();
	var linkValue = $("#linkValue").val();
	if(adverTitle == ""){
		if($("#titleSpan").text()==''){
			$("#div_1").append("<label for='titleSpan' class='control-label'><font color='DB4854'><span id='titleSpan'>广告标题不能为空!</span></font></label>");
		}
		return false;
	}
	else if(scope2.checked == true){
		if($("#groupId").val() == ""){
			if($("#groupSpan").text()==''){
			$("#div_4").append("<label for='groupSpan' class='control-label'><font color='DB4854'><span id='groupSpan'>粉丝团不能为空!</span></font></label>");
			}
			return false;
		}
	}
	else if(starLogo == undefined){
		if($("#picSpan").text()==''){
			$("#div_2").append("<label for='picSpan' class='control-label'><font color='DB4854'><span id='picSpan'>图片不能为空!</span></font></label>");
		}
		return false;
	}
	else if(linkValue == ''){
		if($("#linkValueSpan").text()==''){
			$("#div_3").append("<label for='linkValueSpan' class='control-label'><font color='DB4854'><span id='linkValueSpan'>具体链接不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#fm").submit;
		return true;
	}
}

