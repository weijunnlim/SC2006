const Patron = require("../models/PatronModel");
const Restaurant = require("../models/RestaurantModel");
const { Timestamp } = require("firebase-admin/firestore");
const { firestore } = require("firebase-admin");

// PATCH

const { GeoPoint } = require('firebase-admin').firestore;

const updateRestaurantProfile = async (req, res) => {
  const { restaurant_uid } = req.params;

  try {
    console.log(req.body); 
    const restaurant_doc = firestore()
      .collection("restaurants")
      .doc(restaurant_uid);
    
    const fieldsToUpdate = { ...req.body };

    if (req.body.Address) { 
      const geoPoint = await Restaurant.convertAddToCoords(req.body.Address);
      if (!geoPoint) {
        return res.status(400).json({ error: "Invalid address input" });
      }
      fieldsToUpdate.Location = new GeoPoint(geoPoint.lat, geoPoint.lng); // Update the location as a GeoPoint
    }

    // Update the document in a single operation
    await restaurant_doc.update(fieldsToUpdate);

    // Retrieve the updated document
    const updated_rest_doc = (await restaurant_doc.get()).data();

    res.status(200).json({ restaurant: updated_rest_doc });
  } catch (error) {
    console.error("Error occurred while updating restaurant profile:", error);
    res.status(400).json({ error: "Cannot update" });
  }
};


const getRestProfile = async (req, res) => {
  const { restaurant_uid } = req.params;

  try {
    const rest_profile = await firestore()
      .collection("restaurants")
      .doc(restaurant_uid)
      .get();

    if (!rest_profile.exists) {
      res.status(404).json({ error: "We could not retrieve your profile" });
    } else {
      res.status(200).json(rest_profile.data());
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PATCH
// Jodius can refer
const updatePatronProfile = async (req, res) => {
  const { patron_uid } = req.params;

  try {
    console.log(req.body); //see the contents of req.body
    const patron_doc = firestore().collection("patrons").doc(patron_uid);
    await patron_doc.update({ ...req.body });

    const updated_patron_doc = await patron_doc.get();
    res.status(200).json({ updated_patron_doc });
  } catch (error) {
    console.error("Error occurred while updating patron profile:", error);
    res.status(400).json({ error: "Cannot update" });
  }
};

const getPatronProfile = async (req, res) => {
  const { patron_uid } = req.params;

  try {
    const patron_profile = await firestore()
      .collection("patrons")
      .doc(patron_uid)
      .get();

    if (!patron_profile.exists) {
      res.status(404).json({ error: "We could not retrieve your profile" });
    } else {
      res.status(200).json(patron_profile.data());
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRestaurantWaitingTime = async (req, res) => {
  const { restaurant_uid } = req.params;
  const { waitingTime } = req.body; // Expect waitingTime to be provided in the request body

  if (waitingTime === undefined) {
    return res.status(400).json({ error: "Waiting time is required" });
  }

  try {
    const restaurant_doc = firestore().collection("restaurants").doc(restaurant_uid);

    // Update only the waiting time
    await restaurant_doc.update({ Waiting_time: waitingTime });

    // Optionally, retrieve the updated document to confirm the change
    const updated_rest_doc = (await restaurant_doc.get()).data();

    res.status(200).json({ 
      message: "Waiting time updated successfully",
      restaurant: updated_rest_doc 
    });
  } catch (error) {
    console.error("Error occurred while updating waiting time:", error);
    res.status(400).json({ error: "Cannot update waiting time" });
  }
};

const getRestaurantWaitingTime = async (req, res) => {
  const { restaurant_uid } = req.params;

  try {
    const restaurantDoc = firestore().collection("restaurants").doc(restaurant_uid);
    const doc = await restaurantDoc.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const data = doc.data();
    const waitingTime = data.Waiting_time !== undefined ? data.Waiting_time : "Waiting time not set";

    res.status(200).json({
      restaurant_id: restaurant_uid,
      waitingTime: waitingTime
    });
  } catch (error) {
    console.error("Error retrieving restaurant waiting time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRestaurantAvailability = async (req, res) => {
  const { restaurant_uid } = req.params;
  const { isAvailable } = req.body; 

  if (isAvailable === undefined) {
    return res.status(400).json({ error: "Availability status is required" });
  }

  try {
    const restaurant_doc = firestore().collection("restaurants").doc(restaurant_uid);

    // Update only the availability status
    await restaurant_doc.update({ IsAvailable: isAvailable });

    // Optionally, retrieve the updated document to confirm the change
    const updated_rest_doc = (await restaurant_doc.get()).data();

    res.status(200).json({
      message: "Availability status updated successfully",
      restaurant: updated_rest_doc
    });
  } catch (error) {
    console.error("Error occurred while updating restaurant availability:", error);
    res.status(400).json({ error: "Cannot update availability" });
  }
};

const getRestaurantAvailability = async (req, res) => {
  const { restaurant_uid } = req.params;

  try {
    const restaurantRef = firestore().collection("restaurants").doc(restaurant_uid);
    const doc = await restaurantRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const data = doc.data();
    const availability = data.IsAvailable !== undefined ? data.IsAvailable : null; // Default to null if not set

    res.status(200).json({
      restaurant_id: restaurant_uid,
      isAvailable: availability
    });
  } catch (error) {
    console.error("Error retrieving restaurant availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateRestaurantProfile,
  getRestProfile,
  updatePatronProfile,
  getPatronProfile,
  updateRestaurantWaitingTime,
  getRestaurantWaitingTime,
  updateRestaurantAvailability,
  getRestaurantAvailability,
};
