const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    soName: String,
    company: String,
    description: String,
    proposals: Array,
    friends: Array,
    newFriends: Array,
    avatar: {type: String, required: true},
    registered: Boolean
})

module.exports = mongoose.model('profileInfo', profileSchema)