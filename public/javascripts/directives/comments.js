'use strict';
(function() {
    var handouApp = angular.module('handouApp');
    handouApp.directive('comments', [function() {
        return {
            restrict: 'AE',
            templateUrl: '/javascripts/templates/comments.html',
            replace: true,
            transclude: true,
            controller: function($scope) {
                //回复评论(当前登录用户，当前评论，被回复用户)
                $scope.reply = function(){
                    $scope.newsComment.commentId = this.comment.comment_id;
                    $scope.newsComment.replyUserId = this.comment.user_id;
                    $scope.newsComment.replyNickName = this.comment.user.user_info.nick_name;
                    $scope.newsComment.commentContent = "回复："+this.comment.user.user_info.nick_name;
                }
            },
            link: function(scope, element, attr) {

            }
        };
    }]);
    //咖派评论
    handouApp.directive('kpcomments', [function() {
        return {
            restrict: 'AE',
            templateUrl: '/javascripts/templates/kpcomments.html',
            replace: true,
            transclude: true,
            controller: function($scope) {
                //回复评论(当前登录用户，当前评论，被回复用户)
                $scope.reply = function(){
                    $scope.newsComment.commentId = this.comment.comment_id;
                    $scope.newsComment.replyUserId = this.comment.user_id;
                    $scope.newsComment.replyNickName = this.comment.user.nickName;
                    $scope.newsComment.commentContent = "回复："+this.comment.user.nickName;
                }
            },
            link: function(scope, element, attr) {

            }
        };
    }]);
    handouApp.directive('commentsInput', [function() {
        return {
            restrict: 'AE',
            template: '<div id="comment-input" contenteditable="true" '+
                      'ng-click="clear();" '+
                      'ng-bind="newsComment.commentContent"></div>',
            replace: true,
            transclude: true,
            controller: function($scope) {
                //点击清除回复框的内容
                $scope.clear = function(){
                    $scope.newsComment.commentContent="";
                }
            },
            link: function(scope, element, attr) {

            }
        };
    }]);
})();
