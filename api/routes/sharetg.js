const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const newShare = require('../models/sharetg');
const fs = require('fs')

router.get('/',  (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await newShare.countDocuments();

    newShare
        .find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            res.status(200).json({
                items: docs,
                totalPages: count,
                currentPage: page

            })

        })
        .catch()

}))



router.get('/:fileName', ((req, res, next) => {
    const fileName = req.params.fileName
    newShare.find({"fileName": fileName})
        .exec()
        .then(doc =>{
            console.log(doc)
            res.status(200).json({
               userName: doc[0].userName,
               fileName: doc[0].fileName,
               pageLink: "http://nikrainev.ru/"+ doc[0].directoryName,
               isLoaded: doc[0].isLoaded
            })
        })
        .catch(err =>{
            console.log(err)
            res.status(503).json(err)
        })

}))

router.post('/', (async (req, res, next) => {

    const count = await newShare.countDocuments();


    const newSharee = new newShare(
        {
            _id:  mongoose.Types.ObjectId(),
            userName: req.body.userName,
            fileName: req.body.fileName,
            fileURL: req.body.fileURL,
            isLoaded: true,
            directoryName: count
        })
    fs.mkdirSync(count.toString())
    fs.openSync("../../../var/www/html/"+count+"/index.html",'w')
    fs.appendFileSync("../../../var/www/html/"+count+"/index.html","<!DOCTYPE html> <html lang=\"en\"> <head> <meta charset=\"UTF-8\"> " +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> " +
        "<title>Document</title> </head> <body> <a download href='" + req.body.fileURL +
        "'>Ссылка</a></body> </html>")

    newSharee.save().then(result =>{
        console.log(result)
    }).catch(err => console.log(err))
    res.status(200).json({
        message: "Данные новой раздачи загружены",
        newShare: newShare
    });
}))


module.exports = router