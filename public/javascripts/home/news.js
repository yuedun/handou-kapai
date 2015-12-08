$(function() {
    var mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: true,
        autoplay: 3000,
        autoplayDisableOnInteraction: false,
        height: 300,
        speed: 1000,
        grabCursor: true,
        keyboardControl: true,
        mousewheelControl: true
    });
    //waterfall
    var c = $("#container").find(".news-list-group-item").length;//数据量小于10条不再加载，显示无数据
    if(c < 20){
        $("#container").append('<p style="color:#000; text-align: center">没有数据了！<a href="javascript:window.history.back()">返回</a></p><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>');
    }else {
        var cateId = $("#categoryId").val();
        var url = "";
        if(cateId){
            url = "/category/"+cateId;
        }
        $('#container').waterfall({
            itemCls: 'news-list-group-item',
            prefix: '',
            fitWidth: true,
            colWidth: 240,
            gutterWidth: 10,
            gutterHeight: 0,
            align: 'left',
            minCol: 1,
            maxCol: 1,
            maxPage: 10,
            bufferPixel: 50,
            containerStyle: {},
            resizable: false,
            isFadeIn: true,
            isAnimated: true,
            animationOptions: {},
            isAutoPrefill: false,
            checkImagesLoaded: true,
            path: function (page) {
                return "/portal/news"+url+"?offset=" + page + "&limit=20";
            },
            dataType: 'html',
            params: {},
            loadingMsg: '<div id="loading-img" style="text-align:center;padding:10px 0; color:#999;display: none"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>',
            state: {
                isDuringAjax: false,
                isProcessingData: false,
                isResizing: false,
                curPage: 2
            },
            // callbacks
            callbacks: {
                /*
                 * loadingStart
                 * @param {Object} loading $('#waterfall-loading')
                 */
                loadingStart: function ($loading) {
                    $("#loading-img").show();
                    $loading.show();
                    //console.log('loading', 'start');
                },
                /*
                 * loadingFinished
                 * @param {Object} loading $('#waterfall-loading')
                 * @param {Boolean} isBeyondMaxPage
                 */
                loadingFinished: function ($loading, isBeyondMaxPage) {
                    if (!isBeyondMaxPage) {
                        $loading.fadeOut();
                        //console.log('loading finished');
                    } else {
                        //console.log('loading isBeyondMaxPage');
                        $loading.remove();
                    }
                },
                /*
                 * loadingError
                 * @param {String} xhr , "end" "error"
                 */
                loadingError: function ($message, xhr) {
                    $message.html('数据加载失败，请稍后重试！');
                },

                /*
                 * renderData
                 * @param {String} data
                 * @param {String} dataType , "json", "jsonp", "html"
                 */
                renderData: function (data, dataType) {
                    var tpl,
                        template;
                    if (dataType === 'json' || dataType === 'jsonp') { // json or jsonp format
                        tpl = $('#waterfall-tpl').html();
                        template = Handlebars.compile(tpl);

                        return template(data);
                    } else { // html format
                        if ( data === "") {
                            $('#container').waterfall('pause', function() {
                                $('#container').append('<p style="color:#666;">no more data...</p>');
                            });
                        }
                        return data;
                    }
                }
            },
            debug: false
        });
    }
});
