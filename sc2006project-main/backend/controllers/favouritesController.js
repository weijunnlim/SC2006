const { Timestamp } = require('firebase-admin/firestore');
const { firestore } = require('firebase-admin');


// POST
const addToFavourites = async (req, res) => {
    try{
        const {patron_uid, restaurant_uid} = req.body;

        const favourite_id =  restaurant_uid 

        const userFavouritesCollection = firestore().collection("patrons").doc(patron_uid).collection("myFavourites")

        const restaurantDoc = await firestore().collection("restaurants").doc(restaurant_uid).get()

        if (!restaurantDoc.exists) {
            return res.status(404).json({ error: "Restaurant not found" })
        }
        const restaurant_data = restaurantDoc.data();

        const body = {
            Name : restaurant_data.Name,
            Address : restaurant_data.Address,
            Date_Added : Timestamp.now()
        }

        await userFavouritesCollection.doc(favourite_id).set(body)    

        // const updatedCollection = await firestore.collection("patrons").doc(patron_uid).collection("myFavourites").get()

        res.status(200).json({
            message: "Added to favorites successfully",
            favourite: body
        })

    }catch(error){
        console.error('Error adding to favorites:', error); // More detailed error logging
        res.status(500).json({ error: "Failed to add to favorites", details: error.message });
    }
}

module.exports ={
    addToFavourites
}