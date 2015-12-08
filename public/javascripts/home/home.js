$(function() {
    //首页手机滚动
    var mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        width: 220,
        loop: true,
        autoplay: 2000,
        autoplayDisableOnInteraction: false,
        speed: 1000,
        grabCursor: true,
        keyboardControl: true,
        mousewheelControl: true
    });
    //动态背景切换
    // var currentIndex = 0;
    // setInterval(function(){
    //     //定义要切换的背景图片，双引号里面，可以放任意多个
    //     var bgImgs = ["5/72039342.jpg","5/20760706.jpg","6/45323100.jpg"];
    //     if (currentIndex >= bgImgs.length)
    //         currentIndex = 0;
    //     var obj = $(".mycontainer");
    //     obj.css("background-image", "url('http://img-storage.qiniudn.com/15-11-"+bgImgs[currentIndex]+"')");
    //     obj.css
    //     currentIndex += 1;
    // }, 5000);
});
