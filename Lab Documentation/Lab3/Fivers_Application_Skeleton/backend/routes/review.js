const express = require('express')
const cors= require('cors') //for front-end framework
const { db } = require('../firebase')
const Review = require('../models/reviewModel')

const {
    createReview,
    getReview,
    deleteReview,
    editReview,
    getRestaurantReviews
} = require('../controllers/reviewController')

const router = express.Router()
router.use(cors())

//POST
router.post('/:reservation_id', createReview)

router.delete('/', deleteReview)

router.patch('/:review_id', editReview)

router.get('/:review_id', getReview)

router.get('/allReviews/:restaurant_id', getRestaurantReviews)


module.exports = router;
