
require.config({
    paths : {
        jquery : ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min", '../jquery-2.1.4.min'], //配置第三方库，不能加.js后缀
        // jquery : '../jquery-2.1.4.min',	//配置第三方库，不能加.js后缀
        bootstrap: ["http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min", "./bootstrap.min"],
        // bootstrap: "./bootstrap.min",
        lazyload: ["http://apps.bdimg.com/libs/jquery-lazyload/1.9.5/jquery.lazyload"]
    },
    shim: {
        "bootstrap" : {
            deps : ["jquery"],//非AMD模块依赖jquery
            exports :'bs'  
        },
        "lazyload": {
            deps: ["jquery"]
        }
    }
});
require(["jquery", "bootstrap", "lazyload"], function($, bs){
    $(function(){
        var more = function(){
            //点击单图时展开多图
            $(".sigleimg").on("click", function(){
                $(this).parent().css("display", "none");
                $(this).parent().next().css("display", "inline-block");
                document.documentElement.scrollTop += 1;//展开时只有滚动发生时lazy load才会加载
            });
        }
        var sigle = function(){
            //点击多图时收起并显示单图
            $(".moreimg>li").on("click", "a:first", function(){
                $(".moreimg").css("display", "none");
                $(".sigleimgdiv").css("display", "block");
                $(this).parent().parent().prev().children(".sigleimg").focus();
            });
        }
        var showOringinal = function(){
            //查看原图
            $(".moreimg>li").on("click", "a:eq(1)", function(){
                var url = $(this).prev().children().attr("src");
                if (url.indexOf('?') > -1) {
                    url = url.substring(0, url.indexOf('?'));
                }
                window.open(url);
            });
        }
        var lazyloadimg = function() {
            //图片懒加载
            $(".topic-pics img").lazyload({
                effect : "fadeIn" 
            });
        }
        more();
        sigle();
        showOringinal();
        lazyloadimg();
        //滚动到底部自动加载
        var pageIndex = 2;
        (function loadmore(){
            $(window).bind("scroll", function(){
                if($(this).scrollTop() + $(window).height() + 100 >= $(document).height() && $(this).scrollTop() >= 100) {
                    $(window).unbind("scroll");
                    $.get("/portal/getTopic?pageIndex=" + pageIndex + "&pageSize=20", function(data){
                        $("#container").append(data);
                        pageIndex++;
                        more();
                        sigle();
                        showOringinal();
                        loadmore();
                        lazyloadimg();
                    }, "html");
                };
            });
        })();
    });
});








