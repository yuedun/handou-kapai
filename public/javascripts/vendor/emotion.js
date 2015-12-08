//显示表情面板
function showEmot(){
	$("#emo").html('<img src="/images/jianpan.png" onclick="hiddenEmo();"/>');//笑脸切换成键盘
	var div1 = "<div class='chooseemo'>";
	var ul1 = "<ul class='swiper-wrapper'><li class='swiper-slide'>";
	for (var i=0;i<140;i++) {
		ul1+="<i title='表情"+i+"' name='emo"+i+"' onclick='addEmo(this)' />";
		if((i+1)%20==0) {
			ul1 += "<i class='delete' title='删除表情' onclick='deleteEmo();' /></li><li class='swiper-slide'>";
		}
	}
	ul1+="</ul></div>";
	$("#user-comment").append(div1+ul1);
	$("#comment-input").attr("contenteditable", false);
	$("#comment-content").css("padding-bottom",(window.screen.height/2)+30);//
	$("#comment-content").css("padding-bottom",(window.screen.height/2)+30);
	var mySwiper = new Swiper ('.chooseemo', {
		direction: 'horizontal',
		loop: false
	});
	$(".chooseemo ul li").css("height",document.body.clientWidth*0.445);
	var liheigth = $(".swiper-slide").height();
	$(".chooseemo ul li i").css("height",liheigth*0.333);

}
//隐藏表情面板
function hiddenEmo(){
	$(".chooseemo").remove();
	$("#emo").html('<img src="/images/xiaolian_n.png" onclick="showEmot();"/>');
	$("#comment-input").attr("contenteditable", true);
	$("#comment-content").css("padding-bottom",60);//
	$("#comment-content").css("padding-bottom",60);
}
//添加表情到输入框
function addEmo(obj){
	var c = $("#comment-input");
	if(c.html().indexOf("我想要说：")>0){
		c.empty();
	}
	var emourl = getEmoUrl($(obj).attr("name"));
	$("#comment-input").append("<img src='"+emourl+"'/>");
	$("br").remove();
}
//删除表情
function deleteEmo(){
	var emo = $("#comment-input img:last").remove();
}
//表情地址映射关系
function getEmoUrl(name){
	var kv = [
		{emo0:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e100.png"},
		{emo1:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e101.png"},
		{emo2:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e102.gif"},
		{emo3:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e103.gif"},
		{emo4:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e104.gif"},
		{emo5:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e105.gif"},
		{emo6:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e106.gif"},
		{emo7:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e107.gif"},
		{emo8:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e108.gif"},
		{emo9:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e109.gif"},
		{emo10:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e110.gif"},
		{emo11:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e111.gif"},
		{emo12:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e112.gif"},
		{emo13:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e113.gif"},
		{emo14:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e114.gif"},
		{emo15:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e115.gif"},
		{emo16:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e116.gif"},
		{emo17:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e117.gif"},
		{emo18:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e118.gif"},
		{emo19:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e119.gif"},
		{emo20:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e120.gif"},
		{emo21:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e121.gif"},
		{emo22:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e122.gif"},
		{emo23:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e123.gif"},
		{emo24:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e124.gif"},
		{emo25:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e125.gif"},
		{emo26:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e126.gif"},
		{emo27:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e127.gif"},
		{emo28:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e128.gif"},
		{emo29:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e129.gif"},
		{emo30:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e130.gif"},
		{emo31:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e131.gif"},
		{emo32:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e132.gif"},
		{emo33:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e133.gif"},
		{emo34:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e134.gif"},
		{emo35:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e135.gif"},
		{emo36:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e136.gif"},
		{emo37:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e137.gif"},
		{emo38:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e138.gif"},
		{emo39:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e139.gif"},
		{emo40:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e140.gif"},
		{emo41:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e141.gif"},
		{emo42:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e142.gif"},
		{emo43:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e143.gif"},
		{emo44:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e144.gif"},
		{emo45:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e145.gif"},
		{emo46:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e146.gif"},
		{emo47:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e147.gif"},
		{emo48:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e148.gif"},
		{emo49:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e149.gif"},
		{emo50:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e150.gif"},
		{emo51:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e151.gif"},
		{emo52:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e152.gif"},
		{emo53:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e153.gif"},
		{emo54:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e154.gif"},
		{emo55:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e155.gif"},
		{emo56:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e156.gif"},
		{emo57:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e157.gif"},
		{emo58:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e158.gif"},
		{emo59:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e159.gif"},
		{emo60:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e160.gif"},
		{emo61:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e161.gif"},
		{emo62:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e162.gif"},
		{emo63:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e163.gif"},
		{emo64:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e164.gif"},
		{emo65:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e165.gif"},
		{emo66:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e166.gif"},
		{emo67:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e167.gif"},
		{emo68:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e168.gif"},
		{emo69:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e169.gif"},
		{emo70:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e170.gif"},
		{emo71:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e171.gif"},
		{emo72:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e172.gif"},
		{emo73:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e173.gif"},
		{emo74:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e174.gif"},
		{emo75:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e175.gif"},
		{emo76:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e176.gif"},
		{emo77:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e177.gif"},
		{emo78:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e178.gif"},
		{emo79:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e179.gif"},
		{emo80:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e180.gif"},
		{emo81:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e181.gif"},
		{emo82:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e182.gif"},
		{emo83:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e183.gif"},
		{emo84:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e184.gif"},
		{emo85:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e185.gif"},
		{emo86:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e186.gif"},
		{emo87:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e187.gif"},
		{emo88:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e188.gif"},
		{emo89:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e189.gif"},
		{emo90:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e190.gif"},
		{emo91:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e191.gif"},
		{emo92:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e192.gif"},
		{emo93:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e193.gif"},
		{emo94:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e194.gif"},
		{emo95:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e195.gif"},
		{emo96:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e196.gif"},
		{emo97:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e197.gif"},
		{emo98:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e198.gif"},
		{emo99:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e199.gif"},
		{emo100:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e200.gif"},
		{emo101:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e201.gif"},
		{emo102:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e202.gif"},
		{emo103:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e203.gif"},
		{emo104:"http://ctc.qzonestyle.gtimg.cn/qzone/em/e204.gif"}
	];
	var url = "";
	kv.forEach(function(item,index){
		if(name=="emo"+index){
			url = item["emo"+index];
		}
	});
	return url;
}
