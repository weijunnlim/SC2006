const Review = require('../models/reviewModel')
const { Timestamp } = require('firebase-admin/firestore');
// const { UserRecord } = require('firebase-admin/auth');
const { firestore } = require('firebase-admin');
const { use } = require('../routes/review');


// POST
const createReview = async (req, res) =>{
    const { reservation_id } = req.params;
    const { stars_given, review_text } = req.body;
    try {
        var arr = reservation_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        var newReview = new Review(reservation_id, stars_given, review_text, "");
        
        //Retrieve review collections to later POST
        const restReviewCollection = firestore().collection("restaurants").doc(restaurant_uid).collection("allReviews");
        const patronReviewCollection = firestore().collection("patrons").doc(patron_uid).collection("myReviews");
    
        //Retrieve reservation document to later modify "feedback_status"
        const restReserveDoc = firestore().collection("restaurants").doc(restaurant_uid).collection("allReservations").doc(reservation_id)
        const patronReserveDoc = firestore().collection("patrons").doc(patron_uid).collection("myReservations").doc(reservation_id)

        const patronDoc = await firestore().collection("patrons").doc(patron_uid).get();
        const patronName = patronDoc.data().name;
        const date_visited = (await patronReserveDoc.get()).data().date_time;
    
        // Fetch restaurant name from Firestore
        const restaurantDoc = await firestore().collection("restaurants").doc(restaurant_uid).get();
        const restaurantName = restaurantDoc.data().Name;
    
        // Generate custom IDs
        const review_id = reservation_id  + "_rvW"; // custom ID

    
        // Create review data objects
        const reviewDataForRestaurant = {
            stars_given: stars_given,
            review_text: review_text,
            patron_name: patronName,
            date_added : Timestamp.now(),
            date_visited : date_visited
        };
    
        const reviewDataForPatron = {
            stars_given: stars_given,
            review_text: review_text,
            restaurant_name: restaurantName,
            date_added : Timestamp.now(),
            date_visited : date_visited
        };

    
        await restReviewCollection.doc(review_id).set(reviewDataForRestaurant);
    
        await patronReviewCollection.doc(review_id).set(reviewDataForPatron);

// update to feedback has been given
        await restReserveDoc.update({
            feedback_status : "given"
        })

        await patronReserveDoc.update({
            feedback_status : "given"
        })
        // update average rating after review has been created
        await updateAverageRating(restaurant_uid);
        res.status(200).json({ Message: "Successfully reviewed", review_id : review_id });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(400).json({ error: "Error adding review" });
    }
}



// GET
const getReview = async (req, res) =>{
    const {review_id} = req.params;
    try {
        var arr = review_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        var review_doc = await firestore().collection("patrons").doc(patron_uid).collection('myReviews').doc(review_id).get()

        const patron_name = (await firestore().collection("patrons").doc(patron_uid).get()).data().name
        const restaurant_name = (await firestore().collection("restaurants").doc(restaurant_uid).get()).data().Name
    
        const date_added = review_doc.data().date_added
        const date_visited = review_doc.data().date_visited
        const stars_given = review_doc.data().stars_given
        const review_text = review_doc.data().review_text
        
        const review_data = {
            date_added: date_added,
            date_visited : date_visited,
            stars_given : stars_given,
            review_text : review_text,
            patron_name : patron_name,
            restaurant_name: restaurant_name
        }
        


        res.status(200).json({review_data})


    } catch{
        res.status(400).json({error: "error retrieving review"})
    }
}

// GET : restaurant to retrieve all reviews
const getRestaurantReviews = async (req, res) => {
    const { restaurant_id } = req.params;
    const { sort_time, sort_stars } = req.body;

    try {
        // Base query for reviews
        let query = firestore().collection("restaurants").doc(restaurant_id).collection("allReviews");

        // Apply sorting based on request parameters
        if (sort_time) {
            query = query.orderBy('date_added', 'desc'); 
        } else if (sort_stars) {
            query = query.orderBy('stars_given', 'desc'); 
        }

        // Execute the query
        const snapshot = await query.get();

        // Check if there are no reviews
        if (snapshot.empty) {
            return res.status(404).json({ message: "No reviews found for this restaurant" });
        }

        // Extract review data from the snapshot
        const reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                patron_name: data.patron_name,
                review_text: data.review_text,
                stars_given: data.stars_given,
                date_added: data.date_added // Consider including the review date in the response if available
            };
        });

        // Return the reviews
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).json({ error: "Failed to retrieve reviews" });
    }
};



// DELETE

const deleteReview = async (req, res) => {
    try {
        const {review_id} = req.body;

        var arr = review_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        const patron_collection =  firestore().collection("patrons").doc(patron_uid).collection("myReviews")
        const restaurant_collection =  firestore().collection("restaurants").doc(restaurant_uid).collection("allReviews")

        patron_collection.doc(review_id).delete()
        restaurant_collection.doc(review_id).delete()


        res.status(200).json({success : "Success in deleting review", review_id : review_id})
        // Update the average rating after deletion though idt we doing deleting of reviews
        await updateAverageRating(restaurant_uid);
    
    }catch{
        res.status(400).json({error: "cannot delete review"})
    }
}



const editReview = async (req, res) => {
    const {stars_given, review_text} = req.body;
    try {
        

        var reviewBody = {
            stars_given: stars_given,
            review_text: review_text,
            date_visited: date_visited
        }

        var arr = review_id.split('_')
        var patron_uid = arr[0]
        var restaurant_uid = arr[1]

        const patron_collection =  firestore().collection("patrons").doc(patron_uid).collection("myReviews")
        const restaurant_collection =  firestore().collection("restaurants").doc(restaurant_uid).collection("allReviews")

        // Update the review document and wait for completion
        await Promise.all([
            patron_collection.doc(review_id).update(reviewBody),
            restaurant_collection.doc(review_id).update(reviewBody)
        ]);
        // Ensure the update operation has completed before recalculating the average
        await updateAverageRating(restaurant_uid);


        res.status(200).json({success : "Success in editing review", review_id : review_id, newReview : reviewBody})
    
    }catch{
        res.status(400).json({error: "cannot edit review"})
    }
}

//test to try to calculate average ratings
//1. when review is created by patron, update the restaurant's average rating
//2. update and store average rating in database
const updateAverageRating = async (restaurant_id) => {
    try {
        const reviewsSnapshot = await firestore().collection("restaurants").doc(restaurant_id).collection("allReviews").get();
        let totalStars = 0;
        let reviewCount = 0;

        reviewsSnapshot.forEach(doc => {
            totalStars += doc.data().stars_given;
            reviewCount++;
        });

        if (reviewCount === 0) {
            console.log("No reviews to calculate average rating.");
            return;
        }

        const averageRating = totalStars / reviewCount;

        // Update the restaurant document with the new average rating
        await firestore().collection("restaurants").doc(restaurant_id).update({
            Rating: averageRating
        });
    } catch (error) {
        console.error("Error updating average rating:", error);
        throw new Error("Failed to update average rating");
    }
};

module.exports = {
    
    createReview,
    getReview,
    deleteReview,
    editReview,
    getRestaurantReviews
}
