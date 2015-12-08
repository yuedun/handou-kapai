'use strict';

(function() {
    var handouApp = angular.module('handouApp');

    var NewsFactory = function($http) {

        var url = '/lofti/api/news/filter',
            factory = {};

        factory.getNews = function(offset, limit) {
            $http.get(url + '/' + offset + '/' + limit).then(
                function(results) {
                    return results.data;
                });
        };

        return factory;
    };

    NewsFactory.$inject = ['$http'];

    handouApp.factory('newsFactory', NewsFactory);
})();
