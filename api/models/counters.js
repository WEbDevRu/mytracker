const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileId: mongoose.Schema.Types.ObjectId,
    name: String,
    domen: String,
    allusers: Number
})

module.exports = mongoose.model('Counter', counterSchema)