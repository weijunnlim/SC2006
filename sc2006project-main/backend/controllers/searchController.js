//const { googleMapsApiKey } = require('../config/googlemap'); // Add your Google Maps API key here
const { Client } = require('@googlemaps/google-maps-services-js');
const { use } = require('../routes/search');
// Initialize Google Maps Places API client
const googleMapsClient = new Client({});
const { Timestamp } = require('firebase-admin/firestore');
const { firestore } = require('firebase-admin');
const { response } = require('express');

const config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
}
// Controller function to search nearby places

async function searchNearbyPlaces(req, res) {
    const { location, distance, minRating, dietaryRestrictions, specifiedRestaurantName } = req.body;

    try {
        // Construct parameters for the Google Maps Places API request
        const params = {
            location: location,
            radius: distance || 1000, // default radius if not provided
            type: ['restaurant', 'cafe'],
            key: 'AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg'
        };

        const response = await googleMapsClient.placesNearby({ params });

        if (response.data && response.data.results.length) {
            const filteredResults = await filterRestaurants(response.data.results, minRating, dietaryRestrictions, specifiedRestaurantName);
            const restaurantsFromGoogle = filteredResults.map(result => ({
                PlaceID: result.place_id,
                PhotoRef: result.photos ? result.photos[0].photo_reference : undefined,
                Name: result.name,
                Address: result.vicinity,
                Rating: result.rating,
                Location: result.geometry.location
            }));

            // Send filtered results in response
            res.status(200).json({ restaurants: restaurantsFromGoogle });
        } else {
            res.status(404).json({ error: 'No nearby places found' });
        }
    } catch (error) {
        console.error('Error searching nearby places:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function filterRestaurants(results, minRating, dietaryRestrictions, specifiedRestaurantName) {
    const filteredResults = [];
    for (const result of results) {
        if (result.business_status === 'CLOSED_TEMPORARILY' || !result.types.includes('restaurant')) continue;
        if (minRating && result.rating < minRating) continue;

        const { isHalal, isVegetarian } = await halalVegCheck(result.place_id);

        if ((dietaryRestrictions.Halal && !isHalal) || (dietaryRestrictions.Vegetarian && !isVegetarian)) continue;
        if (specifiedRestaurantName && !result.name.toLowerCase().includes(specifiedRestaurantName.toLowerCase())) continue;

        filteredResults.push(result);
    }
    return filteredResults;
}


const getRestaurantDetails = async (req, res) => {
    const { restaurantId } = req.params;

    try {
        // Assuming you have a Firestore instance initialized
        const restaurantRef = firestore().collection('dummyrestaurants').doc(restaurantId);
        const restaurantDoc = await restaurantRef.get();

        if (restaurantDoc.exists) {
            const restaurantData = restaurantDoc.data();
            res.status(200).json({ restaurant: restaurantData });
        } else {
            res.status(404).json({ error: "Restaurant not found" });
        }
    } catch (error) {
        console.error("Error retrieving restaurant data:", error);
        res.status(500).json({ error: "Error retrieving restaurant data" });
    }
}

const getAllRestaurantDetails = async (req, res) => {
    const { minRating, dietaryRestrictions, specifiedRestaurantName, distance, location } = req.body;

    try {
        // Assuming you have a Firestore instance initialized
        let restaurantRef = firestore().collection('restaurants');
        let snapshot = await restaurantRef.get();

        if (snapshot.empty) {
            res.status(404).json({ error: "No restaurants found" });
            return;
        }

        let restaurants = [];
        for (const doc of snapshot.docs) {
            let restaurantData = doc.data();

            var newRestaurantData = {
                restaurant_id : doc.id,
                ...restaurantData
            }
        
            // Filter restaurants based on minimum rating
            if (minRating && restaurantData.Rating < minRating) {
                continue;
            }
        
            if (dietaryRestrictions.Halal && (!restaurantData.dietaryRestrictions || restaurantData.dietaryRestrictions.Halal === false)) {
                continue; // Skip this restaurant if it's not Halal
            }
            
            if (dietaryRestrictions.Vegetarian && (!restaurantData.dietaryRestrictions || restaurantData.dietaryRestrictions.Vegetarian === false)) {
                continue; // Skip this restaurant if it's not Vegetarian
            }
            
            // Calculate the distance between the user's location and the restaurant's location
            const restaurantLocation = restaurantData.Location ? restaurantData.Location : null;
            if (restaurantLocation) {
                const restaurantDistance = calculateDistance(location, restaurantLocation);
                if (restaurantDistance && (!distance || restaurantDistance <= distance)) {
                    newRestaurantData.distance = restaurantDistance; // Add distance to newRestaurantData
                    restaurants.push(newRestaurantData);
                }
            }
            
        }
        res.status(200).json({ restaurants });
        //endTry
    } catch (error) {
        console.error('Error retrieving restaurant data:', error);
        res.status(500).json({ error: 'Error retrieving restaurant data' });
    }
};
// Function to calculate the distance between two geographic points using the Haversine formula
function calculateDistance(origin, destination) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const lat1 = origin.latitude;
    const lon1 = origin.longitude;
    const lat2 = destination.latitude;
    const lon2 = destination.longitude;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c *1000
    return distance; // Distance in meters
}

async function halalVegCheck(place_id) {
    const halal_keywords = ["ramadan", "muslim", "halal", "fasting",
     "sayur", "bagus", "malay", "indian muslim", "sedap", "memang", "prata", "lontong", "satay", "laksa", "mee rebus", "mee soto", "rendang", "roti prata", 
     "keropok lekor", "sambal", "otak-otak", "ayam penyet", "murtabak"];

    const vegetarian_keywords = ["meat free", "mock meat", "vegan", "vegetarian", "vegetables", "素", "斋", "初一", "十五", ""];
    try {
        const response = await googleMapsClient.placeDetails({
            params: {
                place_id: place_id,
                fields: 'name,reviews', 
                key: 'AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg'
            }
        });

        let isHalal = false, isVegetarian = false;
        if (response.data && response.data.result) {
            // Check the reviews for keywords
            if (response.data.result.reviews) {
                for (const review of response.data.result.reviews) {
                    const reviewTextLower = review.text.toLowerCase();
                    isHalal = halal_keywords.some(keyword => reviewTextLower.includes(keyword));
                    isVegetarian = vegetarian_keywords.some(keyword => reviewTextLower.includes(keyword));
                    if (isHalal && isVegetarian) break; // Short-circuit if both conditions are met
                }
            }

            const placeNameLower = response.data.result.name.toLowerCase();
            isHalal = isHalal || halal_keywords.some(keyword => placeNameLower.includes(keyword));
            isVegetarian = isVegetarian || vegetarian_keywords.some(keyword => placeNameLower.includes(keyword));
        }

        return { isHalal, isVegetarian };
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        return { error: 'Failed to retrieve restaurant details', isHalal: false, isVegetarian: false };
    }
}

const testHV = async (req, res) => {
    const { place_id } = req.body;

    try {
        const response = await googleMapsClient.placeDetails({
            params: {
                place_id: place_id,
                fields: 'name,reviews', // Ensure 'reviews' are requested
                key: 'AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg' 
            }
        });

        // Check if response contains data and result
        if (response.data && response.data.result) {
            // Process the data to return only the necessary information
            const placeDetails = {
                name: response.data.result.name,
                reviews: response.data.result.reviews // Assuming you want to send back reviews
            };
            res.status(200).json(placeDetails);
        } else {
            // Send back a generic error message or customize as needed
            res.status(400).json({ error: 'No data found for the provided place ID' });
        }

    } catch (error) {
        // Log the error and send back an error message
        console.error('Error fetching place details:', error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    searchNearbyPlaces,
    getRestaurantDetails,
    getAllRestaurantDetails,
    testHV
};