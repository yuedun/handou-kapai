require.config({
	paths : {
		jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min",'../jquery-2.1.4.min'],
		bootstrap : ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min","../bootstrap.min"],
		cookie: "jquery.cookie",//是一个轻量级的Cookie管理插件。http://www.jb51.net/article/44557.htm
        history: "jquery.history"//插件是ajax驱动的页面有后退/前进导航和允许书签,折叠菜单必须
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
       "charisma": {
			deps: ["jquery", "bootstrap","cookie", "history"]//简化暂时不需要的插件
		}
	}
});

require(["jquery","bootstrap","charisma"],function($,bs,char){
	$(function(){
		console.log("jquery load finish ... ...!");
		/**
		 * 单击登陆按钮事件
		 * 参数[用户名 、密码]
		 */
		$("#loginform").on('submit',function(){
			var username = $("#username").val();
			var password = $("#password").val();
			var identifyingCode = $("#identifyingCodeWord").val();
			console.log('username = ' + username + "  , password = " + password);
			// 用户名、密码判空处理
			if('' == username || '' == password){
				$("#warn").css('background-color','#C885A8');				
				$("#warn").text('请检查用户名或密码是否填写完整');
			}else if('' == identifyingCode){
				$("#warn").css('background-color','#C885A8');				
				$("#warn").text('请输入验证码');
			}else{
				// ajax异步请求后台数据
				$.post('/admin/login', {
	                username:username,
	                password:password,
	                identifyingCode:identifyingCode
	            }, function(data) {
	            	console.log('data = ' + JSON.stringify(data));
	            	if(data.code == 4010){
	            		$("#warn").css('background-color','#C885A8');				
						$("#warn").text(data.message);
	            	} else if(data.code == 4005){
	            		$("#warn").css('background-color','#C885A8');				
						$("#warn").text(data.message);
	            	} else if(data.code == 4011){
	            		$("#warn").css('background-color','#C885A8');				
						$("#warn").text(data.message);
						getIdentifyingCode();
	            	}else {
	            		$("#warn").css('background-color','#D9EDF7');				
						$("#warn").text(data.message);
						// 跳转页面 
						window.location.href = "/admin";
	            	}
	            });
	        } 
		});
		
		/**
		 * 得到验证码
		 */
		getIdentifyingCode();
		
		$("#identifyingCode").on('click',function(){
			getIdentifyingCode();
		});
		
		/**
		 * 外部组织登录
		 */
			$("#orgLoginform").on('submit',function(){
			var username = $("#username").val();
			var password = $("#password").val();
			console.log('username = ' + username + "  , password = " + password);
			// 用户名、密码判空处理
			if('' == username || '' == password){
				$("#warn").css('background-color','#C885A8');				
				$("#warn").text('请检查用户名或密码是否填写完整');
			}
			// ajax异步请求后台数据
			$.post('/outside-admin/orglogin', {
                username:username,
                password:password
            }, function(data) {
            	console.log('data = ' + JSON.stringify(data));
            	if(data.code == 4010){
            		$("#warn").css('background-color','#C885A8');				
					$("#warn").text(data.message);
            	} else if(data.code == 4005){
            		$("#warn").css('background-color','#C885A8');				
					$("#warn").text(data.message);
            	} else {
            		$("#warn").css('background-color','#D9EDF7');				
					$("#warn").text(data.message);
					// 跳转页面 
					//window.location.href = "/outside-admin/weiboSuccess";
					//window.location.href = "https://api.weibo.com/oauth2/authorize?client_id=2851583478&response_type=code&redirect_uri=http://handouer.wicp.net/outside-admin/getAccessToken";
            		//window.location.href = "https://api.weibo.com/oauth2/authorize?client_id=2851583478&response_type=code&redirect_uri=http://nodeapi.handouer.cn:9000/outside-admin/org-topic-list";
            		window.location.href = '/outside-admin/org-success';
            	}
            });
		});
		
		//修改用户状态
		$("a[name='updateState']").on("click",function(){
			var arr = new Array();
        	var idAndState = $(this).attr("id");
        	arr = idAndState.split(",");
        	var userId = arr[0];
        	var userState = arr[1];
        	location.href = "/admin/update-user-state?userId="+userId+"&userState="+userState;
		});
		
		//逻辑删除用户
		$("a[name='delete']").on("click",function(){
			var userId = $(this).attr("id");
			if(confirm("确定要删除吗?")){
				location.href = "/admin/update-user-state?userId="+userId+"&userState=-1";
			}
		});
		//物理删除用户
		$("a[name='chedidelete']").on("click",function(){
			var userId = $(this).attr("id");
			if(confirm("确定要删除吗?删除后将不可恢复!!!")){
				location.href = "/admin/chedidelete-user?userId="+userId;
			}
		});
		
		//删除豆币兑换金钱记录
		$("a[name='delete_money']").on("click",function(){
			var moneyId = $(this).attr("id");
			if(confirm("确定要删除吗?删除后将不可恢复!!!")){
				location.href = "/admin/delete-money?moneyId="+moneyId;
			};
		});
		
		//修改组织兑换列表的排序
		$("#add").on("click",function(){
			var tr = $("#ty tr");
			$.each(tr,function(k,v){
				var $sort=$(v).children().find("[name=sortValue]").val();
				var $moneyId=$(v).find("[name=spanMag]").val();
				$.get('/admin/update-sort', {
                sort:$sort,
                moneyId:$moneyId
	            }, function(data) {
	            	location.href = "/admin/org_exchange_list";
	            });
			});
		});
		//逻辑删除组织兑换记录
		$("a[name='delete-exchange']").on('click',function(){
			var exchangeNo = $(this).attr('id');
			if(confirm("确认要删除吗？")){
				location.href='/admin/user_exchange_update?isFinish=-1&exchangeNo='+exchangeNo;
			};
		});
		
		//物理删除豆币加倍列表记录
		$("a[name='delete-bean-double']").on('click',function(){
			var beanDoubleId = $(this).attr('id');
			if(confirm("确认要删除吗？删除后将不可恢复!!!")){
				location.href='/admin/delete-bean-double?beanDoubleId='+beanDoubleId;
			};
		});
		//新增豆币加倍   判断输入其他倍数的文本框可不可用
		$("input[name='beanMultiple']").on('click',function(){
			var value = $(this).attr("value");
			if(value == 0){
				$("#beanMultipleValue").attr("disabled",false);
			}else{
				$("#beanMultipleValue").val('');
				$("#beanMultipleValue").attr("disabled",true);
			};
		});
		$("#beanMultipleValue").on('keyup',function(){
			 var reg = new RegExp("^[0-9]*$");
			  if(!reg.test($("#beanMultipleValue").val())){
				alert("请输入数字");
				$("#beanMultipleValue").val('');
     		}	
		});
		
		
		/**
		 * 物理删除打卡礼品表
		 */
		$("a[name='delete-record-gift']").on('click',function(){
			var id = $(this).attr('id');
			if(confirm("确认要删除吗？删除后将不可恢复!!!")){
				location.href='/admin/deleteRecordGift?id='+id;
			};
		});
		
		/**
		 * 物理删除组织打卡记录
		 */
		$("a[name='delete-org-record']").on('click',function(){
			var recordId = $(this).attr('id');
			if(confirm("确认要删除吗？删除后将不可恢复!!!")){
				location.href='/admin/deleteOrgRecord?recordId='+recordId;
			};
		});
		
		/**
		 * 物理删除组织兑换记录  组织豆币兑换金钱
		 */
		$("a[name='delete-exchange-log']").on('click',function(){
			var id = $(this).attr('id');
			if(confirm("确认要删除吗？删除后将不可恢复!!!")){
				location.href='/admin/deleteExchangeLog?id='+id;
			};
		});
		
	});
});



function checkBeanDoubleForm(){
	var beanStarTime = $("#beanStarTime").val();
	var beanEndTime = $("#beanEndTime").val();
	var beanMultiple = document.getElementById("beanMultiple");
	if(beanStarTime == ''){
		if($("#startDateSpan").text()==''){
			$("#div_1").append("<label for='startDateSpan' class='control-label'><font color='DB4854'><span id='startDateSpan'>起始日期不能为空!</span></font></label>");
		};
		return false;
	}else if (beanEndTime == ''){
		if($("#endDateSpan").text()==''){
			$("#div_2").append("<label for='endDateSpan' class='control-label'><font color='DB4854'><span id='endDateSpan'>结束日期不能为空!</span></font></label>");
		};
		return false;
	}else if(beanMultiple.checked==true){
		if($("#beanMultipleValue").val()==''){
			if($("#beanSpan").text()==''){
			$("#div_3").append("<label for='beanSpan' class='control-label'><font color='DB4854'><span id='beanSpan'>请输入倍数!</span></font></label>");
			};
			return false;
		}
	}else{
		$("#fm").submit;
		return true;
	};
};



function getIdentifyingCode(){
	$.post('/identifying-code', {}, function(data) {
		var c= document.getElementById("mycanvas");
		var cxt = c.getContext("2d");
		var cxt2 = c.getContext("2d");
		var grd=cxt2.createLinearGradient(0,0,175,60);
		grd.addColorStop(0,"#fff");
		grd.addColorStop(1,"gray");
		cxt.fillStyle=grd;
		cxt2.fillRect(0,0,375,160);
		cxt.fillStyle="#000000";
		cxt.font = "80px Arial";
		cxt.strokeText(data,50,95);
	});	
};












