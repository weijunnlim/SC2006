require('dotenv').config()

const Authentication = require('../models/authenticationModel')
const { db, auth } = require('../firebase')
const { Timestamp } = require('firebase-admin/firestore')
const { UserRecord } = require('firebase-admin/auth')
const { firestore } = require('firebase-admin')
const { use } = require('../routes/authentication')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const { initializeApp } = require('firebase/app')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')

//Firebase-Normal User Authentication

const config = {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId
}

const app = initializeApp(config); 


/*
    Controller Functions 
*/
function validateEmail(email) {
    // Regular expression for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkPasswordStrength(password) {
    // Password strength criteria: At least 8 characters long
    const hasCapital = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLengthValid = password.length >= 8;

    // Check if all criteria are met
    const isStrong = hasCapital && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;
    return isStrong;
}


//Check Token Validity
const verifyToken =  async (req, res) =>
{
    //console.log(req.body)

    const {token} = req.body;

    const firebaseIdTokenRegex = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

    if(!firebaseIdTokenRegex.test(token))
    {
        console.log(token)
        return res.status(400).json({ message: false, error: 'Invalid token format' });
    }

    const decodeValue = auth.verifyIdToken(token).then((decodeToken) => {
        //console.log(decodeToken)
        return res.status(200).json({message: true});

    })
    .catch((et) => {
        console.error('Error verifying token:', et);
        return res.status(400).json({ message: false, error: 'Invalid or expired token' });
            
    });
}

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const auth = getAuth(app);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Attempt to find the user in both collections
        const patronDocRef = firestore().collection("patrons").doc(user.uid);
        const restaurantDocRef = firestore().collection("restaurants").doc(user.uid);

        const patronDoc = await patronDocRef.get();
        const restaurantDoc = await restaurantDocRef.get();

        if (patronDoc.exists) {
            // User is a patron
            console.log("Login as patron %s", user.uid);
            return res.status(200).json({ id: user.uid, token: user.accessToken, userType: "patron" });
        } else if (restaurantDoc.exists) {
            // User is a restaurant owner
            console.log("Login as restaurant %s", user.uid);
            return res.status(200).json({ id: user.uid, token: user.accessToken, userType: "restaurant" });
        } else {
            // User not found in either collection
            return res.status(404).json({ error: "User not found in either patrons or restaurants." });
        }
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(400).json({ error: "Authentication failed. Please try again." });
    }
};


//Register User
const registerUser = async (req, res) => {
   const {userType, email, password, confirmPassword} = req.body

    let error;

    try {
        var last_login = Timestamp.now()

        var newUser = new Authentication(email, password, userType, last_login);

        if(!validateEmail(email)){
            error = "Invalid Email";
        }

        if(!checkPasswordStrength(password)){
            error = "Invalid Password format! Please ensure your password contains One Special Character, One UpperCase";
        }

        if(password !== confirmPassword){
            error = "Passwords do not match, try again."
        }

        if (error) {
            console.log(error)
            res.status(400).json({error: error});
        }

        else{
        const userRecord = await auth.createUser(newUser);
        //Don't store password in database
        var userDetails = {
            email: email,
            last_login: last_login
        }

        const userId = userRecord.uid;

        (userType == "patron") ? createPatron(userId, userDetails) : createRestaurant(userId, userDetails)
        console.log('Successfully created user:', userId)

        res.status(200).json({
            action: true,
            userId: userId,
            message: "User successfully created"
        })
    }

    } catch (error)
    {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
}

function createPatron(userId, userDetails){
    var collection = firestore().collection("patrons")
    

    const patronBody = {
        ...userDetails,
        name : "Not set",
        mobileNumber: "Not set",
        dietaryRequirements : {
            "Vegetarian": false,
            "Halal": false
        }
    }
    collection.doc(userId).set(patronBody)
    
}

function createRestaurant(userId, userDetails){
    var collection = firestore().collection("restaurants")

    const patronBody = {
        ...userDetails,
        name : "Not set",
        mobileNumber: "Not set",
        dietaryRequirements : {
            "Vegetarian": false,
            "Halal": false
        },
        address: "Not set"
    }
    collection.doc(userId).set(userDetails)
}


//Delete User

const deleteUser = async(req, res) =>{
    const {userId, userType} = req.body
    const admin = require('firebase-admin');
    try {

        const collection = (userType == "patron") ?  firestore().collection("patrons") : firestore().collection("restaurants")

        const userDocRef = collection.doc(userId)

        const subcollections = await userDocRef.listCollections();
        
        const deletePromises = subcollections.map(async (subcollection) =>{
            const documents = await subcollection.listDocuments();
            return Promise.all(documents.map(doc => doc.delete()));
        })

        await Promise.all(deletePromises)

        await userDocRef.delete(); // delete from related user/restaurant collection

        await admin.auth().deleteUser(userId);

        res.status(200).json({
            action: true,
            userId : userId,
            mssg: "User deleted"
        })
    } catch (error){
        console.error("Error deleting document:", error);
        res.status(400).json({ error: "Error deleting user" });
    }
}

//Update User

const updateUser = async(req, res) => {
    const {userId, email, full_name, password, type} = req.body;

    const userDetails = {
        email : email,
        full_name: full_name,
        password: password
    }

    const userDetailsNoPassword = {
        email : email,
        full_name: full_name
    }
    
    try {
        // const user = await auth.getUser(userId);

        const updatedUserData = await auth.updateUser(userId, userDetails);

        const collection = (type == "patron") ?  firestore().collection("patrons") : firestore().collection("restaurants")

        collection.doc(userId).update(userDetailsNoPassword)

        // if (updatedUserData){
        res.status(200).json({
            action: true,
            userId: userId})
        // }
    }catch{
        res.status(400).json({error: "error updating user data"});
    }
}


// GET User

const getUser = async(req, res) => {
    const {userId} = req.params;
    
    try {
        const user = await auth.getUser(userId);

        if (user){
            res.status(200).json({user: user})
        }
        else{
            res.status(404).json({error: "User not found"})
        }

    }catch{
        res.status(400).json({error: "error retrieving user data"});
    }
}



module.exports = {
    registerUser,
    deleteUser,
    updateUser,
    getUser,
    // AuthenticatePatron,
    // AuthenticateRestaurant,
    authenticateUser,
    verifyToken
}
