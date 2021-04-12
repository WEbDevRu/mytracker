const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')
const ProfileActions = require('../controllers/profile/profileActions')
const ProfileInfo = require('../controllers/profile/profileInfo')
const Profile = require('../models/profile')



//Отправить заявку на добавления в друзья
router.post("/proposal/:userId", checkAuth, ProfileActions.deny_proposal)

//Отменить отправку заявки на добаление в друзья
router.delete("/proposal/:userId", checkAuth, ProfileActions.cancel_proposal)

//Подтвердить входящую заявку в друзья
router.post("/proposals/:friendId", checkAuth, ProfileActions.accept_friendship)

//Отклонить входящую заявку в друзья
router.delete("/proposals/:friendId", checkAuth, ProfileActions.deny_friendship)

// убрать уведомление о новом друге (или об отказе)
router.delete("/delete_notification/:friendId", checkAuth, ProfileActions.delete_notification)

// Удалить друга
router.delete("/delete_friend/:friendId", checkAuth, ProfileActions.delete_friend)






// Загрузка аватара
router.post("/avatar", checkAuth, ProfileInfo.upload_avatar)

router.post("/avatar", checkAuth, ProfileInfo.store_avatar)

// Получить аватар
router.get("/avatar", checkAuth, ProfileInfo.get_avatar)

//Обновление информации о профиле
router.put("/", checkAuth, ProfileInfo.put_info)

//Получить информацию о своём профиле
router.get("/", checkAuth, ProfileInfo.get_profile_info)

//Информация о чужом профиле по Id
router.get("/userid/:userId",  ProfileInfo.get_profile_info_byId)

//Полный список пользователей (нужен для разработки)
router.get("/list",  ProfileInfo.get_profiles_full_list)

//Список пользователей с отношением к запращиващему профилю
router.get("/profileslist", checkAuth, ProfileInfo.get_profiles_list)

// Эндпоинт для пинга заявок
router.get("/your_proposals", checkAuth, ProfileInfo.get_your_proposals)

//Список пользователей
router.get("/friends", checkAuth, ProfileInfo.get_friends_list)









module.exports = router