const express = require('express')
const cors = require('cors') //for front-end framework
const { db } = require('../firebase')

const {
    addToFavourites
} = require("../controllers/favouritesController")

const router = express.Router()
router.use(cors())

// POST

router.post('/', addToFavourites)

module.exports = router;