/* ****************************************************************************
	Author: Sudhir Durvasula
	Date: 2015-10-01
	file: script.js
	
	--- DESCRIPTION ---
	
	This file contains the application logic to:
		- compute distances to a set list of locations form an origin
		- update the UI in case list has some changes
		- adding markers for the origin and destination addresses on the map
		- ajax calls to get the geocoded locations of the destinations
			o success and failure handlers for the ajax calls.
   ****************************************************************************
*/

/* 
   --- DESCRIPTION ---
   
   The computeDistancesFromOrigin() function computes distances from an origin to a set list of destinations.
   In order to achieve this, we make use of the google maps APIs.
  
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   this function doesn't return anything.

*/
function computeDistancesFromOrigin() {

  var originCoordinates = new google.maps.LatLng(LFL.origin.latitude, LFL.origin.longitude);
  var distInMeters = 0, distInKm = 0, distInMiles =0;
  var destinationCoordinates = null;
  var loopLen = LFL.locations.length, i;
  for (i = 0; i < loopLen; i++) {

    destinationCoordinates = new google.maps.LatLng(LFL.locations[i].latitude, LFL.locations[i].longitude);
    distInMeters = google.maps.geometry.spherical.computeDistanceBetween(originCoordinates, destinationCoordinates);
    //convert distance from meters to kilometers by dividing by 1000 (1000m = 1km)
    distInKm = distInMeters / 1000;
    // convert kms to miles by dividing by 1.6 (1.6km = 1 mile)
    distInMiles = distInKm / 1.6;

    /*
      adding distances in meters and kilometers as well to the object so that
      at a later time if we would like to switch the sort to one of these we can.
      
      we are rounding the numbers after conversion to minimize rounding error that
      might result if we do it before conversions.
    */

    LFL.locations[i].distInMeters = Math.round(distInMeters);
    LFL.locations[i].distInKm = Math.round(distInKm);
    LFL.locations[i].distInMiles = Math.round(distInMiles);
  }

  /*
      now sort the array by distance from origin in Miles by ascending order.
      To have it sorted in descending order, flip the operands for the subtraction.
    */
  LFL.locations.sort(function(a, b) {
    return a.distInMiles - b.distInMiles;
  });
  //console.log (LFL.locations);

  // call updateUI to redraw the list since the origin most likely changed.
  updateUI();
}

/* 
   --- DESCRIPTION ---
   
   The updateUI() function is in charge of writing information to the table which displays
   the list of locations and their distances from origin.
   For now this will get called from 2 places:
     1. from the "setOriginMarker" method in initMap.js
     2. from the successHandler function in this file.
   
   If there are a lot of records, we could construct the entire html of the table
   here and render it, or better yet use a templating approach with jQuery or Angular.
   But since we are dealing with only 7 elements, i just hard-coded the elements in HTML and accessing them here.
   
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   This function doesn't return anything
*/

function updateUI() {

  var loopLen = LFL.locations.length, i;
  for (i = 0; i < loopLen; i++) {

    document.getElementById("location" + (i + 1)).innerHTML = LFL.locations[i].formatted_address;
    document.getElementById("distance" + (i + 1)).innerHTML = LFL.locations[i].distInMiles;
  }
}

/*
   --- DESCRIPTION ---
   
    This function takes all the locations in the locations array and adds a marker on the map for each location.
    It also draws a line form the origin to each of the destinations.
    For now this will get called from 2 places:
     1. from the "setOriginMarker" method in initMap.js
     2. from the successHandler function in this file.
	 
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   This function doesn't return anything.
*/
function addMarkersToMap() {

  //declare an array to hold the path coordinates which we will use to draw lines between the markers
  var originCoordinates = new google.maps.LatLng(LFL.origin.latitude, LFL.origin.longitude);
  var pathCoordinates = {};
  var loopLen = LFL.locations.length, i;
  for (i = 0; i < loopLen; i++) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(LFL.locations[i].latitude, LFL.locations[i].longitude),
      map: LFL.map,
	  animation: google.maps.Animation.DROP,
      title: LFL.locations[i].formatted_address
    });

    pathCoordinates = {
      lat: LFL.locations[i].latitude,
      lng: LFL.locations[i].longitude
    };
    
    //geodesic: true draws the lines to follow the curvature of the Earth. If set to false they will be straight lines.
    var drawnPath = new google.maps.Polyline({
      path: [originCoordinates, pathCoordinates],
      geodesic: true,
      strokeColor: '#AD0797',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: LFL.map
    });
  }

}

/*
   --- DESCRIPTION ---
   
   This function handles the success event after all the requests have come back.
   It adds objects which contain location information like:
    formatted_address: string
    latitude: float
    longitude: float
    
    we loop through the arguments and add these objects to the locations array.
    once added we call computeDistancesFromOrigin() to recalculate any distances,
    and also call addMarkersToMap() to add the new set of markers.
    It is called by jQuery provided ".then" function and from nowhere else.
	
   --- PARAMETERS ---
   none explicitly defined in the function signature, but jquery will pass an array of the arguments.
   The length of this arguments array will depend on how many times we do a $.ajax call on in the $.when function.
   Since we can't rely on a set number of arguments, it's better to loop through the arguments array and process each
   location.
   
   --- RETURNS ---
   this function doens't return anything.
*/
function successHandler() {

  var loopLen = arguments.length, i;
  
  // if there is no arguments list or something went wrong while fetching the arguments length then exit.
  if (typeof arguments === "undefined" || arguments === null || loopLen < 1 || isNaN(loopLen) )
  {
	  //stop execution and exit the function.  
	  return;
  }
  // instead of setting the location objects individually, it is easier to do it in a loop
  for (i = 0; i < loopLen; i++) {

    var addressObj = {};
	//if there is nothing at this index of the arguments array procced with next iteration.
    if (arguments[i].length < 1 || arguments[i][0].results.length < 1) {continue;}
	
    addressObj.formatted_address = arguments[i][0].results[0].formatted_address;
    addressObj.latitude = arguments[i][0].results[0].geometry.location.lat;
    addressObj.longitude = arguments[i][0].results[0].geometry.location.lng;

    // now push the object into the array we defined. push will place the element at the end of the array.
    LFL.locations.push(addressObj);
  }

  // call a function to compute distances from origin. no need to pass in locations since it is a global variable.
  computeDistancesFromOrigin();

  // add all destination markers to the map
  addMarkersToMap();
}

/*
   --- DESCRIPTION ---
   
   This function is used to alert the user that geocoding failed.
   Currently there is no helpful message as to why it failed but
   in the future we should add a reason so that the user is aware of what the issue is.
   
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   This function doesn't return anything.
*/
function logFailure() {

  alert("Geocoding failed");
  console.log("Geocoding failed");
}

/*
   --- DESCRIPTION ---
   
	The getGeoCodeRequestObjects() function will be in charge of fetching the geocode information for
	a list of addresses. We are are populating the list of addressed in LBL.destinations[] Array inside
	index.html file. In the future this can be set dynamically either by server or from a user entry field.

	We queue up the request objects into an array and return it to the $.when.apply method that is being called
	from $(window).load event below.

	These functions are passed to the $.when function that jQuery provides which only exits after all the requests
	have come back. See window.load event at the bottom of the file.
   
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   requestObjects: Array
   This function will return an array of response objects which is a result of the request made to the google
   geocode api. The returned values are passed to jQuery which in turn will pass them to successHandler function
*/

function getGeoCodeRequestObjects () {
	//console.log ("inside getGeoCodeRequestObjects");
	var requestObjects = [];
	var loopLen = LFL.destinations.length, i;
	var api_url = 'https://maps.googleapis.com/maps/api/geocode/json';
	
	for(i=0; i < loopLen; i++)
	{
		//console.log ("requesting for " + LFL.destinations[i]);
		requestObjects.push(
		  $.ajax({
		    url: api_url,
			data: {
				address: LFL.destinations[i]
			}
		  }).success(
		     function(data){return data;}
		  )
		);
	}
	
	return requestObjects;
}
/*
   --- DESCRIPTION ---
   
	if we don't call this on window.load we won't have the origin populated yet,
	which means that the distances calculations will return a NaN.

	The $.when functionality in jQuery makes sure all the requests have come back and then
	call either the success handler (1st argument of the "then" method), or the error handler.
   --- PARAMETERS ---
   none
   
   --- RETURNS ---
   This fucntion doesn't return anything.
*/

$(window).load(
  function() {
	/* 
	  The ".apply"" method allows us to pass in an array of arguments which will have a series of
	  request objects to request geocode data for addresses.
	  Once the requests have come back successfully jQuery will then call succssHandler to continue
	  processing of the data.
	*/
    $.when.apply(null, getGeoCodeRequestObjects()).then(successHandler, logFailure);
  }
);