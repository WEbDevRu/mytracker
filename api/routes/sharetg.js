const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const newShare = require('../models/sharetg');
const fs = require('fs')
const path =require('path')
const { DownloaderHelper } = require('node-downloader-helper');

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
    fs.mkdirSync(count.toString())
    fs.openSync(count+"/index.html",'w')
    let reqPath = path.join(__dirname, '../../')
    const dl = new DownloaderHelper(req.body.fileURL, reqPath+count);

    dl.on('end', () => console.log('Download Completed'))
    dl.start();
    const newSharee = new newShare(
        {
            _id:  mongoose.Types.ObjectId(),
            userName: req.body.userName,
            fileName: req.body.fileName,
            fileURL: req.body.fileURL,
            nativeFileName: req.body.nativeFileName,
            isLoaded: true,
            directoryName: count
        })

    let format = req.body.nativeFileName.split(".");
    format = format[format.length - 1]
    fs.appendFileSync(count+"/index.html","<!DOCTYPE html>\n" +
        "<html lang=\"ru\">\n" +
        "<head>\n" +
        "\t<meta charset=\"UTF-8\">\n" +
        "\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
        "\t<title>"+req.body.nativeFileName+"</title>\n" +
        "\t<link rel=\"stylesheet\" href=\"../styles/style.css\">\n" +
        "\t<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\">\n" +
        "\t<link href=\"https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,300&display=swap\" rel=\"stylesheet\">\n" +
        "</head>\n" +
        "<body>\n" +
        "\t<div class='download-container'>\n" +
        "\t\t<h1>Скачайте ваш файл:</h1>\n" +
        "\t\t<div class=\"file-img\">\n" +
        "\t\t\t<img src=\"../styles/file.svg\" alt=\"\">\n" +
        "\t\t\t<p class='filename'>"+format+"</p>\n" +
        "\t\t</div>\n" +
        "\t\t\n" +
        "\t\t<a class='download-button' download href='"+req.body.nativeFileName+"'>Скачать</a>\n" +
        "\t</div>\n" +
        "</body>\n" +
        "</html>")
    
    newSharee.save().then(result =>{
        console.log(result)
    }).catch(err => console.log(err))
    res.status(200).json({
        message: "Данные новой раздачи загружены"
    });
}))


module.exports = router