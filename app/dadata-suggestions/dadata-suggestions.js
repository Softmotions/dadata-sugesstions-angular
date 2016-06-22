/*!
 * dadata-suggestions-angular
 * https://github.com/Softmotions/dadata-suggestions-angular
 * Version: 0.0.1 - 2016-06-22T11:12:44.000Z
 * License: MIT
 */

/**
 *  Директива для проверки данных через сервис DaData.ru. Подсказки включаются при первой попытке изменить содержимое
 *  полей (иначе можно запортить значения, а пользователь их не заметит).
 *  Требует dadataConfig.token = "<API-KEY>"
 *  Usage: <form dadata dadata-type="address" [dadata-trigger-select-on-blur="true"]
 *          [dadata-trigger-select-on-enter="true"] [dadata-trigger-select-on-space="false"]>
 *             <input id="region" ng-model="region" dadata-input dadata-bounds="region">
 *             <input id="city" ng-model="city" dadata-input dadata-bounds="city" dadata-constraint-input-id="region" dadata-fixdata="true">
 *         </form>
 *
 *  type - тип подсказок, см. https://confluence.hflabs.ru/display/SGTDOC165/API
 *  trigger-select-on-[blur|enter|space] - автовыбор первой подсказки по событию.
 *      в примере указаны значения по-умолчанию.
 *  bounds - гранулярные подсказки http://codepen.io/dadata/pen/cGkah?editors=101
 *      ограничение на аттрибут для поиска, например city - поиск только городов.
 *      можно указать диапазон city-settlement - поиск по городу и населенному пункту.
 *      если указано только одно значение, то в поле ввода попадает только этот аттрибут,
 *      в противном случае - сырое значение возвращенное сервисом
 *  constraint-input-id - id поля ввода, значение которого должно учитываться для поиска.
 *      например, для поля ввода город нужно указать поле ввода региона
 *  fixdata == true - для последнего поля в цепочке гранулярных подсказок.
 *      необходимо, если в момент подключения подсказок в форме уже есть данные.
 */
'use strict';

angular.module('dadataSuggestions', [])
    .value('dadataConfig', {
        token: false
    })
    .directive('dadata', function () {
        return {
            restrict: 'A',
            scope: {
                type: '@dadataType',
                triggerSelectOnBlur: '@dadataTriggerSelectOnBlur',
                triggerSelectOnEnter: '@dadataTriggerSelectOnEnter',
                triggerSelectOnSpace: '@dadataTriggerSelectOnSpace'
            },
            controller: ['$scope', function ($scope) {
                var inputs = $scope.inputs = {};
                this.addInput = function (name, input) {
                    inputs[name] = input;
                };
                this.inputs = $scope.inputs;
                this.type = $scope.type;
            }]
        };
    })
    .directive('dadataInput', ['dadataConfig', '$timeout', function (dadataConfig, $timeout) {
        return {
            restrict: 'A',
            require: '^^dadata',
            scope: {
                ngModel: '=',
                id: '@',
                bounds: '@dadataBounds',
                constraintInputId: '@dadataConstraintInputId',
                fixdata: '@dadataFixdata'
            },
            link: function (scope, iElement, iAttrs, parentCtrl) {
                // require defined token
                if (dadataConfig.token) {
                    parentCtrl.addInput(iAttrs['ngModel'], scope);
                    iElement.suggestions({
                        serviceUrl: "https://suggestions.dadata.ru/suggestions/api/4_1/rs",
                        token: dadataConfig.token,
                        type: parentCtrl.type.toUpperCase(),
                        triggerSelectOnBlur: parentCtrl.triggerSelectOnBlur || true,
                        triggerSelectOnEnter: parentCtrl.triggerSelectOnEnter || true,
                        triggerSelectOnSpace: parentCtrl.triggerSelectOnSpace || false,
                        bounds: scope.bounds || '',
                        constraints: (scope.constraintInputId) ? $('#' + scope.constraintInputId) : '',
                        formatSelected: function (suggestion) {
                            if (scope.bounds && (scope.bounds.search(/^\w+$/) != -1)) { // dadataBounds can contain range of attributes
                                return eval('suggestion.data.' + scope.bounds); // bounds contain only one attribute - return value of selected attribute
                            }
                            return suggestion.value;
                        }
                    });

                    $timeout(function () {
                        var isEmpty = true;
                        angular.forEach(parentCtrl.inputs, function (input) {
                            if (input.ngModel) {
                                isEmpty = false;
                            }
                        });
                        if (!isEmpty) { // form is not empty - disable suggestions util user try to modify values
                            angular.forEach(parentCtrl.inputs, function (input) {
                                $("#" + input.id).suggestions().disable();
                            });
                        }

                        var inputsLength = 0;
                        angular.forEach(parentCtrl.inputs, function () {
                            inputsLength++;
                        });
                        if (inputsLength == 1) {
                            parentCtrl.inputs[iAttrs['ngModel']].fixdata = true; // auto-enable fixData on non-granular suggestions
                        }
                    });

                    iElement.bind('suggestions-clear', function (event) { // update model after jquery
                        var ngModelToClear = event.target.attributes['ng-model'].value;
                        parentCtrl.inputs[ngModelToClear].ngModel = '';
                    });

                    iElement.bind('suggestions-select', function (event) { // update model after jquery
                        var ngModelToSelect = event.target.attributes['ng-model'].value;
                        parentCtrl.inputs[ngModelToSelect].ngModel = event.target.value;
                    });

                    iElement.bind('suggestions-set', function (event) { // update model after jquery
                        var ngModelToSet = event.target.attributes['ng-model'].value;
                        parentCtrl.inputs[ngModelToSet].ngModel = event.target.value;
                    });

                    iElement.bind('suggestions-fixdata', function () { // enable suggestions after fixData complete
                        angular.forEach(parentCtrl.inputs, function (input) { // refresh model on whole form after jquery
                            var inputSelector = $("#" + input.id);
                            inputSelector.suggestions().enable();
                            input.ngModel = inputSelector.val();
                        });
                    });

                    iElement.bind('keyup', function () { // user try to modify values - we can check values in DaData
                        angular.forEach(parentCtrl.inputs, function (input) {
                            if (input.fixdata) {
                                $('#' + input.id).suggestions().fixData(); // run fixData on first try
                                input.fixdata = false;
                            }
                        });
                    });
                }
            }
        };
    }]);
