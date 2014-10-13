function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d; // kilometers
}

function MapOverlay(map){
  //Main object, intialise the map, retrive from 500px
  this.map = map;
  this.infoWindows = [];

  this.get500pxImages = function(latitude, longitude, radius) {
    //Build query to 500px API
    var root_url = "https://api.500px.com/v1";
    var consumer_key = "LmytzAEy3Gxymxw9R1kSURBbJw71FUu2QFLZKyfo";
    var query = root_url + "/photos/search"
    var parameters = {
      'consumer_key': consumer_key,
      'geo': ""+latitude+","+longitude+","+radius+"km",
      'sort': 'highest_rating',//'favorites_count',
      'rpp': 10,
    }
    query += "?" + $.param(parameters);

    var theMap = this.map;
    var theInfoWindows = this.infoWindows;

    //Run the query and retrieve results
    $.getJSON(query, function(result){
      //First remove & close old ones
      $.each( theInfoWindows, function(index, infoW){
        theInfoWindows.pop().close();
      });
      $.each( result.photos, function( index, photo ){
        var contentString = '<a href="https://500px.com'+photo.url+'" target="_blank">'+
                            '<img src="'+photo.image_url+'"/>'+
                            '</a>';
        theInfoWindows[theInfoWindows.length] = new google.maps.InfoWindow({
          content: contentString,
          position: new google.maps.LatLng(photo.latitude, photo.longitude)
        });
        theInfoWindows[theInfoWindows.length-1].open(theMap);
      });
      console.log(theInfoWindows);
    }); //getJSON
  }; // get500pxImages

  this.getImagesFromMap = function(){
    //Get map features: location and radius
    var position = this.map.getCenter()
    var northEast = this.map.getBounds().getNorthEast();
    var radius = measure(position.lat(), position.lng(), northEast.lat(), northEast.lng());
    //Get pictures from 500px
    this.get500pxImages(position.lat(), position.lng(), radius/2);
  }; //getImagesFromMap

  this.initialise = function(position){
    //Init the map
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude)
    };

    this.map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var overlay = this;
    //Callback when the map is moved
    google.maps.event.addListener(this.map, 'dragend', function() {
      overlay.getImagesFromMap();
    });

    //Listener when the map zoom is changed
    google.maps.event.addListener(this.map, 'zoom_changed', function() {
      overlay.getImagesFromMap();
    });

    this.get500pxImages(latitude, longitude, 2);
  };// initialise
}

function initialize(position) {
  var overlayed = new MapOverlay();
  overlayed.initialise(position);

  $('#home-content').remove();
  var map_canvas = $("#map-canvas");
  map_canvas.height(''+screen.height+'px');
  map_canvas.width(''+screen.width+'px');
  map_canvas.fadeIn();
}

function getLocation(func) {
  //Entry point called from the HTML
  $('#around-me-btn').hide();
  $("#content-canvas").hide();
  $('#spinner').show();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(func);
  } else {
    $("#map-canvas").text("Geolocation is not supported by this browser.");
  }
}

$(document).ready(function(){
  $('#spinner').hide();
  $("#content-canvas").hide();
});
