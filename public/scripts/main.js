function initMap() {
  // The location of Uluru
  var uluru = {lat: 24.9542, lng: 67.0584};
  // The map, centered at Uluru
  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 15, center: uluru});
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({position: uluru, map: map});
}

