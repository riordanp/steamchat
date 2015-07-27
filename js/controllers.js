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
        $scope.onlineFriends = _.reject($scope.friends, function(f){ return f.personaState == 0; });
        $scope.me = me;
        $scope.getAvatarURL = function(hash) {
          return getAvatarURL(hash)
        }
        $scope.stateColor = function(state) {
            if(state == 1) {
                return 'green'; //online
            } else if(state == 2){
                return 'red'; //busy
            } else if(state == 3){
                return 'orange'; //away
            } else if(state == 4){
                return 'pink'; //snooze
            } else if(state == 5){
                return 'green'; //looking to trade
            } else if(state == 6){
                return 'green'; //looking to play
            }else {
                return 'grey'; //offline or unknown state
            }
        }
        $scope.stateActivityIndicator = function(state) {
          if(state == 0) {
            return 'none'; //no activity this session
          } else if(state == 1) {
            return 'rgb(209, 227, 231)'; //some activity this session
          } else if(state == 2) {
            return '#F0F8FF'; //notification state
          }

        }
        $scope.setActiveChat = function(steamID) {
            var chatScope = angular.element($('#chat')).scope();
            chatScope.setActiveChat(steamID);
        }
        $scope.refreshFriends = function() {
            //update friend message states
            for (var i in friends) {
                if (!friends.hasOwnProperty(i)) {
                    continue;
                }

                var friend = friends[i];

                if(messages[friend.friendid].length > 0){
                    friend.messageState = 1;
                }
                else
                {
                    friend.messageState = 0;
                }
            }

            $scope.friends = _.values(friends);
            $scope.onlineFriends = _.where($scope.friends, function(f){ return f.personaState > 0; });
            $scope.me = me;

            $scope.$apply();
        }
  }]);

steamchatControllers.controller('DashController', ['$scope',
  function($scope) {
        friendsScope = angular.element($('#friends')).scope();
        chatScope = angular.element($('#chat')).scope();
  }]);

steamchatControllers.controller('ChatController', ['$scope',
  function($scope) {
        $scope.partnerID = -1;
        $scope.setActiveChat = function(steamID) {
            console.log("Now chatting with " + friends[steamID].playerName);
            $scope.messages = messages[steamID];
            $scope.partnerID = steamID;
            $scope.partnerAvatarHash = friends[steamID].avatarHash;
            $scope.partnerName = friends[steamID].playerName;
        }
        $scope.refreshChat = function() {
          console.log('Refreshing Chat');
          $scope.messages = messages[$scope.partnerID];
          $scope.$apply();
        }
        $scope.sendMessage = function() {
            var message = $('#messageBox').val();
            $('#messageBox').val("");
            messages[$scope.partnerID].push({senderID: mySteamID, senderName: me.playerName, body: message});
            sendFriendMessage($scope.partnerID, message);
            var objDiv = document.getElementById("messageList");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
  }]);
