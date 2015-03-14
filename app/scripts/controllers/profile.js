'use strict';

/**
 * @ngdoc function
 * @name hfosFrontendApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the hfosFrontendApp
 */
angular.module('hfosFrontendApp')
  .controller('ProfileCtrl', function ($scope, $location, user) {
    console.log('ProfileCtrl loaded!');

      var profile = user.profile();
      $scope.schema = profile.schema;
      $scope.model = profile.data;

      $scope.$on('profileupdate', function(event) {
          var profile = user.profile();
          $scope.schema = profile.schema;
          $scope.model = profile.data;
          console.log('Profile updated: ', profile);
      })

      $scope.submitForm = function (model) {
        console.log('Profile update initiated.');
        user.updateprofile(model);
      }

      $scope.form = [
        {
            type: 'section',
            htmlClass: 'row',
            items: [
                {
                    type: 'section',
                    htmlClass: 'col-xs-4',
                    items: [
                        'name', 'd-o-b', 'callsign'
                    ]
                },
                {
                    type: 'section',
                    htmlClass: 'col-xs-4',
                    items: [
                        'familyname', 'nick', 'color'
                    ]
                },
                {
                    type: 'section',
                    htmlClass: 'col-xs-4',
                    items: [
                        'phone', 'shift', 'visa'
                    ]
                }
            ]
        },
        'notes',
        {
          type: "submit",
          title: "Save",
        }
      ];
  });
