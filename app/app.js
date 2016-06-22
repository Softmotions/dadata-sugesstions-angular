'use strict';

angular.module('myApp', ['dadataSuggestions'])
    .controller('myAppController', function ($scope) {
        $scope.city = "Новосибирск";
        $scope.street = "Пирогова";
        $scope.house = "11";
    })
    .run(['dadataConfig', function(dadataConfig) {
        dadataConfig.token = '<API-KEY>';
    }]);
