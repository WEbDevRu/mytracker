const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/users');



router.get('/', (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await User.countDocuments();
    User
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


router.get('/:userId', ((req, res, next) => {
    const id = req.params.userId
    User.findById(id)
        .exec()
        .then(doc =>{

            res.status(200).json(doc)
        })
        .catch(err =>{
            console.log(err)
            res.status(503).json(err)
        })

}))


router.post('/', (req, res, next) => {
    const user = new User(
        {
            _id:  mongoose.Types.ObjectId(),
            imgurl: req.body.imgurl,
            name: req.body.name,
            country: req.body.country,
            time: req.body.time,
            date: new Date(),
            revenue: req.body.revenue
        })
    user.save().then(result =>{
        console.log(result)
    }).catch(err => console.log(err))
    res.status(200).json({
        message: "POST запрос к счётчикам",
        newUser: user
    });
})

module.exports = router