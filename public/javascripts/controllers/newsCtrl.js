'use strict';
/**
 * 获取资讯列表信息
 *
 * @return {[type]} [description]
 */
(function() {
    var handouApp = angular.module('handouApp', ['ngRoute']);
    var NewsCtrl = function($scope, $http) {
        $scope.downloadUrl = 'http://handou.qiniudn.com/';
        $scope.getNews = function() {
            var pageParams = window.pageParams;
            if (pageParams == null) {
                return;
            }
            var offset = pageParams ? pageParams.offset : 1;
            var limit = pageParams ? pageParams.limit : 10;
            var userId = pageParams ? pageParams.userId : '';
            var _categoryIds = pageParams.categoryIds;
            var url = '/lofti/api/news/filter';
            $http.post(url, {
                userId: userId,
                offset: offset,
                limit: limit,
                categoryIds: _categoryIds //['c62fddf314704dc5b487b64745e2275b', 'f6471d2af5f5481397a246ae551b0744']
            }).then(function(results) {
                $scope.newsList = results.data;
            });
        };
    };
    NewsCtrl.$inject = ['$scope', '$http'];
    handouApp.controller('NewsCtrl', NewsCtrl);
})();
