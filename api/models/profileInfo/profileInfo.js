const mongoose = require('mongoose');

const profileInfoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    soName: String,
    company: String,
    description: String,
    proposals: Array,
    friends: Array,
    newFriends: Array
})

module.exports = mongoose.model('profileInfo', profileInfoSchema)