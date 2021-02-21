const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');




router.get("/",  (req,res)=>{
    res.status(200).json({message: req.connection.remoteAddress})
})

module.exports = router