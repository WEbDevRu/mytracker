const express = require('express');
const router = express.Router();

router.get('/', ((req, res, next) => {
    res.status(200).json({
       items: [
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'Россия',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           },
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'Сша',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           },
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'США',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           },
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'РОССИЯ',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           },
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'РОССИЯ',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           },
           {
               iconUrl: "https://nikrainev.ru/1img/profile.svg",
               country: 'Франция',
               time: '400',
               date: 'сегодня в 21:22',
               income: '0$'
           }

       ]
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