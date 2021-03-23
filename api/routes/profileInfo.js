const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')
const ProfileActions = require('../controllers/profile/profileActions')
const ProfileInfoController = require('../controllers/profile/profileInfo')
const ProfileInfo = require('../models/profileInfo/profileInfo')
const multer = require('multer')
const sharp = require('sharp');


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




const storage = multer.diskStorage({

    destination: (req, file, cb) =>{
        cb(null, './static/');
    },
    filename: (req, file, cb) =>{
        cb(null, req.userData.userId + '.' + file.originalname.split('.').pop())
        console.log(file)
    }

})

const fileFilter = (req, file, cb) =>{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){

        cb(null, true)
    }
    else {
        cb(new Error('Only png, jpeg, jpg allowed'))
    }
}


const upload = multer({
    storage: storage,
    limits : {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter

}).fields([{
    name: 'avatarImage',
    maxCount: 1
}
])

router.post("/avatar",  checkAuth, (req, res, next)=>{
    upload(req,res,(err)=>{
        if(err){
            return res.status(400).json({error: err.message})
        }
        next()
    })


})

router.post("/avatar", checkAuth,  (req,res)=>{
    sharp(req.files.avatarImage[0].path)
        .resize({ fit: sharp.fit.cover, width: 300, height: 300 })
        .toFormat("jpg")
        .png({ quality: 100 })
        .toFile('static/'+req.userData.userId+'_min.jpg')
        .then(
            ProfileInfo
                .findOneAndUpdate({_id:req.userData.userId}, {avatar: 'static/'+req.userData.userId+'_min.jpg'}))
        .then(
            res.status(200).json({message: "avatar uploaded", avatar: 'static/'+req.userData.userId+'_min.jpg'})
        ).catch(error => res.status(500).json({error: error})

    )
})


// Получить аватар
router.get("/avatar", checkAuth, ProfileInfoController.get_avatar)

router.put("/", checkAuth, (req,res)=>{
    let newInfo = req.body;
    ProfileInfo
        .findOneAndUpdate({_id:req.userData.userId}, req.body)
        .exec((err, product) =>{
            if(err){
                return res.status(500).json({err: err.message})
            }
            else{
                if(product){
                    res.json({newInfo, message: 'Successfully updated'})
                }
                else{
                    return res.status(500).json({error: "No one find"})
                }

            }


        });
})


//Получить информацию о своём профиле
router.get("/", checkAuth, ProfileInfoController.get_profile_info)

//Информация о чужом профиле по Id
router.get("/userid/:userId",  ProfileInfoController.get_profile_info_byId)

//Полный список пользователей (нужен для разработки)
router.get("/list",  ProfileInfoController.get_profiles_full_list)

//Список пользователей с отношением к запращиващему профилю
router.get("/friendslist", checkAuth, ProfileInfoController.get_profiles_list)

// Эндпоинт для пинга заявок
router.get("/your_proposals", checkAuth, ProfileInfoController.get_your_proposals)

//Список пользователей
router.get("/friends", checkAuth, ProfileInfoController.get_friends_list)









module.exports = router