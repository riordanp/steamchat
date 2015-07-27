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
var friendsScope;
var chatScope;
var steamchatApp = angular.module('steamchatApp', [
  'ngRoute',
  'steamchatControllers'
]);

function sendFriendMessage(steamID, message) {
    client.sendMessage(steamID, message);
}

function getAvatarURL(hash) {
  if(hash) {
    var tag = hash.substr(0, 2);
    var url = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/" + tag + "/" + hash + "_full.jpg";
    if(hash == "0000000000000000000000000000000000000000"){
      return "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
    } else {
      return url;
    }
  }
}

function setMyPersona(stateID) {
  if(stateID == 1) {
      client.setPersonaState(Steam.EPersonaState.Online);
  } else if(stateID == 2){
      client.setPersonaState(Steam.EPersonaState.Busy);
  } else if(stateID == 3){
      client.setPersonaState(Steam.EPersonaState.Away);
  } else if(stateID == 4){
      client.setPersonaState(Steam.EPersonaState.Snooze);
  } else {
    console.log("Error, invalid persona state");
  }
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
    setTimeout(function () { window.location.hash = "./dash"; }, 0);
    //window.location.hash = "./dash";
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
        if(scope.partnerID != -1) {
          scope.setActiveChat(steamID);
        }
        scope.refreshChat();
        var objDiv = document.getElementById("messageList");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
});

//persona states (steam)
// 1 = online
// 2 = busy
// 3 = away
// 4 = snooze
// 5 = looking to trade
// 6 = looking to play

//message states (internal)
// 0 = no message this session
// 1 = some messages this session (aka open chat)
// 2 = unread messages


client.on('user', function(data) {
var friendsScope = angular.element($('#friends')).scope();
    if(data.friendid == mySteamID) {
        me = data;
        me.avatarHash = me.avatarHash.toString('hex');
        friendsScope.refreshFriends();
    } else {
      if(data.friendid in friends) {
        friends[data.friendid] = data;
        friends[data.friendid].avatarHash = friends[data.friendid].avatarHash.toString('hex');
      } else {
        friends[data.friendid] = data;
        friends[data.friendid].avatarHash = friends[data.friendid].avatarHash.toString('hex');
        messages[data.friendid] = [];
      }

        friendsScope.refreshFriends();
    }
});

client.on('relationships', function() {
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
