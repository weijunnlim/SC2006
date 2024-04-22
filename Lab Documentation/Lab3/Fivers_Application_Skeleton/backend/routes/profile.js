const express = require('express')
const cors = require('cors') //for front-end framework
const { db } = require('../firebase')

const Patron = require('../models/PatronModel')
const Restaurant = require('../models/RestaurantModel')

const {
    updateRestaurantProfile,
    getRestProfile,
    updatePatronProfile,
    getPatronProfile
} = require("../controllers/profileController")

const router = express.Router()
router.use(cors())

// Restaurant use
router.patch('/restaurantProfile/:restaurant_uid', updateRestaurantProfile)
router.get('/restaurantProfile/:restaurant_uid', getRestProfile)

// Patron use
router.patch('/:patron_uid', updatePatronProfile)
router.get('/:patron_uid', getPatronProfile)

module.exports = router;