const express = require('express');
const router = express.Router();

router.get('/', ((req, res, next) => {
    res.status(200).json({
        message: "Get запрос выполнен",
        userId: '1'
    });
}))

router.post('/', (req, res, next) => {
    const user = {
        userId: req.body.userId,
        userTime: req.body.userTime
    }
    res.status(201).json({
        message: "POST запрос выполнен",
        newUser: user
    });
})

router.get('/:userId', ((req, res, next) => {
    const id = req.params.userId
    if (id == 'nikita'){
        res.status(200).json({
            message: "Вы админ",
            userId: id
        });
    }
    else if(id < 1000){
        res.status(200).json({
            message: "Вы обычный пользователь",
            userId: id
        });
    }

}))

module.exports = router