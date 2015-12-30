angular.module('songhop.services', [])
.factory('User', function() {

  // array for our favorite songs
  favorites = [];
  
  addSongToFavorites = function(song) {
    // make sure there's a song to add
    if (!song) return false;

    // add to favorites array
    favorites.unshift(song);
  };
  
  removeSongFromFavorites = function(song, index) {
    if (!song) return False;
    favorites.splice(index, 1);
  };

  return {
      favorites: favorites,
      addSongToFavorites: addSongToFavorites,
      removeSongFromFavorites: removeSongFromFavorites
  };
});