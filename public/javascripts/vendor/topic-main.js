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
    	
    	common.upload($("#qntoken").val());
    	common.uploadVoice($("#qntoken").val());
    	//common.chooseDate("timedReleaseDate");
    	//common.chooseDate("startDate");
    	//common.chooseDate("endDate");
    	
		var tabFlag = $("#stateFlag").val();
		if(tabFlag){
			if(tabFlag == 1){
				var verify =$("#verify");
				var unverify =$("#unverify");
				$(unverify).attr("class", "");
				$(verify).attr("class", "active");
			}else if(tabFlag == -2){
				var verify =$("#verify");
				var unverify =$("#unverify");
				$(verify).attr("class", "");
				$(unverify).attr("class", "active");
			}
		}
    	
    	
    	//删除图片
    	$("a[id=delImg]").each(function(){
    		$(this).bind('click',function(){
    			var key = $(this).attr("pic");
    			var i = $(this).attr("i");
    			var item = $("#item"+i);
    			item.remove();
    			$.get('/admin/image/delete/'+key,function(data){
    			});	
    		});
    	});
    	
    	//删除语音
    	$("#delaudio").bind("click", function() {
    		var key = $(this).attr("audioValue");
    		var audioitem = $("#audioitem");
    		audioitem.remove();
    		$.get('/admin/image/delete/'+key,function(data){
    		});
    	})
    	
    	//删除帖子
    	$("a[name='delete']").on("click", function(){
            if(confirm('你确定要删除吗？')){
                location.href = "/outside-admin/topic/delete?topicId="+$(this).attr("id")+"&topicState=-1";
            }else{
                alert("删除失败！");
            }
        });
        //修改帖子状态
        $("a[name='updateState']").on("click", function(){
        	var releaseState = $(this).attr("releaseState");
        	var arr = new Array();
        	var idAndState = $(this).attr("id");
        	arr = idAndState.split(",");
        	var topicId = arr[0];
        	var topicState = arr[1];
            location.href = "/outside-admin/topic/update-state?topicId="+topicId+"&releaseState="+releaseState+"&topicState="+topicState;
        });
        
        //彻底删除帖子
        $("a[name='chedi_delete']").on("click", function(){
            if(confirm('你确定要删除吗？删除后将不可恢复!!')){
                location.href = "/outside-admin/topic/chedi-delete?topicId="+$(this).attr("id");
            }else{
                alert("删除失败！");
            }
        });
        
        //删除微博帖子
        $("a[name='weiboDelete']").on('click',function(){
        	 if(confirm('你确定要删除吗？')){
        	 	var state = $("#stateFlag").val();
                location.href = "/admin/weiboDelete?state="+state+"&topicId="+$(this).attr("id");
            }
        });
        
        $("a[name='showToggle']").on("click",function(){
        	var topicId = $(this).attr("id");
			var html = "<div class='modal-dialog' role='document'>";
				html += "<div class='modal-content'>";
				html += "<div class='modal-header'>";
				html +=" <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
				html +="<h4 class='modal-title' id='myModalLabel'>推送内容</h4>";
				html +="</div>";
				html +="<form class='form-inline' action='/outside-admin/topic-push' method='get' id='checkPlusForm' onsubmit='return checkPlus()'>";
				html +="<div class='modal-body'>";
				html +="<input type='hidden' name='topicId' value='"+topicId+"'/>"
				html +="<textarea style='height: 200px;width: 560px;resize: none;' id='plusContent' name='plusContent' placeholder='请输入推送内容...'></textarea>";
				html +="</div>";
				html +="<div class='modal-footer'>";
				html +="<button type='button' class='btn btn-default' data-dismiss='modal'>关闭</button>";
				html +="<button type='submit' class='btn btn-primary'>发送</button>";
				html +="</form>"
				html +="</div></div>";
				$('#myModal .modal-dialog').remove();
				$('#myModal').append(html);
				$('#myModal').modal('show');
		});
		
		if(document.getElementById('atReleaseDate').checked){
    		$("#timedReleaseDate").attr('disabled','true');
    	}else{
    		$("#timedReleaseDate").removeAttr('disabled');
    	}
    	
    	$("#atReleaseDate").on('click',function(){
    		var timedReleaseDate = $("#timedReleaseDate");
    		if(document.getElementById('atReleaseDate').checked){
    			timedReleaseDate.val('');
    			timedReleaseDate.attr("disabled",true);
    		}else{
	    		timedReleaseDate.removeAttr('disabled');
    		}
    	});
        
    });
});


function checkForm(){
	//var flag = $("#flag").val();
	var topicName = $("#topicName").val();
	var topicDesc = $("#topicDesc").val();
	var imgSize = [];
	var length = document.getElementsByName('imgArr').length;
	for(var i =0;i<length;i++){
		var img = document.getElementsByName('imgArr')[i];
		imgSize.push(img.naturalWidth+"*"+img.naturalHeight);
	}
	$("#picsSize").val(imgSize);
	if(topicName == ""){
		$("#topicNameSpan").text("帖子标题不能为空!!");
		return false;
	}else{
		$("#topicNameSpan").text("");
	}
	/*if(flag == 0){
		$("#topicNameSpan").text("");
	}else{
		$("#topicNameSpan").text("帖子标题已存在!");
		return false;
	}*/
	if(topicDesc == ""){
		$("#topicDescSpan").text("帖子内容不能为空!!");
		return false;
	}else{
		$("#topicDescSpan").text("");
	}
	if(topicName !="" && topicDesc !="" && flag != 1){
		var audio = document.getElementById("audio")
		$("#audioTime").val(audio.duration);
		return true;
		$("#fm").submit;
	}
}

/*function checkTopic(){
	var topicName = $("#topicName").val();
	var topicId = $("#topicId").val();
	$.post('/outside-admin/check/topicName', {
		topicName: topicName,
		topicId:topicId
	}, function(data) {
		if(data.code == 1909){
			$("#topicNameSpan").text(data.message);
			$("#flag").val(1);
		}else{
			$("#flag").val(0);
		}
	});
}*/


function checkPlus(){
	var plusContent = $("#plusContent").val();
	if(plusContent == ""){
		if($("#plusSpan").text()==''){
		$(".modal-body").append("<label for='plusSpan' class='control-label'><font color='DB4854'><span id='plusSpan'>推送内容不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#checkPlusForm").submit;
		return true;
	};
};




function checkWeiboForm(){
	var imgSize = [];
	var length = document.getElementsByName('imgArr').length;
	for(var i =0;i<length;i++){
		var img = document.getElementsByName('imgArr')[i];
		imgSize.push(img.naturalWidth+"*"+img.naturalHeight);
	}
	$("#picsSize").val(imgSize);
};


/**
 * 全选.
 */
function checkAll(){
	$("input[name='ids']").each(function(){
		   $(this).prop("checked","checked");
	});  
	$("#checkAll").css("display","none");
	$("#uncheckAll").css("display","");
};

/**
 * 全不选.
 */
function uncheckAll(){
	$("input[name='ids']").each(function(){
		   $(this).prop("checked","");
	}); 
	$("#uncheckAll").css("display","none");
	$("#checkAll").css("display","");
};

/**
 * 批量删除.
 */
function batchDelete(){
	//判断帖子ID是否为空
	if($("input[name='ids']:checked").size() == 0){
		alert('请至少选择一条帖子!');
		return false;
	}else{
		var state = $("#stateFlag").val();
		var delsize = $("input[name='ids']:checked").size();
		if(confirm("确定要删除这" + delsize + "条数据吗?")){
			$("#postForm").attr("action","/admin/batchDelete");
			$("#postForm").submit();
		}
	}
};

/**
 * 验证按ID查询isNAN
 */
function changeIDisNaN(){
	var postChoose = $("select[name='postChoose']").val();
	var keyWord = $("#keyWord").val();
	if(2 == postChoose){
		if(isNaN(keyWord)){
			$("#keyWord").val("");
			alert("按编号查询请输入数字");
			return false;
		}
	}
};
