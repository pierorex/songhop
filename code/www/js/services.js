angular.module('songhop.services', [])  /*global angular*/
.factory('User', function() {
  
  // array for our favorite songs
  var o = {favorites: []};
  
  o.addSongToFavorites = function(song) {
    // make sure there's a song to add
    if (!song) return false;

    // add to favorites array
    o.favorites.unshift(song);
  };
  
  o.removeSongFromFavorites = function(song, index) {
    if (!song) return false;
    o.favorites.splice(index, 1);
  };

  return o;
})

.factory('Recommendations', function($http, SERVER) {
  var o = {queue: []};
  
  o.getNextSongs = function() {
    return $http({
      method: 'GET',
      url: SERVER.url + '/recommendations',
    }).success(function (response) {
      // add recomendations to queue
      o.queue = o.queue.concat(response);
    });
  };
  
  o.getNextSong = function() {
    // pop first song
    o.queue.shift();
    
    // low on queue? Let's fill it
    if (o.queue.length <= 3) {
      o.getNextSongs();
    }
  };
  
  return o;
});