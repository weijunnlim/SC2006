const Authentication = require("./authenticationModel");
const { Client, Status } = require('@googlemaps/google-maps-services-js');

class Restaurant extends Authentication {
    constructor(name, latitude, longitude) {
        super();
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.allReservations = [];
        this.allReviews = [];
    }

    static async convertAddToCoords(address) {
        const client = new Client({});
        
        try {
            const response = await client.geocode({
                params: {
                    address: address,
                    key: 'AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg' 
                },
                timeout: 1000 // milliseconds
            });

            if (response.data.status === Status.OK) {
                const Location = response.data.results[0].geometry.location;
                return Location;
                // console.log("Latitude:", location.lat);
                // console.log("Longitude:", location.lng);
            } else {
                console.error("Geocode was not successful for the following reason:", response.data.error_message);
            }
        } catch (error) {
            console.error("Error occurred while geocoding:", error);
        }

        return false;
    }
}

module.exports = Restaurant;
