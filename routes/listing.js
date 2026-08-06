const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");



//////////////////////////////////////////////////////
// VALIDATION MIDDLEWARE
//////////////////////////////////////////////////////

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

//////////////////////////////////////////////////////
// 🔍 INDEX ROUTE
//////////////////////////////////////////////////////

router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

//////////////////////////////////////////////////////
// 🔍 SEARCH ROUTE (NEW PAGE OPEN)
//////////////////////////////////////////////////////

router.get("/search", async (req, res) => {
    let { place } = req.query;

    if (!place) {
        req.flash("error", "Please enter a location");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        $or: [
            { location: { $regex: place, $options: "i" } },
            { title: { $regex: place, $options: "i" } }
        ]
    });

    res.render("listings/search.ejs", { listings, place });
});

//////////////////////////////////////////////////////
// NEW ROUTE
//////////////////////////////////////////////////////

router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//////////////////////////////////////////////////////
// CREATE ROUTE
//////////////////////////////////////////////////////

router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res) => {

        const newListing = new Listing(req.body.listing);

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }

        await newListing.save();

        req.flash("success", "New Listing Created!");

        res.redirect("/listings");
    })
);

//////////////////////////////////////////////////////
// EDIT ROUTE
//////////////////////////////////////////////////////

router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
}));

//////////////////////////////////////////////////////
// SHOW ROUTE
//////////////////////////////////////////////////////

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}));

//////////////////////////////////////////////////////
// UPDATE ROUTE
//////////////////////////////////////////////////////

router.put(
    "/:id",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res) => {

        let { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.redirect("/listings");
        }

        let listing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true }
        );

        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };

            await listing.save();
        }

        req.flash("success", "Listing Updated!");

        res.redirect(`/listings/${id}`);
    })
);
//////////////////////////////////////////////////////
// DELETE ROUTE
//////////////////////////////////////////////////////

router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;