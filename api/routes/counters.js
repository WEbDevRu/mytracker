const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Counter = require('../models/counters');
const checkAuth = require('../middleware/check-auth')
router.get('/', checkAuth, (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await Counter.countDocuments({"profileId": req.userData.userId});

    Counter
        .find({"profileId": req.userData.userId})
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
        .catch(error =>{
            res.status(500).json({
                message: error
            })
        })
}))

router.post('/', checkAuth, (req, res, next) => {
    const counter = new Counter(
        {
            _id:  mongoose.Types.ObjectId(),
            profileId: req.userData.userId,
            name: req.body.name,
            domen: req.body.domen,
            dayusers: 0,
            allusers: 0,
            status: "checking"
    })
    counter.save()
        .then(
            res.status(200).json({
                message: "Counter posted",
                newCounter: counter,
                pixelCode: "<script>\n" +
                    "\tlet script = document.createElement('script');\n" +
                    "\tscript.src = \"https://trackyour.site/scripts/pixel.js\"\n" +
                    "\tdocument.head.append(script);\n" +
                    "\tscript.onload = () => {\n" +
                    "  \t\ttrackerInit("+"'"+counter._id+"'"+")\n" +
                    "\t}\t\n" +
                    "</script>"
            }))
        .catch(error =>{
            res.status(500).json({
                message: error
            })
        })

})

router.get('/:counterId', checkAuth,(req, res, next) => {
    Counter.findOne({profileId: req.userData.userId, _id: req.params.counterId})
        .exec()
        .then(doc =>{
            if(doc){
                res.status(200).json({
                    _id: doc._id,
                    name: doc.name,
                    domen: doc.domen,
                    dayusers: doc.dayusers,
                    allusers: doc.allusers,
                    status: doc.status,
                    pixelCode: "<script>\n" +
                        "\tlet script = document.createElement('script');\n" +
                        "\tscript.src = \"https://trackyour.site/scripts/pixel.js\"\n" +
                        "\tdocument.head.append(script);\n" +
                        "\tscript.onload = () => {\n" +
                        "  \t\ttrackerInit("+"'"+doc._id+"'"+")\n" +
                        "\t}\t\n" +
                        "</script>"
                })
            }
            else{
                res.status(404).json({message: "you do not have such a counter"})
            }

        })
        .catch(err =>{
            res.status(500).json(err)
        })

})




module.exports = router