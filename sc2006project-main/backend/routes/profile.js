const express = require('express')
const cors = require('cors') //for front-end framework
const { db } = require('../firebase')

const Patron = require('../models/PatronModel')
const Restaurant = require('../models/RestaurantModel')

const {
    updateRestaurantProfile,
    getRestProfile,
    updatePatronProfile,
    getPatronProfile,
    updateRestaurantWaitingTime,
    getRestaurantWaitingTime,
    updateRestaurantAvailability,
    getRestaurantAvailability,
} = require("../controllers/profileController")

const router = express.Router()
router.use(cors())

// Restaurant use
router.patch('/restaurantProfile/:restaurant_uid', updateRestaurantProfile)
router.get('/restaurantProfile/:restaurant_uid', getRestProfile)
router.patch('/waitingTime/:restaurant_uid', updateRestaurantWaitingTime);
router.get('/waitingTime/:restaurant_uid', getRestaurantWaitingTime);
router.patch('/availability/:restaurant_uid', updateRestaurantAvailability);
router.get('/availability/:restaurant_uid', getRestaurantAvailability);

// Patron use
router.patch('/:patron_uid', updatePatronProfile)
router.get('/:patron_uid', getPatronProfile)

module.exports = router;