const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
}

main()
.then(() => initDB())   // 👈 DB connect hone ke baad hi initDB chale
.catch(err => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});

    const modifiedData = initData.data.map((obj) => ({
        ...obj,
        image: obj.image.url   // 👈 object se sirf URL nikal rahe
    }));

    await Listing.insertMany(modifiedData);

    console.log("data was initialized");
};