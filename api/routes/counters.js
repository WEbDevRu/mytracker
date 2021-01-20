const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Counter = require('../models/counters');
router.get('/',  (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await Counter.countDocuments();
    Counter
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

router.post('/', ((req, res, next) => {
    const counter = new Counter(
        {
            _id:  mongoose.Types.ObjectId(),
            name: req.body.name,
            domen: req.body.domen,
            dayusers: req.body.dayusers,
            allusers: req.body.allusers,
            status: req.body.status
    })
    counter.save().then(result =>{
        console.log(result)
    }).catch(err => console.log(err))
    res.status(200).json({
        message: "POST запрос к счётчикам",
        newCounter: counter
    });
}))

router.get('/:counterId', ((req, res, next) => {
    const id = req.params.counterId
    Counter.findById(id)
        .exec()
        .then(doc =>{
            console.log(doc)
            res.status(200).json(doc)
        })
        .catch(err =>{
            console.log(err)
            res.status(503).json(err)
        })

}))




module.exports = router