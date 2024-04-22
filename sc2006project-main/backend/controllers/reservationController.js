const Reservation = require('../models/reservationModel')
const { Timestamp } = require('firebase-admin/firestore');
const { firestore } = require('firebase-admin');
const { format } = require('date-fns');

// function to create custom reservation id: 
// concatenation {patron_uid, "_" , restaurant_uid + "_XXXXXXXX"} 
// X is a  ASCII character from alphabet set and numeral set

function generateReservationId(patron_uid, restaurant_uid) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let reservation_id = patron_uid  + "_" + restaurant_uid + "_bkNG_";
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        reservation_id += characters.charAt(randomIndex);
    }
    return reservation_id;
}

function formatDate(date) {
    return format(date, 'dd-MMM-yyyy'); //display nice nice
}


// POST
const createReservation = async (req, res) =>{
    const {patron_uid, restaurant_uid, date_reservation, time_reservation, pax_size} = req.body;
    try {

        const restReservationCollection = firestore().collection("restaurants").doc(restaurant_uid).collection("allReservations");
        const userReservationCollection = firestore().collection("patrons").doc(patron_uid).collection("myReservations");
    
        // Fetch patron name from Firestore
        const patronDoc = await firestore().collection("patrons").doc(patron_uid).get();
        const patronName = patronDoc.data().name || "Not provided"
        const patronNo = patronDoc.data().mobileNumber || "Not provided"
    
        // Fetch restaurant name from Firestore
        const restaurantDoc = await firestore().collection("restaurants").doc(restaurant_uid).get();
        const restaurantName = restaurantDoc.data().Name;
    
        // Generate custom IDs
        const reservation_id = generateReservationId(patron_uid, restaurant_uid); // custom ID
        const date_time = new Date(`${date_reservation}T${time_reservation}`);

        if (date_time <= new Date()){
            return res.status(400).json({error: "You cannot make a reservation in the past!"})
        }

        // Create reservation data objects
        const reservationBodyForRestaurant = {
            patron_name: patronName,
            patron_contact: patronNo,
            date_time: Timestamp.fromDate(date_time),
            pax_size: pax_size,
            feedback_status: "pending"
        };
    
        const reservationBodyForPatron = {
            restaurant_name: restaurantName,
            date_time: Timestamp.fromDate(date_time),
            pax_size: pax_size,
            feedback_status: "pending"
        };
    
        await restReservationCollection.doc(reservation_id).set(reservationBodyForRestaurant);
    
        await userReservationCollection.doc(reservation_id).set(reservationBodyForPatron);
        
        res.status(200).json({ Message: "Successfully reserved", reservation_id : reservation_id });
    } catch (error) {
        res.status(400).json({ error: "Error adding reservation" });
    }
}

// GET : restaurant to retrieve all reservations
const getRestaurantReservations = async (req, res) =>{
    const { restaurant_uid } = req.params

    try{
        const reservation_collections = await firestore().collection("restaurants").doc(restaurant_uid).collection('allReservations').get()

        const past_reservations = []
        const upcoming_reservations = []
        const now = new Date()
        // patron_uid, restaurant_uid, date_reservation, time_reservation, pax_size

        reservation_collections.forEach(doc => {
            const data = doc.data();
            const reservationDate = data.date_time.toDate();
            const reservation = {
                patron_contact: data.patron_contact,
                patron_name : data.patron_name,
                date_reservation : formatDate(reservationDate),
                time_reservation: reservationDate.toLocaleTimeString(),
                pax_size : data.pax_size
            }
            if (reservationDate > now){
                upcoming_reservations.push(reservation)
            }
            else {
                past_reservations.push(reservation)
            }
        })

        if (upcoming_reservations.length === 0){
            res.status(200).json({message: "You have no upcoming reservations"})
        }
        else{
            res.status(200).json({upcoming_reservations: upcoming_reservations, past_reservations : past_reservations})
        }
        
    } catch(error) {
        console.error("Error retrieving reservations:", error);
        res.status(400).json({ error: "Error retrieving reservations" });
    }
}


// GET : patron to retrieve his/her reservations
const getPatronsReservations = async (req, res) =>{
    const { patron_uid } = req.params

    try{
        const reservation_collections = await firestore().collection("patrons").doc(patron_uid).collection('myReservations').get()

        const past_reservations = []
        const upcoming_reservations = []
        const now = new Date()
        // patron_uid, restaurant_uid, date_reservation, time_reservation, pax_size

        reservation_collections.forEach(doc => {
            const data = doc.data();
            const reservationDate = data.date_time.toDate();
            const reservation = {
                reservation_id : doc.id,
                restaurant_name : data.restaurant_name,
                date_reservation : formatDate(reservationDate),
                time_reservation: reservationDate.toLocaleTimeString(),
                pax_size : data.pax_size,
                feedback_status : data.feedback_status
            }
            if (reservationDate > now){
                upcoming_reservations.push(reservation)
            }
            else {
                past_reservations.push(reservation)
            }
        })
        

        if (upcoming_reservations.length === 0 && past_reservations.length === 0){
            res.status(200).json({message: "You have not made any reservations"})
        }

        else{
            res.status(200).json({upcoming_reservations: upcoming_reservations, past_reservations : past_reservations})
        }
        
    } catch(error) { 
        console.error("Error retrieving reservations:", error);
        res.status(400).json({ error: "Error retrieving reservations" });
    }
}


// GET : restaurant/patron to retrieve and open up full reservation details
const getReservation = async (req, res) =>{
    const {reservation_id} = req.params;
    try {
        var arr = reservation_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        var reservation_doc = await firestore().collection("patrons").doc(patron_uid).collection('myReservations').doc(reservation_id).get()

        if (!reservation_doc.exists) {
            res.status(404).json({error : "Reservation not found"})
        }

        else{
        const patron_name = (await firestore().collection("patrons").doc(patron_uid).get()).data().name
    
        const restaurant_name = reservation_doc.data().restaurant_name
        const date_reservation = reservation_doc.data().date_reservation
        const time_reservation = reservation_doc.data().time_reservation
        const pax_size = reservation_doc.data().pax_size
        const remarks = reservation_doc.data().remarks
        
        const reservation_data = {
            patron_name : patron_name,
            restaurant_name: restaurant_name,
            date_reservation: date_reservation,
            time_reservation: time_reservation,
            pax_size: pax_size,
            remarks : remarks
        }
        res.status(200).json({reservation_data})
    }

    } catch{
        res.status(400).json({error: "error retrieving reservation"})
    }
}


// DELETE

const deleteReservation = async (req, res) => {
    const {reservation_id} = req.params;
    try {

        var arr = reservation_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        const patron_collection =  firestore().collection("patrons").doc(patron_uid).collection("myReservations")
        const restaurant_collection =  firestore().collection("restaurants").doc(restaurant_uid).collection("allReservations")

        patron_collection.doc(reservation_id).delete()
        restaurant_collection.doc(reservation_id).delete()

        res.status(200).json({success : "Success in deleting reservation", reservation_id : reservation_id})
    
    }catch{
        res.status(400).json({error: "cannot delete reservation"})
    }
}



const editReservation = async (req, res) => {
    const {reservation_id} = req.params
    try {
        var arr = reservation_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        const patron_collection =  firestore().collection("patrons").doc(patron_uid).collection("myReservations")
        const restaurant_collection =  firestore().collection("restaurants").doc(restaurant_uid).collection("allReservations")

        console.log(patron_uid, restaurant_uid)

        const date_time = new Date(`${req.body.date_reservation}T${req.body.time_reservation}`);

        if (date_time <= new Date()){
            return res.status(400).json({error: "You cannot make a reservation in the past!"})
        }

        await patron_collection.doc(reservation_id).update(req.body)
        await restaurant_collection.doc(reservation_id).update(req.body)
        await patron_collection.doc(reservation_id).update({date_time: date_time})
        await restaurant_collection.doc(reservation_id).update({date_time: date_time})

        res.status(200).json({success : "Success in editing reservation", reservation_id : reservation_id, updatedReservationDetails : req.body})
    
    }catch{
        res.status(400).json({error: "cannot edit reservation", id: reservation_id})
    }
}
module.exports = {
    createReservation,
    getReservation,
    getPatronsReservations,
    getRestaurantReservations,
    deleteReservation,
    editReservation
}