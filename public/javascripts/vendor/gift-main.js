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
require(["jquery", "charisma","common"], function($, cha,common){
    $(function(){
    	
    	var defaultState = $("#defaultState").val();
    	if(defaultState == 0){//待确定
    		$("#remarksid").hide();
			$("#kdinfoid").hide();
			$("#expressName").attr('disabled','true');
			$("#expressNumber").attr('disabled','true');
    	};
    	if (defaultState ==1){//准备中
    		$("#remarksid").show();
			$("#kdinfoid").hide();
			$("#expressName").attr('disabled','true');
			$("#expressNumber").attr('disabled','true');
    	};
    	if(defaultState ==2 || defaultState == -1){
    		$("#remarksid").show();
			$("#kdinfoid").show();
			$("#freezeBean").attr('readonly','true');				
			$("#name").attr('readonly','true');					
			$("#phone").attr('readonly','true');				
			$("#details").attr('disabled','true');				
			$("#expressName").removeAttr('disabled');
			$("#expressNumber").removeAttr('disabled');
    	};
    	
    	
    	
    	common.upload($("#qntoken").val());
    	 //日期选择控件-添加组织帖子
        //common.chooseDate("startDate");
        //common.chooseDate("endDate");
    	
    		//删除图片
    	$("#delImg").bind("click", function() {
    		var key = $(this).attr("headvalue");
    		var headItem = $("#headItem");
    		headItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){
    		});
    	});
    	
    	
		//物理删除礼品
		$("a[name='delete']").on('click',function(){
			var giftId = $(this).attr('id');
			if(confirm('确认要删除吗?删除后将不可恢复!!!')){
				location.href='/admin/delete-gift?giftId='+giftId;
			};
		});
		
		
		//删除礼品兑换
		$("a[name='delete-exchange']").on('click',function(){
			var id = $(this).attr('id');
			if(confirm('确认要删除吗?删除后将不可恢复!!!')){
				location.href='/admin/delete-exchange-gift?id='+id;
			}	
		});
		
		
    });
});

function onText(args){
	var state = args.value;
	if(state == 0 ){
		$("#remarksid").hide();
		$("#kdinfoid").hide();
		$("#expressName").attr('disabled','true');
		$("#expressNumber").attr('disabled','true');
	}else if (state == 1){
		$("#remarksid").show();
		$("#kdinfoid").hide();
		$("#expressName").attr('disabled','true');
		$("#expressNumber").attr('disabled','true');
	}else if(state ==2){
		alert("要填写快递信息哦!");
		$("#remarksid").show();
		$("#kdinfoid").show();
		$("#freezeBean").attr('readonly','true');				
		$("#name").attr('readonly','true');					
		$("#phone").attr('readonly','true');				
		$("#details").attr('disabled','true');			
		$("#expressName").removeAttr('disabled');
		$("#expressNumber").removeAttr('disabled');
	}else if (state == -1){
		$("#remarksid").hide();
		$("#kdinfoid").hide();
	};
};

function checkForm(){
	var giftName = $("#giftName").val();
	var bean = $("#bean").val();
	var starLogo = $("input[name = 'starLogo']").val();
	if(giftName == ""){
		if($("#giftNameSpan").text()==''){
			$("#div_1").append("<label for='giftNameSpan' class='control-label'><font color='DB4854'><span id='giftNameSpan'>礼品名称不能为空!</span></font></label>");
		}
		return false;
	}
	else if(bean == ""){
		if($("#beanSpan").text()==''){
			$("#div_2").append("<label for='beanSpan' class='control-label'><font color='DB4854'><span id='beanSpan'>对应豆币不能为空!</span></font></label>");
		}
		return false;
	}
	else if(isNaN(bean)){
		if($("#beanSpan").text()==''){
			$("#div_2").append("<label for='beanSpan' class='control-label'><font color='DB4854'><span id='beanSpan'>请输入数字!</span></font></label>");
		}
		return false;
	}
	else if(starLogo == undefined || starLogo == ''){
		if($("#picSpan").text()==''){
			$("#div_3").append("<label for='picSpan' class='control-label'><font color='DB4854'><span id='picSpan'>图片不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#fm").submit;
		return true;
	};
};
