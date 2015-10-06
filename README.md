# Geocode
Example of using Google APIs to geocode addresses and map them

# File Description

<table>
	<tr>
		<th>File Name</th>
		<th>Purpose</th>
	</tr>
	<tr>
		<td>index.html</td>
		<td>
		<div>
			Responsible for presenting the UI for the example. It contains:
		</div>
		<ol>
			<li>
				Text box for entering the address.
			</li>
			<li>
				Button to get the distances from the provided address to a predefined list of destinations.
			</li>
			<li>
				A table to display the results.
			</li>
			<li>
				A map to display the origin and destinations, and put a marker at each location.
			</li>
			<li>
				A script to initialize some variables to be used by other functions.
			</li>
		</ol></td>
	</tr>
	<tr>
		<td>css/app.css</td>
		<td>Holds styles related to the aplication.</td>
	</tr>
	<tr>
		<td>css/reset.css</td>
		<td>Resets the styles on all HTML elements so that we can define our own.</td>
	</tr>
	<tr>
		<td>js/initMap.js</td>
		<td>
		<div>
			Initializes the map component and sets the location to a default location.
		</div>
		<div>
			This file also calls a function to comput the desitances from the provided address to the pre-defined list of destinations.
		</div></td>
	</tr>
	<tr>
		<td>js/script.js</td>
		<td>
		<div>
			Contains the functions to:
		</div>
		<ol>
			<li>
				Compute the distances of the destinations from the origin.
			</li>
			<li>
				Add markers to the map for the origin and the destinations.
			</li>
			<li>
				draw paths from the origin to the destinations.
			</li>
			<li>
				Update the UI whenever the origin changes so that the markers and the paths are refreshed.
			</li>
			<li>
				A function that parallelizes the AJAX calls to get the geocode coordniates of the destinations.
			</li>
			<li>
				Success handler for the AJAX calls that stores the geocoded locations to an array and calls the functions to compute distances and add markers.
			</li>
		</ol></td>
	</tr>
</table>

# Future Improvements

<ol>
  <li>Change the address textbox to a Google Places Autocomplete.</li>
  <li>Optimize the addMarkersToMap() function in js/script.js. Currently it redraws the destination coordniates everytime origin changes. This might be ok if we have a web service or user input for destinations that can change randomly. But even then we can do some dirty chcecking to enhance this behavior.</li>
</ol>
