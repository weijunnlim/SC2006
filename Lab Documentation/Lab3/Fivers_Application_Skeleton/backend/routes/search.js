const express = require('express');
const cors= require('cors') //for front-end framework
const { searchNearbyPlaces,getRestaurantDetails,getAllRestaurantDetails } = require('../controllers/searchController');



const router = express.Router()
router.use(cors())
// POST route to search nearby places
router.post('/', searchNearbyPlaces);

// post route to get details of a specific restaurant by ID
router.post('/restaurants/:restaurantId', getRestaurantDetails);

router.post('/restaurants', getAllRestaurantDetails)
// GET route handler
router.get('/', (req, res) => {
    // Handle GET request to fetch places data
    res.send('This is the places data');
});

module.exports = router;