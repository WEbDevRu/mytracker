const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Counter = require('../models/counters');
const checkAuth = require('../middleware/check-auth')

const CounterInfo = require('../controllers/counters/countersInfo')
const CounterActions = require('../controllers/counters/countersActions')


// Список счётчиков профиля
router.get('/', checkAuth, CounterInfo.get_profile_counters)

//Список счётчиков друзей
router.get('/friendsCounters', checkAuth, CounterInfo.get_friends_counters)

// Информация о счётчике
router.get('/counter/:counterId', checkAuth, CounterInfo.get_counter_byId)

//Создание нового счётчика
router.post('/', checkAuth, CounterActions.post_counter)








module.exports = router