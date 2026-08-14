const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    // TITLE 

    title: {
        type: String,
        required: true,
        trim: true
    },

    // DESCRIPTION 

    description: {
        type: String,
        required: true
    },

    // IMAGE 

    image: {
        url:String,
        filename:String,
    },

    //PRICE

    price: {
        type: Number,
        required: true,
        min: 0
    },

    //LOCATION

    location: {
        type: String,
        required: true,
        trim: true
    },

    //COUNTRY 

    country: {
        type: String,
        required: true,
        trim: true
    },

    // OWNER

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // MAP LOCATION 

    geometry: {

        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },

        coordinates: {
            type: [Number],
            default: [0, 0]
        }

    },

    // REVIEWS

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]

});


// DELETE REVIEWS WHEN LISTING IS DELETED
listingSchema.post(
    "findOneAndDelete",
    async (listing) => {
        if (listing) {
            await Review.deleteMany({
                _id: {
                    $in: listing.reviews
                }
            });

        }

    }
);

// MODEL
const Listing = mongoose.model(
    "Listing",
    listingSchema
);

module.exports = Listing;