/* ****************************************************************************
	Author: Sudhir Durvasula
	Date: 2015-10-01
	file: initMap.js
	
	--- DESCRIPTION ---
	
	This file contains the applicaiton logic to:
		initialize the map object so that google can draw its map with it.
		  the function is passed as a value to the "callback" parameter of the API url.
   ****************************************************************************
*/

/*
   --- DESCRIPTION ---
   The initMap() function initializes the map object with a default address.
   The actual initialization is done by making a call to the setOriginMarker()
   function and passing in an address as a string.
   
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   this function doesn't return anything
*/
function initMap() {

  setOriginMarker("510 Victoria, Venice, CA");
}

/*
   --- DESCRIPTION ---
   The setOriginMarker() function initializes the address passed in as a parameter.
   We make use of the google API to initialize the map to the given address, set the zoom
   of the map to a reasonable level, and center the map on the address.
   
   The address string is the origin from which all the distances are computed.
   
   --- PARAMETERS ---
   address: string
   
   --- RETURNS ---
   this function doesn't return anything
*/
function setOriginMarker(address) {
  //console.log("received address: " + address);
  var geo = new google.maps.Geocoder();

  //geocode the address to get the lat/longitude of the address 
  geo.geocode({
    'address': address
  }, function(results, status) {
	  // check strict equality of the status code and make sure results has data in it before we process it.
    if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

	  //initialize the map to the given location, center it, and zoom it to a reasonable level
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: results[0].geometry.location
      });
      
      LFL.map = map;
      
	  //create a marker to represent the origin location
      var marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: LFL.map,
		animation: google.maps.Animation.DROP,
        title: address
      });
      
	  // store the attributes in a global origin object defined in index.html
      setOrigin(results[0].formatted_address, results[0].geometry.location.H, results[0].geometry.location.L);
	  
	  // compute the distances to the destinations from this origin.
      computeDistancesFromOrigin();
	  
	  //add the destination address markers to the map.
      addMarkersToMap();
    } else {
	  //geocode failed, so alert the user of this.	
      alert("Geocode was not successful for the following reason: " + status);
    }

  });

}

/*
   --- DESCRIPTION ---
   The setOrigin() function sotres the location informatin in an origin object which is
   created in a global scope in index.html. We store the formatted address, latitude, and
   longitude. The lat and longitude are enough to create a marker and compute distances but the 
   formatted address is used to create a tool tip on the marker to show the address of the place.
   
   The address string is the origin from which all the distances are computed.
   
   --- PARAMETERS ---
   formatted_address: string
   lat: float
   lng: float
   
   --- RETURNS ---
   this function doesn't return anything
*/
function setOrigin(formatted_address, lat, lng) {

  // empty out the origin object to get rid of any previously stored vlaues.	
  LFL.origin = {};
  LFL.origin.formatted_address = formatted_address;
  LFL.origin.latitude = lat;
  LFL.origin.longitude = lng;
}
