// Array to store restaurant data
var restaurant = [];
// Google Maps map object
var map;
// Array to store markers
var markers = [];
// HTML table element
var table;

// Function to initialize the map
function initMap() {
    // Map options
    var options = {
        center: {lat: 1.3483, lng: 103.6831}, // Default is NTU
        zoom: 15,
        styles: [
            {
                "featureType": "poi",
                "stylers": [
                    {"visibility": "off"} // Hide points of interest
                ]
            }
        ]
    };


    // Create map object and set options
    map = new google.maps.Map(document.getElementById('map'), options);

    // Create autocomplete for places search
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),

        {
        types: ['geocode'],
        componentRestrictions: { country: 'SG' } // only Singapore
        }
    );

    // Add event listener for place change
    autocomplete.addListener('place_changed', searchNearbyPlaces);
}

// Function to clear all markers from the map
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function clearTable() {
    var table = document.getElementById("places");
    table.innerHTML = "";
}

// Function to search nearby places
function searchNearbyPlaces() {
    // Clear existing markers
    clearMarkers();
    clearTable();

    // Get selected place from autocomplete
    var place = autocomplete.getPlace();
    console.log(place);

    // Check if place details are available
    if (!place.geometry || !place.geometry.location) {
        alert("No details available for input: '" + place.name + "'");
        return;
    }

    // Set map center to selected place
    map.setCenter(place.geometry.location);

    // Initialize PlacesService
    var service = new google.maps.places.PlacesService(map);
    // Search nearby restaurants
    service.nearbySearch({
        location: place.geometry.location,
        radius: '500',
        type: ['restaurant']
    }, callback);
}

// Callback function for nearby search
function callback(results, status) {
    // Check if search was successful
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        // Create markers for each restaurant
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

// Function to create marker for a restaurant
async function createMarker(place) {
   // Create marker object
   var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' // Custom marker icon
});


// Push marker to markers array
markers.push(marker);

// Create info window for marker
var infowindow = new google.maps.InfoWindow({
    content: '<strong>' + place.name + '</strong><br>' +
        'Rating: ' + (place.rating || 'Not available') + '<br>' +
        'Address: ' + (place.vicinity || 'Not available') + '<br>' +
        'Price Level: ' + (place.price_level !== undefined ? '$'.repeat(place.price_level + 1) : 'Not available') + '<br>' 
});

// Add click event listener to marker to open info window
marker.addListener('click', function () {
    infowindow.open(map, marker);
});

    // Append restaurant information to the table
    var table = document.getElementById("places");
    var row = table.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    // Create a link for each restaurant

    var bookClick = 0;

    var link = document.createElement('a');
    link.href = 'restaurant_pages/' + encodeURIComponent(place.name) + '.html'; // Set the href attribute to the HTML page for the restaurant
    link.textContent = place.name; // Set the text content to the name of the restaurant
    cell1.appendChild(link);

    // Fill other table cells with restaurant information
    cell2.innerHTML = place.rating || 'Not available';
    cell3.innerHTML = place.vicinity || 'Not available';
    cell4.innerHTML = place.price_level !== undefined ? '$'.repeat(place.price_level + 1) : 'Not available';
    var string1 = place.name;
    var string2 = place.vicinity;

    cell5.innerHTML = "<button onclick='createAndOpenPopup(\"" + string1 + "\", \"" + string2 +"\")'>Book</button>";

    
}


/*
// Create HTML content for the restaurant
var restaurantHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${place.name}</title>
    </head>
    <body>
        <h1>${place.name}</h1>
        <p><strong>Rating:</strong> ${place.rating || 'Not available'}</p>
        <p><strong>Address:</strong> ${place.vicinity || 'Not available'}</p>
        <p><strong>Price Level:</strong> ${place.price_level !== undefined ? '$'.repeat(place.price_level + 1) : 'Not available'}</p>
    </body>
    </html>
`;

try {
    // Request access to the file system
    const handle = await window.showSaveFilePicker({
        suggestedName: place.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html',
        types: [
            {
                description: 'HTML Files',
                accept: {
                    'text/html': ['.html']
                }
            }
        ]
    });

    // Get the directory name from the selected file handle
    const directoryName = handle.name.replace(handle.name.substring(handle.name.lastIndexOf('/') + 1), 'restaurant_pages');

    // Create a new file handle with the modified directory name
    const newHandle = await handle.getFileHandle(directoryName, { create: true });

    // Create a writable stream
    const writable = await newHandle.createWritable();

    // Write the HTML content to the file
    await writable.write(restaurantHTML);

    // Close the file
    await writable.close();

    console.log('File saved successfully!');
} catch (error) {
    console.error('Unable to save file:', error);
}
*/