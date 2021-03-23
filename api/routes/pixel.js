const express = require('express');
const router = express.Router();
const PixelActions = require('../controllers/pixel/pixelActions')

// Создание нового пользователя (отправляется при посещении без куки)
router.post("/:counterId",  PixelActions.post_newUser)

//Обновление времени ухода (отправляется раз в секунду)
router.put("/end/:counterId", PixelActions.update_goAwayTime)

//Добавление нового посещения (отправляется при посещении с куки)
router.put("/:counterId", PixelActions.update_user)



module.exports = router
