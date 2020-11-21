const express = require('express');
const router = express.Router();

router.get('/', ((req, res, next) => {
    res.status(200).json({
        message: "GET запрос к счётчикам ",
        userId: '1'
    });
}))

router.post('/', ((req, res, next) => {
    const counter = {
        name: req.body.name,
        domen: req.body.domen
    }
    res.status(200).json({
        message: "POST запрос к счётчикам",
        newCounter: counter
    });
}))

router.get('/:orderId', ((req, res, next) => {
    res.status(200).json({
        message: "Номер счётчика: ",
        userId: req.params.orderId
    });
}))



module.exports = router