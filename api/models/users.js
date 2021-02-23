const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    counterId: mongoose.Schema.Types.ObjectId,
    sessions: Array,
    lastSession: Date,
    sessionsNumber: Number,
    data: Object
})

module.exports = mongoose.model('User', userSchema)