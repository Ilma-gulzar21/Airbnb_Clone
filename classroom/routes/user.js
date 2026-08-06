const express = require("express");
const router = express.Router();


//Index - users
router.get("/", (req, res) =>{
    res.send("GET for users");
})


//show - users
router.get("/:id", (req, res) =>{
    res.send("GET for  users id");
})


//post - users
router.get("/", (req, res) =>{
    res.send("post for users");
})


//DELETE - users
router.delete("/:id", (req, res) =>{
    res.send("GET for users id");
})


module.exports = router;