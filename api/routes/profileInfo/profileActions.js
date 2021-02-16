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





router.post("/proposals/:friendId", checkAuth, (req,res)=>{
    ProfileInfo.findOne({_id: req.userData.userId}).then(docs =>{
        // Проверяем что такая завявка есть
        if(docs.proposals.indexOf(req.params.friendId) != -1){
                ProfileInfo
                    .findOneAndUpdate({_id: req.params.friendId}, {$addToSet: {friends: req.userData.userId},
                        $push: {newFriends: {accepted: req.userData.userId}}}).then(doc=>{
                    ProfileInfo
                        .findOneAndUpdate({_id: req.userData.userId}, {$addToSet: {friends: req.params.friendId}, $pull: {proposals: req.params.friendId}})
                        .then(doc=>{
                            res.status(200).json({message: "Friend added"})
                        })
                }).catch(error=>{
                    res.status(500).json({message: "Something go wrong"})
                })
        }
        else{
            res.status(404).json({message: "You have not this proposal"})
        }
    }
    )
})



router.delete("/proposals/:friendId", checkAuth, (req,res)=>{
    ProfileInfo.findOne({_id: req.userData.userId}).then(docs =>{
            // Проверяем что такая завявка есть
            if(docs.proposals.indexOf(req.params.friendId) != -1){


                    ProfileInfo
                        .findOneAndUpdate({_id: req.userData.userId}, {$pull: {proposals: req.params.friendId}}).then(doc=>{
                        ProfileInfo
                            .findOneAndUpdate({_id: req.params.friendId}, {$addToSet: {newFriends: {denied: req.userData.userId}}}).then(doc=>{
                            res.status(200).json({message: "Proposal denied"})
                        })
                    }).catch(error=>{
                        res.status(500).json({message: "Something go wrong"})
                    })


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
                    ProfileInfo
                        .findOneAndUpdate({_id:req.params.friendId}, {$pull: {friends: req.userData.userId}}).then(doc=>{

                    res.status(200).json({message: "friend deleted"})
                    })
                }).catch(error=>{
                res.status(500).json({message: "Something go wrong"})
            })

        }
        else{
            res.status(404).json({message: "You have not this friend"})
        }
    }).catch(error=> {
        res.status(500).json({message: "error"})
    })

})











module.exports = router


