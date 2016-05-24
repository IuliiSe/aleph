
aleph.controller('EntitiesBulkCtrl', ['$scope', '$route', '$location', '$http', '$timeout', '$q', 'Collection', 'Entity', 'Authz', 'Metadata', 'Title',
    function($scope, $route, $location, $http, $timeout, $q, Collection, Entity, Authz, Metadata, Title) {
  
  $scope.collection = {};
  $scope.entities = [{}, {}, {}, {}];
  $scope.created = [];
  $scope.availableSchemata = ['/entity/person.json#', '/entity/company.json#',
                              '/entity/organization.json#', '/entity/entity.json#'];
  Title.set("Bulk create entities", "entities");

  Metadata.get().then(function(metadata) {
    $scope.schemata = metadata.schemata;
  });

  Collection.getWriteable().then(function(collections) {
    $scope.collections = collections;
    $scope.hasCollections = collections.length > 0;
  });

  $scope.editEntity = function($event, entity) {
    $event.stopPropagation();
    Entity.edit(entity.id);
  };

  $scope.isStub = function(entity) {
    if (!entity.name || !entity.name.length) {
      if (!entity.summary || !entity.summary.length) {
        return true;
      }
    }
    return false;
  };

  $scope.isInvalid = function(entity) {
    if ($scope.isStub(entity)) {
      return false;
    }
    if (entity.$invalid) {
      return true;
    }
    if (entity.name && entity.name.trim().length > 2) {
      if ($scope.availableSchemata.indexOf(entity.$schema) != -1) {
        return false;
      }
    }
    return true;
  };

  $scope.canSave = function() {
    if (!$scope.collection.id) {
      return false;
    }
    var count = 0;
    for (var i in $scope.entities) {
      var ent = $scope.entities[i];
      if ($scope.isInvalid(ent)) {
        return false;
      }
      count++;
    }
    return count > 0;
  };

  $scope.update = function(entity) {
    entity.$invalid = false;
    var stubs = 0, lastEntity = null;
    for (var i in $scope.entities) {
      var ent = $scope.entities[i];
      if ($scope.isStub(ent)) {
        stubs++;
        if (lastEntity) {
          ent.$schema = lastEntity.$schema;
          ent.jurisdiction_code = lastEntity.jurisdiction_code;
        }
      } else {
        lastEntity = angular.copy(ent);
      }
    }

    if (stubs < 2) {
      $scope.entities.push({});
    }
  };

  var saveNextEntity = function() {
    for (var i in $scope.entities) {
      var entity = angular.copy($scope.entities[i]);
      if (!$scope.isStub(entity) && !$scope.isInvalid(entity)) {
        entity.collections = [$scope.collection.id];
        $http.post('/api/1/entities', entity).then(function(res) {
          $scope.entities.splice(i, 1);
          $scope.created.push(res.data);
          saveNextEntity();
        }, function(err) {
          $scope.entities[i].$invalid = true;
          saveNextEntity();
        });
        return;
      }
    }
    $scope.reportLoading(false);
  };

  $scope.save = function() {
    $scope.reportLoading(true);
    saveNextEntity();
  };

}]);