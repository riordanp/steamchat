var Steam = require('steam');
var _ = require('underscore');
var FS = require('fs');
var gui = require('nw.gui');
var friends  = [];
var me;
var sentryHash = null;
var client = new Steam.SteamClient();
var mySteamID;

var steamchatApp = angular.module('steamchatApp', [
  'ngRoute',
  'steamchatControllers'
]);

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
        friends[steamID].messages.push(message);
        console.log("Message from " + friends[steamID].playerName + ": " + friends[steamID].messages[0]);
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
        friends[data.friendid].messages = [];
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
