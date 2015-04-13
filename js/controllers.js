var steamchatControllers = angular.module('steamchatControllers', []);

steamchatControllers.controller('LoginController', ['$scope',
  function ($scope) {    
    $scope.login = function(accountName, accountPassword) {
        if(FS.existsSync('sentry.hash')) {
            sentryHash = FS.readFileSync('sentry.hash');
            console.log("Got sentry hash from file.");
        }
        console.log("Attempting logon with " + accountName + " and " + accountPassword);
        client.logOn({accountName: accountName, password: accountPassword, shaSentryfile: sentryHash});
    };
    
    $scope.loginAuth = function(accountName, accountPassword, authCode) {
        console.log("Attempting auth logon with " + accountName + " and " + accountPassword + " and " + authCode);
        client.logOn({accountName: accountName, password: accountPassword, authCode: authCode});
    };
  }]);

steamchatControllers.controller('FriendsController', ['$scope',
  function($scope) {
        $scope.friends = _.values(friends);
        $scope.me = me;
  }]);

steamchatControllers.controller('ChatController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
        // messages will be stored in array for each user in runtime and saved in json format when closed (or periodically).
        // this function will simply load the messages associated with a user
        $scope.friendID = $routeParams.friendID;
console.log("scope friends length: " + friends);
console.log("reading message from " + friends[$scope.friendID].playerName);
        $scope.messages = friends[$scope.friendID].messages;
  }]);
