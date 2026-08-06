const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: String,

  // ☁️ Cloudinary Image
  image: {
    url: {
      type: String,
      default:
        "https://images.pexels.com/photos/4916017/pexels-photo-4916017.jpeg",
    },

    filename: {
      type: String,
      default: "default-image",
    },
  },

  price: Number,

  location: {
    type: String,
    trim: true,
  },

  country: {
    type: String,
    trim: true,
  },

  // 📍 GeoJSON
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },

    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//////////////////////////////////////////////////////
// 🧹 Delete Reviews Automatically
//////////////////////////////////////////////////////

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;