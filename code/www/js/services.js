angular.module('songhop.services', [])  /*global angular*/
.factory('User', function() {
  
  // array for our favorite songs
  var o = {
    favorites: [],
    new_favorites: 0 
  };
  
  o.addSongToFavorites = function(song) {
    // make sure there's a song to add
    if (!song) return false;

    // add to favorites array
    o.favorites.unshift(song);
    o.new_favorites++;
  };
  
  o.removeSongFromFavorites = function(song, index) {
    if (!song) return false;
    o.favorites.splice(index, 1);
  };

  o.favoritesCount = function() {
    return o.new_favorites;
  }

  return o;
})


.factory('Recommendations', function($http, SERVER, $q) {
  var media;
  var o = {queue: []};
  
  o.init = function() {
    if (o.queue.length == 0) {
      // if there's nothing in the queue, fill it.
      // this also means that this is the first call of init
      return o.getNextSongs();
    }
    
    else {
      // otherwise, play the current song
      return o.playCurrentSong();
    }
  };
  
  o.getNextSongs = function() {
    return $http({
      method: 'GET',
      url: SERVER.url + '/recommendations',
    }).success(function (response) {
      // add recomendations to queue
      o.queue = o.queue.concat(response);
    });
  };
  
  o.nextSong = function() {
    // pop first song
    o.queue.shift();
    
    // end the song
    o.haltAudio();
    
    // low on queue? Let's fill it
    if (o.queue.length <= 3) {
      o.getNextSongs();
    }
  };
  
  o.playCurrentSong = function() {
    var defer = $q.defer();
    media = new Audio(o.queue[0].preview_url);
    
    media.addEventListener("loadeddata", function() {
      defer.resolve();
    });
    
    media.play();
    return defer.promise;
  };
  
  o.haltAudio = function() {
    if (media) media.pause();
  };
  
  return o;
});