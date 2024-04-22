const express = require('express')
const cors=require('cors') //for front-end framework
const { db } = require('../firebase')
const Login = require('../models/authenticationModel')

const {
    registerUser,
    deleteUser,
    updateUser,
    getUser,
    // AuthenticatePatron,
    verifyToken,
    // uthenticateRestaurant,
    authenticateUser
} = require('../controllers/authenticationController')

//require('dotenv').config()


const router = express.Router()
router.use(cors())



//POST
router.post('/registerUser', registerUser)

router.delete('/deleteUser', deleteUser)

router.patch('/', updateUser)

router.get('/:userId', getUser)

// router.post('/authenPatron', AuthenticatePatron)

// router.post('/authenRestaurant', AuthenticateRestaurant)

router.post('/verifyToken', verifyToken)

router.post('/login', authenticateUser)


module.exports = router;
