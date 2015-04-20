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
        $scope.stateColor = function(state) {
            if(state == 1) {
                return 'green'; //online
            } else if(state == 2){
                return 'red'; //busy
            } else if(state == 3){
                return 'orange'; //away
            } else if(state == 4){
                return 'pink'; //idk
            } else if(state == 5){
                return 'green'; //looking to trade
            } else if(state == 6){
                return 'green'; //looking to play
            }else {
                return 'grey'; //offline or unknown state
            }
        }
  }]);

steamchatControllers.controller('DashController', ['$scope',
  function($scope) {
        
  }]);

steamchatControllers.controller('ChatController', ['$scope',
  function($scope) {
        $scope.partnerID = -1;
        $scope.setActiveChat = function(steamID) {
            $scope.messages = friends[steamID].messages;
            $scope.partnerID = steamID;
            $scope.partnerAvatarHash = friends[steamID].avatarHash;
            $scope.partnerName = friends[steamID].playerName;
            $scope.$apply();
        };
        $scope.sendMessage = function() {

        }
  }]);