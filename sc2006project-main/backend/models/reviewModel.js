
class Review {
    constructor(reservation_id, stars_given, review_text, reply)
    {
        this.reservation_id = reservation_id;
        this.stars_given = stars_given;
        this.review_text = review_text;
        this.reply = reply;
    }
}

module.exports = Review;