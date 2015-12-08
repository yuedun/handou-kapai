/**
 * 公共js,上传图片
 */
define(['jquery', "webuploader", "jqueryui"], function($, WebUploader, jui) {
	return {
		upload: function(token) {
			//上传图片
			var uploader = WebUploader.create({
				// 选完文件后，是否自动上传
				auto: true,
				// swf文件路径
				swf: '/webuploader-0.1.5/Uploader.swf',
				// 文件接收服务端。
				server: 'http://upload.qiniu.com/',
				// 选择文件的按钮。可选。
				// 内部根据当前运行是创建，可能是input元素，也可能是flash.
				pick: '#picker',
				// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
				resize: false,
				// 只允许选择图片文件。
				accept: {
					title: 'Images',
					extensions: 'gif,jpg,jpeg,bmp,png',
					mimeTypes: 'image/*'
				},
				formData: {
					token: token
				},
				duplicate: true, // 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key
				fileNumLimit: 9	 // 超出则不允许加入队列
			});

			// 当有文件被添加进队列的时候
			uploader.on('fileQueued', function(file) {
				$("#thelist").append(
				  '<div id="' + file.id + '" class="item">' +
					  '<h5 class="info">' + file.name + '</h5>' +
					  '<img src="http://7xl3sp.com2.z0.glb.qiniucdn.com/doudou.png" class="imageStarLogo" name="imgArr">' +
					  '<input type="hidden" class="qkey" name="starLogo" value="">' +
					  '<a href="#"  id="img_'+ file.id +'" class="delpic"> 删  除 </a>' +
				  '</div>'
				);
			});

			// 文件上传过程中创建进度条实时显示。
			uploader.on('uploadProgress', function(file, percentage) {
				var $li = $('#' + file.id),
					$percent = $li.find('.progress .progress-bar');
				// 避免重复创建
				if (!$percent.length) {
					$percent = $(
						'<div class="progress progress-striped active">' +
						'<div class="progress-bar" role="progressbar" style="width: 0%"></div>' +
						'</div>'
					).appendTo($li).find('.progress-bar');
				}
				$percent.css('width', percentage * 100 + '%');
			});

			// 文件上传完成功触发事件
			uploader.on('uploadSuccess', function(file, response) {
				
				// 七牛域名
				var path = "http://7xl3sp.com2.z0.glb.qiniucdn.com/";
				$('#' + file.id).find('input.qkey').val(response.key);
				$('#' + file.id).find('img.imageStarLogo').attr("src", path + response.key);
				// 上传成功后为删除按钮绑定事件
				$("#img_"+file.id).bind("click", function() {
					var Key = response.key;
					// ajax请求后台数据
					$.get('/admin/image/delete/'+Key,function(data){
						console.log('删除结果 = '+data);
						$('#' + file.id).remove();
					});
				});
			});

			// 文件上次完失败触发事件
			uploader.on('uploadError', function(file) {
				$('#' + file.id).find('p.state').text('上传出错');
			});

			// 文件上传完成触发事件
			uploader.on('uploadComplete', function(file) {
				$('#' + file.id).find('.progress').fadeOut();
			});
		},
		
		/** 上传多张图片 */
		uploadPic: function(token) {
			//上传图片
			var uploader = WebUploader.create({
				// 选完文件后，是否自动上传
				auto: true,
				// swf文件路径
				swf: '/webuploader-0.1.5/Uploader.swf',
				// 文件接收服务端。
				server: 'http://upload.qiniu.com/',
				// 选择文件的按钮。可选。
				// 内部根据当前运行是创建，可能是input元素，也可能是flash.
				pick: '#picker2',
				// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
				resize: false,
				// 只允许选择图片文件。
				accept: {
					title: 'Images',
					extensions: 'gif,jpg,jpeg,bmp,png',
					mimeTypes: 'image/*'
				},
				formData: {
					token: token
				},
				duplicate: true // 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key
			});

			// 当有文件被添加进队列的时候
			uploader.on('fileQueued', function(file) {
				$("#thelist2").append(
				  '<div id="pic_' + file.id + '" class="item">' +
					  '<h5 class="info">' + file.name + '</h5>' +
					  '<img src="http://7xl3sp.com2.z0.glb.qiniucdn.com/doudou.png" class="imageStarLogo" >' +
					  '<input type="hidden" class="qkey" name="starBG" value="">' +
					  '<a href="#"  id="img2_'+ file.id +'" class="delpic"> 删  除 </a>' +
				  '</div>'
				);
			});

			// 文件上传过程中创建进度条实时显示。
			uploader.on('uploadProgress', function(file, percentage) {
				var $li = $('#pic_' + file.id),
					$percent = $li.find('.progress .progress-bar');
				// 避免重复创建
				if (!$percent.length) {
					$percent = $(
						'<div class="progress progress-striped active">' +
						'<div class="progress-bar" role="progressbar" style="width: 0%"></div>' +
						'</div>'
					).appendTo($li).find('.progress-bar');
				}
				$percent.css('width', percentage * 100 + '%');
			});

			// 文件上传完成功触发事件
			uploader.on('uploadSuccess', function(file, response) {
				// 七牛域名
				var path = "http://7xl3sp.com2.z0.glb.qiniucdn.com/";
				$('#pic_' + file.id).find('input.qkey').val(response.key);
				$('#pic_' + file.id).find('img.imageStarLogo').attr("src", path + response.key);
				// 上传成功后为删除按钮绑定事件
				$("#img2_"+file.id).bind("click", function() {
					var Key = response.key;
					// ajax请求后台数据
					$.get('/admin/image/delete/'+Key,function(data){
						console.log('[2]删除结果 = '+data);
						$('#pic_' + file.id).remove();
					});
				});
			});

			// 文件上次完失败触发事件
			uploader.on('uploadError', function(file) {
				$('#pic_' + file.id).find('p.state').text('上传出错');
			});

			// 文件上传完成触发事件
			uploader.on('uploadComplete', function(file) {
				$('#pic_' + file.id).find('.progress').fadeOut();
			});
		},
		/** 上传语音文件 */
		uploadVoice: function(token) {
			//上传图片
			var uploader = WebUploader.create({
				auto: true,
				swf: '/webuploader-0.1.5/Uploader.swf',
				server: 'http://upload.qiniu.com/',
				pick: '#voicePicker',
				resize: false,
				accept: {
					title: 'Voice',
					extensions: 'mp3',
					mimeTypes: 'audio/*'
				},
				formData: {
					token: token
				},
				duplicate: true // 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key
			});
			// 文件上传前设置文件名
			//uploader.on('uploadBeforeSend', function(object, data, header){
			//	data.key = "123.mp3"
			//});
			// 当有文件被添加进队列的时候
			uploader.on('fileQueued', function(file) {
				$("#voiceList").append(
				  '<div id="pic_' + file.id + '" class="voice-item">' +
					  '<h5 class="info">' + file.name + '</h5>' +
					  '<audio src="" class="" id="audio" controls="controls"/>' +
					  '<input type="hidden" class="qkey" name="starBG" value="">' +
					  '<a href="#"  id="img2_'+ file.id +'" class="btn btn-danger"> 删  除 </a>' +
				  '</div>'
				);
			});
			// 文件上传过程中创建进度条实时显示。
			uploader.on('uploadProgress', function(file, percentage) {
				var $li = $('#pic_' + file.id),
					$percent = $li.find('.progress .progress-bar');
				// 避免重复创建
				if (!$percent.length) {
					$percent = $(
						'<div class="progress progress-striped active">' +
						'<div class="progress-bar" role="progressbar" style="width: 0"></div>' +
						'</div>'
					).appendTo($li).find('.progress-bar');
				}
				$percent.css('width', percentage * 100 + '%');
			});
			// 文件上传完成功触发事件
			uploader.on('uploadSuccess', function(file, response) {
				console.log("key:"+response.key);
				// 七牛域名
				var path = "http://7xl3sp.com2.z0.glb.qiniucdn.com/";
				$('#pic_' + file.id).find('input.qkey').val(response.key);
				$('#pic_' + file.id).find('audio').attr("src", path + response.key);
				// 上传成功后为删除按钮绑定事件
				$("#img2_"+file.id).bind("click", function() {
					var Key = response.key;
					// ajax请求后台数据
					$.get('/admin/image/delete/'+Key,function(data){
						console.log('[2]删除结果 = '+data);
						$('#pic_' + file.id).remove();
					});
				});
			});
			// 文件上次完失败触发事件
			uploader.on('uploadError', function(file) {
				$('#pic_' + file.id).find('p.state').text('上传出错');
			});
			// 文件上传完成触发事件
			uploader.on('uploadComplete', function(file) {
				$('#pic_' + file.id).find('.progress').fadeOut();
			});
		},
		//删除logo图片
		delLogo: function(imgKey) {
			$(".delpic").on("click", function () {
				$("#pic1").remove();
			});
		},
		//日期选择控件
		chooseDate: function(){
			var ids = "";
			for(var i = 0; i < arguments.length; i++){
				if(arguments.length > 1){
					ids += ",#"+arguments[i];
				} else {
					ids = "#"+arguments[i];
				}
			}
			$(ids).datepicker({
				numberOfMonths:1, 		//显示几个月
				showButtonPanel:true,	//是否显示按钮面板
				closeText: '关闭',
				clearText: '清除',  		//清除日期的按钮名称
				prevText: '<上月',
				nextText: '下月>',
				currentText: '今天',
				monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
				monthNamesShort: ['一','二','三','四','五','六','七','八','九','十','十一','十二'],
				dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
				dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
				dayNamesMin: ['日','一','二','三','四','五','六'],
				weekHeader: '周',
				dateFormat: 'yy-mm-dd hh:mm:SS',    //日期格式
				firstDay: 1,
				isRTL: false,
				showMonthAfterYear: true,  //是否把月放在年的后面
				yearSuffix: '年'        //年的后缀
			});
		}
	}
});