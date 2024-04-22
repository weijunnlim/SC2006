const express = require('express')
const cors= require('cors') //for front-end framework
const { db } = require('../firebase')
const Reservation = require('../models/reservationModel')

const {
    createReservation,
    getReservation,
    getPatronsReservations,
    getRestaurantReservations,
    deleteReservation,
    editReservation
} = require('../controllers/reservationController')

const router = express.Router()
router.use(cors())

//POST
router.post('/', createReservation)

router.delete('/:reservation_id', deleteReservation)

router.patch('/:reservation_id', editReservation)

router.get('/:reservation_id', getReservation)

router.get('/myReservations/:patron_uid', getPatronsReservations)

//getting reservations for individual restaurants
router.get('/allReservations/:restaurant_uid', getRestaurantReservations)


module.exports = router;
