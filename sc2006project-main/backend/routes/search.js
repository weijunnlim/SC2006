const express = require('express');
const cors= require('cors') //for front-end framework
const { searchNearbyPlaces,getRestaurantDetails,getAllRestaurantDetails, testHV } = require('../controllers/searchController');



const router = express.Router()
router.use(cors())
// POST route to search nearby places
router.post('/', searchNearbyPlaces);

// post route to get details of a specific restaurant by ID
router.post('/restaurants/:restaurantId', getRestaurantDetails);

router.post('/restaurants', getAllRestaurantDetails)
// GET route handler
router.post('/test', testHV)

module.exports = router;