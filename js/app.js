var Steam = require('steam');
var _ = require('underscore');
var FS = require('fs');
var gui = require('nw.gui');
var friends  = [];
var messages = []
var me;
var sentryHash = null;
var client = new Steam.SteamClient();
var mySteamID;

var steamchatApp = angular.module('steamchatApp', [
  'ngRoute',
  'steamchatControllers'
]);

function sendFriendMessage(steamID, message) {
    client.sendMessage(steamID, message);
}

client.on('error', function(error) {
    if(error.eresult == Steam.EResult.AccountLogonDenied) {
        $('#steamguardmodal').modal('show');
    }
    else
    {
        console.error("Steam Error: " + error.eresult);
    }
});

client.on('loggedOn', function(){
    mySteamID = client.steamID;
    console.log("Logged in, my SteamID is ", mySteamID);
    client.requestFriendData(mySteamID);
    client.setPersonaState(Steam.EPersonaState.Online);
    setTimeout(function () { window.location.hash = "./dash"; }, 1000);
});

client.on('sentry', function(hash) {
    console.log("Recieved sentry hash, writing to file");
    FS.writeFile('sentry.hash', hash);
});

client.on('friendMsg', function(steamID, message, type) {
    if (type == Steam.EChatEntryType.ChatMsg) { // Regular chat message
        messages[steamID].push({senderID: steamID, senderName: friends[steamID].playerName, body: message});
        console.log("Message from " + messages[steamID][0].senderName + ": " + messages[steamID][0].body);
        var scope = angular.element($('#chat')).scope();
        scope.setActiveChat(steamID);
    }
});

//persona states
// 1 = online
// 2 = busy
// 3 = away
// 5 = looking to trade
// 6 = looking to play

client.on('user', function(data) {
    var scope = angular.element($('#friends')).scope();
    if(data.friendid == mySteamID) {
        me = data;
        me.avatarHash = me.avatarHash.toString('hex');
        scope.friends = _.values(friends);
        scope.$apply();   
    } else {
        friends[data.friendid] = data;
        friends[data.friendid].avatarHash = friends[data.friendid].avatarHash.toString('hex');
        messages[data.friendid] = [];
        scope.friends = _.values(friends);
        scope.$apply();
    } 
    console.log("user");      
});

client.on('relationships', function() {
    console.log("relationships");
    var ids = [];
    _.each(client.friends, function(relationship, steamID) {
        ids.push(steamID);
    });
    client.requestFriendData(ids);
});

steamchatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: './views/login.html',
        controller: 'LoginController'
      }).
      when('/dash', {
        templateUrl: './views/dash.html',
        controller: 'DashController'
      }).
      when('/friends', {
        templateUrl: './views/friends.html',
        controller: 'FriendsController'
      }).
      when('/chat', {
        templateUrl: './views/chat.html',
        controller: 'ChatController'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);
