dadataSuggestions
==============
AngularJS [DaData](https://dadata.ru/suggestions/) suggestions module

Features: 

* Load fields values from ngModel
* Save fields values to ngModel after edit
* Support granular suggestions
* Enables suggestions after the first edit

## How to run
JS:
```javascript
angular.module('app', ['dadataSuggestions'])
    .run(['dadataConfig', function(dadataConfig) {
        dadataConfig.token = '<API-KEY>';
}]);
```
HTML:
```html
<form dadata dadata-type="address">
     <label for="city" class="required">Город</label>
     <input id="city" class="form-control input-lg" ng-model="city" dadata-input dadata-bounds="city">
     <label for="street" class="required">Улица</label>
     <input id="street" class="form-control input-lg" ng-model="street" dadata-input dadata-bounds="street" dadata-constraint-input-id="city">
     <label for="house" class="required">Дом</label>
     <input id="house" class="form-control input-lg" ng-model="house" dadata-input dadata-bounds="house" dadata-constraint-input-id="street" dadata-fixdata="true">
</form>
```