require.config({
    paths : {
        jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min", '../jquery-2.1.4.min'],	//配置第三方库，不能加.js后缀
        bootstrap: ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min", "../bootstrap.min"],
        chosen: ["http://apps.bdimg.com/libs/chosen/1.1.0/chosen.jquery.min"],
        colorbox: "jquery.colorbox-min",//Chosen是一款让又长又笨拙的选择框变得让用户感觉很友好的jQuery插件http://www.aitiblog.com/test/chosen/
        autogrow: "jquery.autogrow-textarea",//文本域自动增长
        cookie: "jquery.cookie",//是一个轻量级的Cookie管理插件。http://www.jb51.net/article/44557.htm
        history: "jquery.history",//插件是ajax驱动的页面有后退/前进导航和允许书签,折叠菜单必须
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
        //"charisma": {
        //    deps: ["jquery", "bootstrap", "autogrow", "chosen", "cookie","colorbox", "history", "iphone", "raty", "upload", "datatable", "fullcalendar", "moment"]
        //}
        "charisma": {
            deps: ["jquery", "bootstrap", "cookie", "history"]//简化暂时不需要的插件
        }
    }
});
require(["jquery", "charisma", "common"], function($, cha, common){
    $(function(){
        console.log("load finished");		
		// Logo上传
        var qntoken = $("#qntoken").val();
        common.upload(qntoken);
		// 多图片上传
		common.uploadPic(qntoken);
		common.uploadVoice(qntoken);//上传语音文件
        //修改时删除图片,参数为
        common.delLogo($("input[name='starLogo']").val());
        //日期选择控件-添加组织帖子
        //common.chooseDate("releaseDate");
        //删除图片
    	$("a[id=delImgTopic]").each(function(){
    		$(this).bind('click',function(){
    			var key = $(this).attr("pic");
    			var i = $(this).attr("i");
    			var item = $("#item"+i);
    			item.remove();
    			$.get('/admin/image/delete/'+key,function(data){
    			});	
    		});
    	});
        
        //删除明星
        $("a[name='delete']").on("click", function(){
            if(confirm('你确定要删除吗？')){
                location.href = "/admin/groupUpdate/"+$(this).attr("id")+"?action=-1";
            }
        });
        //删除logo图片
    	$("#delImg").bind("click", function() {
    		var key = $(this).attr("headvalue");
    		var headItem = $("#headItem");
    		headItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){});
    	});
    	//删除背景大图
    	$("#delImg2").bind("click", function() {
    		var key = $(this).attr("beakvalue");
    		var backItem = $("#backItem");
    		backItem.remove();
    		$.get('/admin/image/delete/'+key,function(data){});
    	});
    	//删除语音
    	$("#delaudio").bind("click", function() {
    		var key = $(this).attr("audioValue");
    		var audioitem = $("#audioitem");
    		audioitem.remove();
    		$.get('/admin/image/delete/'+key,function(data){
    		});
    	})
    	//逻辑删除内部组织
    	$("a[name='deleteOrg']").on("click", function(){
            if(confirm('你确定要删除吗？')){
                location.href = "/admin/orgUpdate/"+$(this).attr("id")+"?action=del";
            }
        });
    	  //物理删除内部组织
    	$("a[name='chediDeleteOrg']").on("click", function(){
            if(confirm('你确定要删除吗？删除后将不可恢复')){
                location.href = "/admin/user/delete-user?flag=inner&userId="+$(this).attr("id");
            }
        });
        //逻辑删除内部组织帖子
        $("a[name='deleteTopic']").on("click", function(){
        	var orgId = $(this).attr("orgId");
        	var id = $(this).attr("id");
            if(confirm('你确定要删除吗？')){
                location.href = "/admin/orgTopicUpdateState?topicId="+id+"&topicState=-1&orgId="+orgId;
            }
        });
        //物理删除内部组织帖子
        $("a[name='chediDeleteTopic']").on("click", function(){
        	var orgId = $(this).attr("orgId");
        	var id = $(this).attr("id");
            if(confirm('你确定要删除吗？删除后将不可恢复!!!')){
                location.href = "/admin/delInnerOrgTopic?topicId="+id+"&topicState=-1&orgId="+orgId;
            }
        });
        
        //逻辑删除频道
        $("a[name='delTopicPD']").on('click',function(){
        	var topicId = $(this).attr("id");
        	if(confirm('你确定要删除吗？')){
                location.href = "/admin/topicUpdate/"+topicId+"?action=del";
            }
        });
        //物理删除频道
        $("a[name='chediDelTopicPD']").on('click',function(){
        	var id = $(this).attr("id");
        	 if(confirm('你确定要删除吗？删除后将不可恢复!!!')){
                location.href = "/admin/delInnerOrgTopic?flag=topicPD&topicId="+id;
            }
        });
        
        $("a[name='showToggle']").on("click",function(){
        	var topicId = $(this).attr("id");
        	var orgId = $(this).attr("orgId");
			var html = "<div class='modal-dialog' role='document'>";
				html += "<div class='modal-content'>";
				html += "<div class='modal-header'>";
				html +=" <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
				html +="<h4 class='modal-title' id='myModalLabel'>推送内容</h4>";
				html +="</div>";
				html +="<form class='form-inline' action='/admin/innerOrgPostMessage' method='get' id='checkPlusForm' onsubmit='return checkPlus()'>";
				html +="<div class='modal-body'>";
				html +="<input type='hidden' name='topicId' value='"+topicId+"'/>"
				html +="<input type='hidden' name='orgId' value='"+orgId+"'/>"
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
        
        //选择了立即发布就不能选择定时发布时间
        if(document.getElementById('atRelease').checked){
    		$("#releaseDate").attr('disabled','true');
    	}else{
    		$("#releaseDate").removeAttr('disabled');
    	}
    	
    	$("#atRelease").on('click',function(){
    		var timedReleaseDate = $("#releaseDate");
    		if(document.getElementById('atRelease').checked){
    			timedReleaseDate.val('');
    			timedReleaseDate.attr("disabled",true);
    		}else{
	    		timedReleaseDate.removeAttr('disabled');
    		}
    	});
    });
});


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
function checkForm(){
	var topicName = $("#topicName").val();
	var topicDesc = $("#topicDesc").val();
	var audio = document.getElementById("audio")
	$("#audioTime").val(audio.duration);
	if(topicName == ""){
		if($("#topicNameSpan").text()==''){
		$("#div_1").append("<label for='topicNameSpan' class='control-label'><font color='DB4854'><span id='topicNameSpan'>帖子标题不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#div_1").append("<label for='topicNameSpan' class='control-label'><font color='DB4854'><span id='topicNameSpan'></span></font></label>");
	}
	if(topicDesc == ""){
		if($("#topicDescSpan").text()==''){
		$("#div_2").append("<label for='topicDescSpan' class='control-label'><font color='DB4854'><span id='topicDescSpan'>帖子内容不能为空!</span></font></label>");
		}
		return false;
	}else{
		$("#div_2").append("<label for='topicDescSpan' class='control-label'><font color='DB4854'><span id='topicDescSpan'></span></font></label>");
	}
	if(topicName !="" && topicDesc !=""){
		return true;
		$("#fm").submit;
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
