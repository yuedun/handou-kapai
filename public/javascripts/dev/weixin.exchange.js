/**
 * Created by admin on 2015/7/13.
 */
/**
* 添加兑换码
*/
//function addExchange(openid){
//    var note = {
//        isExchange:false,
//        exchangeNum:"",
//        exchangeUser:""
//    };
//    for(var i=0;i<101;i++){
//        var str = randomWord(true, 6,10);
//        note.exchangeNum = str;
//        addExchangeNote(note);
//    }
//    alert("添加成功");
//}
/*
 ** randomWord 产生任意长度随机字母数字组合
 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 ** xuanfeng 2014-08-28
 */

//function randomWord(randomFlag, min, max){
//    var str = "",
//        range = min,
//        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
//
//    // 随机产生
//    if(randomFlag){
//        range = Math.round(Math.random() * (max-min)) + min;
//    }
//    for(var i=0; i<range; i++){
//        pos = Math.round(Math.random() * (arr.length-1));
//        str += arr[pos];
//    }
//    return str;
//}
Zepto(function($){
    //获取兑换码
    var openid = $("#openid").val();
    queryExchangeNumByOpenid(openid, function(err, result1){
        if(result1.length>0){
            $("#num").html(result1[0].get("exchangeNum"));
        }else{
            queryOneExchangeNote(openid, function(err, result2){
                $("#num").html(result2.get("exchangeNum"));
            });
        }
    });
});
