const express = require('express')
const cors=require('cors') //for front-end framework


const router = express.Router()
router.use(cors())

const {
    migrateData
} = require("../controllers/migrateDummy2Rest")


router.post('/', migrateData)

module.exports = router;