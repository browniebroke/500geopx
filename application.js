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

function get500pxImages(latitude, longitude, radius) {
  //Build query to 500px API
  var root_url = "https://api.500px.com/v1";
  var consumer_key = "LmytzAEy3Gxymxw9R1kSURBbJw71FUu2QFLZKyfo";
  var query = root_url + "/photos/search"
  var parameters = {
    'consumer_key': consumer_key,
    'geo': ""+latitude+","+longitude+","+radius+"km",
    'sort': 'favorites_count',
    'rrp': 10,
  }
  query += "?" + $.param(parameters);

  //Run the query and retrieve results
  $.getJSON(query, function(result){
    var imgCanvas = $("#images-canvas");
    var ulist = imgCanvas.find("ul");
    ulist.empty();
    imgCanvas.hide();
    $.each( result.photos, function( index, photo ){
      var photoLi = $('<li></li>');
      var photoLink = $('<a href="https://500px.com'+photo.url+'" target="_blank"></a>');
      photoLink.append($('<img src="'+photo.image_url+'"/>'));
      photoLi.append(photoLink);
      ulist.append(photoLi);
    });
    imgCanvas.fadeIn();
  });
}

function getLocation(func) {
  $('#around-me-btn').hide();
  $("#content-canvas").hide();
  $('#spinner').show();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(func);
  } else {
    $("#map-canvas").text("Geolocation is not supported by this browser.");
  }
}

function initialize(position) {
  //Init the map
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(latitude, longitude)
  };

  $("#map-canvas").height('400px');
  $("#map-canvas").width('600px');

  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var marker = new google.maps.Marker({
    position: map.getCenter(),
    map: map,
    title: 'Your location'
  });

  google.maps.event.addListener(map, 'dragend', function() {
    //Get map features: location and radius
    var position = map.getCenter()
    var northEast = map.getBounds().getNorthEast();
    var radius = measure(position.lat(), position.lng(), northEast.lat(), northEast.lng());
    //Get pictures from 500px
    get500pxImages(position.lat(), position.lng(), radius);
  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    //Get map features: location and radius
    var position = map.getCenter()
    var northEast = map.getBounds().getNorthEast();
    var radius = measure(position.lat(), position.lng(), northEast.lat(), northEast.lng());
    //Get pictures from 500px
    get500pxImages(position.lat(), position.lng(), radius/2);
  });

  $('#spinner').hide();
  $("#content-canvas").fadeIn();

  get500pxImages(latitude, longitude, 2);
}

$(document).ready(function(){
  $('#spinner').hide();
  $("#content-canvas").hide();
});
