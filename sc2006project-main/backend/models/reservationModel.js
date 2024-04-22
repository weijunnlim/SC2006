class Reservation {
    constructor(patron_uid, restaurant_uid, date_reservation, time_reservation, pax_size, feedback_status)
    {
        this.patron_uid = patron_uid;
        this.restaurant_uid = restaurant_uid;
        this.date_and_time = Reservation.parseDateAndTime(date_reservation, time_reservation)
        this.pax_size = pax_size;
        this.feedback_status = this.feedback_status;
    }

    static parseDateAndTime(dateString, timeString) {
        const dateTimeString = `${dateString} ${timeString}`;
        const dateTime = new Date(dateTimeString);
        return dateTime;
    }

    static convertToString(date_and_time){
        return date_and_time.toString();
    }

    static isOver(dateString, timeString){
        const dateTimeString = `${dateString} ${timeString}`;
        const dateTime = new Date(dateTimeString);

        const currentDateAndTime = new Date() // current time
        
        if (dateTime > currentDateAndTime){
            return false;
        }

        return true;
    }
}


module.exports = Reservation;