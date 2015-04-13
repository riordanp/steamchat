function getAvatarURL(hash) {
    var tag = hash.substr(0, 2);
    var url = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/" + tag + "/" + hash + "_full.jpg";
    return url;
}




client.on('friend', function(steamID, relationship) {
    console.log("friend: " +steamID +", "+ relationship);
});




