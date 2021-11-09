(function (angular) {
    "use strict";

    var module = angular.module('ng.evaluationMethod.homolog', ['ngSanitize']);

    module.config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $httpProvider.defaults.headers.patch['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $httpProvider.defaults.transformRequest = function (data) {
                var result = angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;

                return result;
            };
        }]);

    module.factory('HomologEvaluationMethodService', ['$http', '$rootScope', function ($http, $rootScope) {
            return {
                serviceProperty: null,
                getEvaluationMethodConfigurationUrl: function () {
                    return MapasCulturais.createUrl('evaluationMethodConfiguration', 'single', [MapasCulturais.evaluationConfiguration.id]);
                },
                patchEvaluationMethodConfiguration: function (entity) {
                    entity = JSON.parse(angular.toJson(entity));
                    return $http.patch(this.getEvaluationMethodConfigurationUrl(), entity);
                }
            };
        }]);

    module.controller('HomologEvaluationMethodConfigurationController', ['$scope', '$rootScope', '$timeout', 'HomologEvaluationMethodService', 'EditBox', function ($scope, $rootScope, $timeout, HomologEvaluationMethodService, EditBox) {
            $scope.editbox = EditBox;

            var labels = MapasCulturais.gettext.homologEvaluationMethod;
            
            $scope.data = {
                criteria: MapasCulturais.evaluationConfiguration.criteria || [],
                items: MapasCulturais.evaluationConfiguration.items || [],

                debounce: 2000
            };

            function criterionExists(name) {
                var exists = false;
                $scope.data.criteria.forEach(function (s) {
                    if (s.name == name) {
                        exists = true;
                    }
                });

                return exists;
            }

            $scope.save = function(){
                var data = {
                    criteria: $scope.data.criteria,
                    items: [],
                };

                $scope.data.items.forEach(function (item) {
                    for (var i in data.criteria) {
                        var criterion = data.criteria[i];
                        if (item.cid == criterion.id) {
                            data.items.push(item);
                        }
                    }
                });
                console.log('aaa');

                $timeout.cancel($scope.saveTimeout); 

                $scope.saveTimeout = $timeout(function() {
                    HomologEvaluationMethodService.patchEvaluationMethodConfiguration(data).success(function () {
                        MapasCulturais.Messages.success(labels.changesSaved);
                        $scope.data.criteria = data.criteria;
                        $scope.data.items = data.items;
                    });
                }, $scope.data.debounce);
            };

            $scope.addCriterion = function(){
                var date = new Date;
                var new_id = 'c-' + date.getTime();
                $scope.data.criteria.push({id: new_id, name: ''});

                $timeout(function(){
                    jQuery('#' + new_id + ' header input').focus();
                },1);
            };

            $scope.deleteCriterion = function(criterion){
                if(!confirm(labels.deleteCriterionConfirmation)){
                    return;
                }
                var index = $scope.data.criteria.indexOf(criterion);

                $scope.data.items = $scope.data.items.filter(function(item){
                    if(item.cid != criterion.id){
                        return item;
                    }
                });

                $scope.data.criteria.splice(index,1);

                $scope.save();
            }

            $scope.addItem = function(criterion){
                var date = new Date;
                var new_id = 'i-' + date.getTime();
                $scope.data.items.push({id: new_id, cid: criterion.id, title: null});
                $scope.save();

                $timeout(function(){
                    jQuery('#' + new_id + ' .item-title input').focus();
                },1);
            }

            $scope.deleteItem = function(item){
                if(!confirm(labels.deleteItemConfirmation)){
                    return;
                }
                var index = $scope.data.items.indexOf(item);

                $scope.data.items.splice(index,1);

                $scope.save();
            }
        }]);

    module.controller('HomologEvaluationMethodFormController', ['$scope', '$rootScope', '$timeout', 'HomologEvaluationMethodService', function ($scope, $rootScope, $timeout, HomologEvaluationMethodService) {
            var labels = MapasCulturais.gettext.homologEvaluationMethod;
            if(MapasCulturais.evaluation){
                for(var id in MapasCulturais.evaluation.evaluationData){
                    if(id != 'obs'){
                        MapasCulturais.evaluation.evaluationData[id] = MapasCulturais.evaluation.evaluationData[id];
                    }
                }
            }
            
            $scope.data = {
                criteria: MapasCulturais.evaluationConfiguration.criteria || [],
                items: MapasCulturais.evaluationConfiguration.items || [],
                empty: true
            };
  
            if(MapasCulturais.evaluation){
                $scope.evaluation =  MapasCulturais.evaluation.evaluationData;
                $scope.data.empty = false;
            } else {
                $scope.evaluation =  {};
            }

            $timeout(function(){
                if(MapasCulturais.evaluation){
                    for(var id in MapasCulturais.evaluation.evaluationData){
                        if(id != 'obs'){
                            MapasCulturais.evaluation.evaluationData[id] = MapasCulturais.evaluation.evaluationData[id];
                                $("#"+id).val(MapasCulturais.evaluation.evaluationData[id]);
                        }
                    }
                }
            },1);

            $scope.getStatusEvaluation = () => {
                return MapasCulturais.evaluation.resultString;
            };

            $scope.getStatusCriterionLabel = (status) => {
                if (status == "notevaluate") {
                    return "Não avaliado";
                } else if (status == "invalid") {
                    return "Inválido";
                } else if (status == "valid") {
                    return "Válido";
                }
                return '';
            };
        }]);
})(angular);