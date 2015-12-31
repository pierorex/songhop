angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, 
                                     Recommendations) {
  // helper functions for loading
  var showLoading = function() {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  };
  
  var hideLoading = function() {
    $ionicLoading.hide();
  };
  
  // set loading to true first time while we retrieve songs from server.
  showLoading();
  
  // get our first songs
  Recommendations.init()
    .then(function() {
      $scope.currentSong = Recommendations.queue[0];
      return Recommendations.playCurrentSong();
    })
    .then(function() {
      // turn loading off
      hideLoading();
      $scope.currentSong.loaded = true;
    });

  // fired when we favorite / skip a song.
  $scope.sendFeedback = function(bool) {
    // first, add to favorites if they favorited
    if (bool) User.addSongToFavorites($scope.currentSong);
    
    // set variable for the correct animation sequence
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;
    
    // prepare the next song
    Recommendations.nextSong();
    
    $timeout(function() {
      // $timeout to allow animation to complete before changing to next song
      $scope.currentSong = Recommendations.queue[0];
      $scope.currentSong.loaded = false;
    }, 250);
    
    Recommendations.playCurrentSong()
    .then(function() {
      $scope.currentSong.loaded = true;
    });
  };
  
  // used for retrieving the next album image.
  // if there isn't an album image available next, return empty string.
  $scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }
    
    return '';
  };
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window, 
                                      $ionicActionSheet) {
  // get the list of our favorites from the user service
  $scope.favorites = User.favorites;
  $scope.username = User.username;
  
  $scope.removeSong = function(song, index) {
    User.removeSongFromFavorites(song, index);
  };
  
  $scope.openSong = function(song) {
    $window.open(song.open_url, '_system');
  };
  
  $scope.showActionSheet = function(song_url) {
    var hide_sheet = $ionicActionSheet.show({
      buttons: [
        { text: '<i class="ion-social-twitter"></i> <b>Twitter</b>'},
        { text: '<i class="ion-social-facebook"></i><b>acebook</b>'},
        { text: '<i class="ion-social-googleplus"></i> <b>Google Plus</b>'}
      ],
      titleText: 'Come on ' + User.username + ', share this song!',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        var urls = [
          'https://twitter.com/intent/tweet?url=', // twitter
          'https://www.facebook.com/sharer/sharer.php?u=', // facebook
          'https://plus.google.com/share?url=' // google plus
        ];
        
        // open the sharing site with this site's url
        protocol = $window.location.protocol;
        host = $window.location.host;
        $window.open(urls[index] + protocol + '//' + host, '_system');
        
        return true;
      }
    });
  };
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations, User, $window) {
  // stop audio when going to favorites page
  $scope.enteringFavorites = function() {
    Recommendations.haltAudio();
    User.new_favorites = 0;
  };
  
  $scope.leavingFavorites = function() {
    Recommendations.init();
  };
  
  $scope.logout = function() {
    User.destroySession();
    
    // instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached.
    $window.location.href = 'index.html';
  };
  
  // expose the number of new favorites to the scope
  $scope.favoritesCount = User.favoritesCount;
})


/*
Controller for the splash state
*/
.controller('SplashCtrl', function($scope, $state, User) {
  // attempt to signup/login via User.auth
  $scope.submitForm = function(username, signup) {
    User.auth(username, signup).then(function() {
      // session is now set, so lets redirect to discover page
      $state.go('tab.discover');
    }, function() {
      // error handling here
      alert("Something went wrong. Try using another name ;)");
    });
  };
});