const mongoose = require('mongoose');

const shareScheme = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: String,
    fileName: String,
    fileURL: String,
    nativeFileName: String,
    directoryName: String,
    isLoaded: Boolean
})

module.exports = mongoose.model('newShare', shareScheme)