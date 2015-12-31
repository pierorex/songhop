angular.module('songhop.services', ['ionic.utils'])  /*global angular*/

.factory('User', function($http, SERVER, $q, $localStorage) {
  
  // array for our favorite songs
  var o = {
    username: false,
    session_id: false,
    favorites: [],
    new_favorites: 0
  };
  
  
  // attempt login or signup
  o.auth = function(username, signingUp) {
    var authRoute;
    
    if (signingUp) {
      authRoute = '/signup';
    }
    else {
      authRoute = '/login';
    }
    
    return $http.post(SERVER.url + authRoute, {username: username})
    .success(function(response) {
      o.setSession(response.username, response.session_id, response.favorites);
    });
  };
  
  
  o.addSongToFavorites = function(song) {
    // make sure there's a song to add
    if (!song) return false;

    // add to favorites array
    o.favorites.unshift(song);
    o.new_favorites++;
    
    // persist this to the server
    return $http.post(SERVER.url + '/favorites',
                      {session_id: o.session_id, song_id: song.song_id});
  };
  
  
  o.removeSongFromFavorites = function(song, index) {
    if (!song) return false;
    o.favorites.splice(index, 1);
    
    // persist this to the server
    return $http({
      method: 'DELETE',
      url: SERVER.url + '/favorites',
      params: {session_id: o.session_id, song_id: song.song_id}
    });
  };


  o.favoritesCount = function() {
    return o.new_favorites;
  };
  
  
  // gets the entire list of this user's favs from server
  o.populateFavorites = function() {
    return $http({
      method: 'GET',
      url: SERVER.url + '/favorites',
      params: {session_id: o.session_id}
    }).success(function(response) {
      // merge data into the queue
      o.favorites = response;
    });
  };


  // set session data
  o.setSession = function(username, session_id, favorites) {
    if (username) o.username = username;
    if (session_id) o.session_id = session_id;
    if (favorites) o.favorites = favorites;
    
    // set data in localstorage object
    $localStorage.setObject('user', 
                            {username: username, session_id: session_id});
  };
  
  
  // check if there's a user session present
  o.checkSession = function() {
    var defer = $q.defer();
    if (o.session_id) {
      // if this session is already initialized in the services
      defer.resolve(true);
    }
    else {
      // detect if there's a session in localstorage from previous use.
      // if it is, pull into our service
      var user = $localStorage.getObject('user');
      
      if (user.username) {
        // if there's a user, lets grab their favorites from the server
        o.setSession(user.username, user.session_id);
        o.populateFavorites().then(function() {
          defer.resolve(true);
        });
      }
      else {
        // no user info in localstorage, reject
        defer.resolve(false);
      }
    }
    
    return defer.promise;
  };
  
  
  // wipe out our session data
  o.destroySession = function() {
    $localStorage.setObject('user', {});
    o.username = false;
    o.session_id = false;
    o.favorites = [];
    o.new_favorites = 0;
  };


  // return the user object as the service object
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