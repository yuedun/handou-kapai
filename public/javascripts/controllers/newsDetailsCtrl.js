'use strict';
/**
 * 资讯详情页
 *
 * @return {[type]} [description]
 */
(function() {

    var handouApp = angular.module('handouApp', ['ngRoute']);

    var NewsDetailsCtrl = function($scope, $http, $location, $sce) {
        $scope.downloadUrl = 'http://handou.qiniudn.com/';
        $scope.defaul_user_head = 'icon_nv.png?imageView2/2/h/200';
        $scope.dianzan = {
            "background-image": "url(/images/like_huise.png)"
        }; //此登陆用户是否点赞评论——默认无点赞
        var path = $location.absUrl();
        var newsId = path.substring(path.lastIndexOf('/') + 1);
        var userId = $("#userId").val();//当前登录用户
        if (newsId !== '') {
            //获取评论列表
            $http.get('/lofti/api/comments/' + newsId).success(function(data, status, headers, config) {
                data.forEach(function(item, index) {
                    item.comment_content = $sce.trustAsHtml(item.comment_content); //显示html内容
                    item.login_user_id = userId;
                });
                $scope.comments = data;
            });
        }

        $scope.disabled = "disabled";
        $scope.newsComment={
            commentId:null,
            commentContent:"我想要说：",
            replyUserId:null,
            replyNickName:null
        };
        //添加评论
        $scope.addComment = function(userId, newsId, comUserId, comType) {
            $scope.newsComment.commentContent = angular.element(document.querySelector("#comment-input")).html();
            if ($scope.newsComment.commentContent == "" || $scope.newsComment.commentContent == "我想要说：") {
                //输入内容为空时不操作
            } else {
                var params = {
                    user_id: userId,
                    news_id: newsId,
                    comment_type: comType,
                    comment_content: $scope.newsComment.commentContent,
                    reply_comment_id: $scope.newsComment.commentId,
                    reply_user_id: $scope.newsComment.replyUserId,
                    reply_nick_name:$scope.newsComment.replyNickName
                };
                $http.post('/lofti/api/comments/', params).success(function(data, status, headers, config) {
                    data.comment_content = $sce.trustAsHtml(data.comment_content);
                    $scope.comments.unshift(data); //数组最前面添加
                    //$scope.comments.push(data); //数组最后面添加
                    $scope.newsComment.commentId = null;
                    $scope.newsComment.commentContent = "我想要说：";
                    $scope.newsComment.replyUserId = null;
                    $scope.newsComment.replyNickName = null;
                    $("#comment-input").html("");
                });
            }
            hiddenEmo();//隐藏表情面板

        };

        //评论点赞(当前登录用户对某条评论的点赞)
        $scope.comLike = function(userId) {
            var params = {
                user_id: this.comment.login_user_id,
                news_comment_id: this.comment.comment_id,
                like_relation_id: this.comment.like_relation_id,
                state: $("#input" + this.comment.comment_id).val() == 1 ? 0 : 1
            };
            var isLike = $("#input" + this.comment.comment_id).val();
            var comId = this.comment.comment_id;
            $http.post('/lofti/api/comments/' + comId + '/isLike', params).success(function(data, status, headers, config) {
                if (isLike == 1) {
                    $("#" + comId).css("background-image", "url('/images/like_huise.png')");
                    $("#input" + comId).val(0);
                    $("#count" + comId).html(parseInt($("#count" + comId).html()) - 1);
                } else {
                    $("#" + comId).css("background-image", "url('/images/like_hong.png')");
                    $("#input" + comId).val(1);
                    $("#count" + comId).html(parseInt($("#count" + comId).html()) + 1);
                }
            });
        };
    };
    //以下为咖派
    var kpNewsCtrl = function($scope, $http, $location, $sce) {
        $scope.downloadUrl = 'http://handou.qiniudn.com/';
        $scope.defaul_user_head = 'icon_nv.png?imageView2/2/h/200';
        $scope.dianzan = {
            "background-image": "url(/images/like_huise.png)"
        }; //此登陆用户是否点赞评论——默认无点赞
        var path = $location.absUrl();
        var newsId = path.substring(path.lastIndexOf('/') + 1);
        var userId = $("#userId").val();//当前登录用户
        if (newsId !== '') {
            //获取评论列表
            $http.get('/lofti/api/kpcomments/' + newsId).success(function(data, status, headers, config) {
                data.forEach(function(item, index) {
                    item.comment_content = $sce.trustAsHtml(item.comment_content); //显示html内容
                    item.login_user_id = userId;
                });
                $scope.comments = data;
            });
        }

        $scope.disabled = "disabled";
        $scope.newsComment={
            commentId:null,
            commentContent:"我想要说：",
            replyUserId:null,
            replyNickName:null
        };
        //添加评论
        $scope.addComment = function(userId, newsId, comUserId) {
            $scope.newsComment.commentContent = angular.element(document.querySelector("#comment-input")).html();
            if ($scope.newsComment.commentContent == "" || $scope.newsComment.commentContent == "我想要说：") {
                //输入内容为空时不操作
            } else {
                var params = {
                    user_id: userId,
                    news_id: newsId,
                    comment_content: $scope.newsComment.commentContent,
                    reply_comment_id: $scope.newsComment.commentId,
                    reply_user_id: $scope.newsComment.replyUserId,
                    reply_nick_name:$scope.newsComment.replyNickName
                };
                $http.post('/lofti/api/kpcomments/', params).success(function(data, status, headers, config) {
                    data.comment_content = $sce.trustAsHtml(data.comment_content);
                    $scope.comments.unshift(data); //数组最前面添加
                    //$scope.comments.push(data); //数组最后面添加
                    $scope.newsComment.commentId = null;
                    $scope.newsComment.commentContent = "我想要说：";
                    $scope.newsComment.replyUserId = null;
                    $scope.newsComment.replyNickName = null;
                    $("#comment-input").html("");
                });
            }
            hiddenEmo();//隐藏表情面板
        };

        //评论点赞(当前登录用户对某条评论的点赞)
        $scope.comLike = function(userId) {
            var params = {
                user_id: this.comment.login_user_id,
                news_comment_id: this.comment.comment_id,
                like_relation_id: this.comment.like_relation_id,
                state: $("#input" + this.comment.comment_id).val() == 1 ? 0 : 1
            };
            var isLike = $("#input" + this.comment.comment_id).val();
            var comId = this.comment.comment_id;
            $http.post('/lofti/api/comments/' + comId + '/isLike', params).success(function(data, status, headers, config) {
                if (isLike == 1) {
                    $("#" + comId).css("background-image", "url('/images/like_huise.png')");
                    $("#input" + comId).val(0);
                    $("#count" + comId).html(parseInt($("#count" + comId).html()) - 1);
                } else {
                    $("#" + comId).css("background-image", "url('/images/like_hong.png')");
                    $("#input" + comId).val(1);
                    $("#count" + comId).html(parseInt($("#count" + comId).html()) + 1);
                }
            });
        };
    };

    NewsDetailsCtrl.$inject = ['$scope', '$http', '$location', '$sce'];
    kpNewsCtrl.$inject = ['$scope', '$http', '$location', '$sce'];

    handouApp.controller('NewsDetailsCtrl', NewsDetailsCtrl);
    handouApp.controller('kpNewsCtrl', kpNewsCtrl);

})();