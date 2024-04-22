const { firestore } = require('firebase-admin');

const migrateData = async (req, res) => {
    try {
        const srcCollection = firestore().collection("dummyrestaurants");
        const dstCollection = firestore().collection("restaurants");

        const querySnapshot = await srcCollection.get();

        const batch = firestore().batch();

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const newDocRef = dstCollection.doc(); // Automatically generate a unique ID
            const newDoc = {
                Address: data.Address,
                Location: data.Location,
                Name: data.Name,
                Rating: data.Rating,
                dietaryRestrictions: data.dietaryRestriction
            };
            batch.set(newDocRef, newDoc);
        });

        await batch.commit();

        res.status(200).send("Data migration completed successfully.");
    } catch (error) {
        console.error("Error migrating data:", error);
        res.status(500).send("Internal server error during data migration.");
    }
};

module.exports = {
    migrateData
};
