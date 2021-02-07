const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ProfileInfo = require('../../models/profileInfo/profileInfo');
const checkAuth = require('../../middleware/check-auth')



//Отправить заявку на добавления в друзья
router.post("/proposal/:userId", checkAuth, (req,res)=>{
    if(req.params.userId != req.userData.userId){
        ProfileInfo
            .findOneAndUpdate({_id:req.params.userId}, {$addToSet :{proposals: req.userData.userId}})
            .then(doc=>{
                res.status(200).json({message: "proposal sended"})
            })
            .catch(error=> {
                res.status(500).json({message: error})
            })
    }
    else{
        res.status(500).json({message: "Can not friends with youself"})
    }

})

//Отменить заявку на добаление в друзья
router.delete("/proposal/:userId", checkAuth, (req,res)=>{
    ProfileInfo
        .findOneAndUpdate({_id:req.params.userId}, {$pull :{proposals: req.userData.userId}})
        .then(doc=>{
            res.status(200).json({message: "proposal deleted"})
        })
        .catch(error=> {
            res.status(500).json({message: error})
        })
})

//Работа с заявками (приём или отклонение)
router.put("/proposals/", checkAuth, (req,res)=>{
    ProfileInfo.findOne({_id: req.userData.userId}).then(docs =>{
        // Проверяем что такая завявка есть
        if(docs.proposals.indexOf(req.body.friendId) != -1){

            if(req.body.action === 'accept'){
                ProfileInfo
                    .findOneAndUpdate({_id: req.body.friendId}, {$addToSet: {friends: req.userData.userId},
                        $addToSet: {newFriends: {accepted: req.userData.userId}}}).then(doc=>{
                    ProfileInfo
                        .findOneAndUpdate({_id: req.userData.userId}, {$addToSet: {friends: req.body.friendId}, $pull: {proposals: req.body.friendId}})
                        .then(doc=>{
                            res.status(200).json({message: "Friend added"})
                        })
                }).catch(error=>{
                    res.status(500).json({message: "Something go wrong"})
                })
            }
            else if (req.body.action === 'deny'){

                ProfileInfo
                    .findOneAndUpdate({_id: req.userData.userId}, {$pull: {proposals: req.body.friendId}}).then(doc=>{
                    ProfileInfo
                        .findOneAndUpdate({_id: req.body.friendId}, {$addToSet: {newFriends: {denied: req.userData.userId}}}).then(doc=>{
                        res.status(200).json({message: "Proposal denied"})
                    })
                }).catch(error=>{
                    res.status(500).json({message: "Something go wrong"})
                })
            }

        }
        else{
            res.status(404).json({message: "You have not this proposal"})
        }
    }
    )



})


// убрать уведомление о новом друге (или об отказе)
router.delete("/delete_notification/:friendId", checkAuth, (req,res)=>{
    ProfileInfo
        .findOneAndUpdate({_id:req.userData.userId}, {$pullAll :{newFriends: [{denied: req.params.friendId}, {accepted: req.params.friendId}]}})
        .then(doc=>{
            res.status(200).json({message: "notification deleted"})
        })
        .catch(error=> {
            res.status(500).json({message: error})
        })
})


// Удалить друга
router.delete("/delete_friend/:friendId", checkAuth, (req,res)=>{

    ProfileInfo.findOne({_id: req.userData.userId}).then(docs => {
        if (docs.friends.indexOf(req.params.friendId) != -1) {
            ProfileInfo
                .findOneAndUpdate({_id:req.userData.userId}, {$pull: {friends: req.params.friendId}})
                .then(doc=>{
                    res.status(200).json({message: "friend deleted"})
                })

        }
        else{
            res.status(404).json({message: "You have not this friend"})
        }
    }).catch(error=> {
        res.status(500).json({message: "error"})
    })

})


// Эндпоинт для пинга заявок

 router.get("/your_proposals", checkAuth, (req,res)=>{
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
            if(docs.proposals.length > 0 ){
                res.status(200).json({proposals: docs.proposals})
            }
            else{
                res.status(200).json({proposals: "no proposals"})
            }
        })
})









module.exports = router


