Zepto(function($){
    var userId = $("#userId").val();
    var friendId = $("#friendId").val();
    var queryVote;
    //发起用户，第一次发起需要填写昵称，第二次不需要
    queryUserInfo({userId:userId}, function(err,result1){
        //发起用户是否点亮过
        queryVote = {userId:userId, friendId:friendId===""?userId:friendId};
        queryLightRecord(queryVote, function(err, result2){
            //首先判断是自己发起还是朋友点开
            if(friendId === ""){
                //发起用户，第一次发起需要填写昵称，第二次不需要
                if(result1.length > 0){
                    var allLight =false;
                    var noLight = true;
                    var context = $(".content_text_bottom");
                    for(var i=0;i<7;i++){
                        allLight = (result1[0].get("word"+i)>0);
                        if(result1[0].get("word"+i)>0){
                            allLight = true;
                            $(context[i]).html("已点亮");
                        }else{
                            noLight = false;
                        }
                    }
                    allLight = noLight;
                    if(allLight){
                        alert("恭喜您全部点亮！");
                        window.location.href = "/weixin/exchange/"+userId;
                    }else{
                        $(".my_remark").html(result1[0].get("nick_name")+"的专辑券");
                        if(result2.get("can_vote")){
                            $("#btn_id").removeClass("cbtn3");
                            $("#btn_id").removeAttr("disabled");
                        }else{
                            $("#btn_id").html("明天还可以继续点亮哦!");
                        }
                    }
                }else{
                    $(".content_form").css("display", "block");
                    $("#btn_id").addClass("cbtn3");
                    $("#btn_id").attr("disabled","disabled");
                }
            }else{
                allLight =false;
                noLight = true;
                context = $(".content_text_bottom");
                for(i=0;i<7;i++){
                    allLight = (result1[0].get("word"+i)>0);
                    if(result1[0].get("word"+i)>0){
                        allLight = true;
                        $(context[i]).html("已点亮");
                    }else{
                        noLight = false;
                    }
                }
                allLight = noLight;
                if(allLight){
                    alert("已全部点亮，感谢您的参与和帮助！");
                }else{
                    $(".my_remark").html(result1[0].get("nick_name")+"的专辑券");
                    if(!result2.get("can_vote")){
                        $("#btn_id").html("明天还可以继续点亮哦!");
                    }else{
                        $("#btn_id").removeClass("cbtn3");
                        $("#btn_id").removeAttr("disabled");
                    }
                }
            }
        });
    });
});
/**
 * 点亮按钮触发事件
 */
function onLight(userId, friendId){
    var fid = friendId;
    queryUserInfo({userId:userId}, function(err, userResults){
        var num  = lightAWord(userResults[0].get("dispatchWord"));
        var l = $(".content_text");
        // 循环所有的圆圈
        l.each(function (index, item) {
            if(num == index){
                var lightRecord = {
                    user_id:userId,
                    friend_id:friendId?friendId:userId,
                    light_date:new Date(),
                    light_count:1,
                    can_vote:false
                };
                //先查询是否点过，点过则修改，未点过增加
                var queryVote = {userId:userId, friendId:friendId?friendId:userId};
                queryLightRecord(queryVote, function(err, result){
                    if(result.get("can_vote")&& result.sameDay){
                        addLightRecord(lightRecord, function(err, result2){
                            console.log("添加成功");//userResults.id
                            updateUserInfo({objectId:userResults[0].id,wordNum:num}, function(err, userInfo){
                                $(item).find(".content_text_bottom").html("点亮"+userInfo.get("word"+num)+"次");//设置点亮字的颜色为白色
                                var allLight =false;
                                for(var i=0;i<7;i++){
                                    allLight = (userInfo.get("word"+i)>0);
                                    if(userInfo.get("word"+i)>0){
                                        allLight = true;
                                    }else{
                                        allLight = false;
                                        return;
                                    }
                                }
                                if(allLight){
                                    alert("恭喜您全部点亮！");
                                    if(!fid){
                                        window.location.href = "/weixin/exchange/"+userId;
                                    }
                                }
                            });
                        });
                    }else{
                        updateLightRecord(result, function(err, result3){
                            console.log("修改成功");
                            updateUserInfo({objectId:userResults[0].id,wordNum:num}, function(err, userInfo){
                                $(item).find(".content_text_bottom").html("点亮"+userInfo.get("word"+num)+"次");//设置点亮字的颜色为白色
                                var allLight =false;
                                for(var i=0;i<7;i++){
                                    allLight = (userInfo.get("word"+i)>0);
                                    if(userInfo.get("word"+i)>0){
                                        allLight = true;
                                    }else{
                                        allLight = false;
                                        return;
                                    }
                                }
                                if(allLight){
                                    alert("恭喜您全部点亮！");
                                    if(!fid){
                                        window.location.href = "/weixin/exchange/"+userId;
                                    }
                                }
                            });
                        });
                    }
                });
                $(item).find(".content_text_top").css("background-image","url('/images/weixin/liang.png')");	// 添加背景图片
                $(item).find(".content_text_top").css("background-size","cover");	// 添加背景图片
                $(item).find(".content_text_top").css("color","#FFF");//设置点亮字的颜色为白色
                $(item).find(".content_text_top").css("text-shadow","1px 1px 1px #777777"); // 设备字体阴影
                $("#btn_id").html("明天还可以继续点亮哦!");// 设置按钮文字
                $("#btn_id").addClass("cbtn3");
                $("#btn_id").attr("disabled","disabled");//禁用按钮
                if(null == friendId){
                    $("#img_id").css("display",'block');// 显示帮助提示
                    friendId = userId;//朋友的openid为空的时则打开页面的是自己
                }
                $(item).find(".content_text_bottom").css("visibility","visible");
                // 点亮之后到后台记录该用户信息
            }
        });
    });
}
/**
* 保存用户昵称
* 保存成功后隐藏输入框
*/
function onSaveName(){
  	var nickName = $("#nickName").val();
  	if(!nickName){
  		$("#showText").html('请输入用户名');
  		return;
  	}
  	var userId = $("#userId").val();
    var dispatchWord = dispatchWordProportion();
  	var obj = {
  		nick_name:nickName,
  		user_id:userId,
        dispatchWord: dispatchWord,
        word0: 0,
        word1: 0,
        word2: 0,
        word3: 0,
        word4: 0,
        word5: 0,
        word6: 0
  	};
  	saveUserInfo(obj, function(err, result){
        $(".content_form").css("display", "none");
        $(".my_remark").html(result.get("nick_name")+"的专辑券");
        $("#btn_id").removeClass("cbtn3");
        $("#btn_id").removeAttr("disabled");
    });
}
