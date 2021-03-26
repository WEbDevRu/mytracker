const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')


const UsersInfo = require('../controllers/users/usersInfo')

// Пользователи счётчика
router.get("/counter/:counterId", UsersInfo.get_counter_users)

// Информация о пользователе
router.get("/user/:tysId", UsersInfo.get_user_byId)

// Список пользователей со всех счётчиков у профиля в порядке убывания по дате
router.get("/profile", checkAuth, UsersInfo.get_profile_users)

// Краткая сводка за сутки
router.get("/summary", checkAuth, UsersInfo.get_summary)

// Данные для графика выводящего количество пользователей в час
router.get("/summary/graphic", checkAuth, UsersInfo.get_summary_graphic)



module.exports = router