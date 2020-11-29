const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgurl: String,
    name: String,
    country: String,
    time: Number,
    date: Date,
    revenue:Number
})

module.exports = mongoose.model('User', userSchema)