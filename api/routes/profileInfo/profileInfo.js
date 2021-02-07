const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ProfileInfo = require('../../models/profileInfo/profileInfo');
const Profile = require('../../models/profile')
const checkAuth = require('../../middleware/check-auth')




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

router.get("/", checkAuth, (req,res)=>{
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
            if(docs){
                res.status(200).json(docs)
            }
            else{
                res.status(404).json({message:'Profile info not found'})
            }
        })
})


router.get("/userid/:userId",  (req,res)=>{
    ProfileInfo
        .findOne({_id: req.params.userId})
        .then(docs =>{
            if(docs){
                res.status(200).json({
                    company: docs.company,
                    description: docs.description,
                    name: docs.name,
                    soName: docs.soName
                })
            }
            else{
                res.status(404).json({message:'Profile info not found'})
            }
        })
})


router.get("/list",  (async (req,res)=>{
    const { page = 1, limit = 5 } = req.query
    const count = await ProfileInfo.countDocuments();
    ProfileInfo
        .find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            res.status(200).json({
                items: docs,
                totalPages: count,
                currentPage: page

            })
        })
        .catch()
}))

router.get("/friendslist", checkAuth, (async (req,res)=>{
    const { page = 1, limit = 5 } = req.query
    const count = await ProfileInfo.countDocuments();
    ProfileInfo
        .find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            let newdocs = docs.map((doc) => {
                let friendStatus = undefined
                if (req.userData.userId == doc._id){
                    friendStatus = "It is you"
                }
                else if(doc.friends.indexOf(req.userData.userId) != -1){
                    friendStatus = "Your friend"
                }
                else if(doc.proposals.indexOf(req.userData.userId)!= -1){
                    friendStatus = "proposal sent"
                }
                else {
                    friendStatus = "plain user"
                }

                return {
                    _id: doc._id,
                    name: doc.name,
                    soName: doc.soName,
                    company : doc.company,
                    description: doc.description,
                    friendStatus: friendStatus
                }
            })
            res.status(200).json({

                items: newdocs,
                totalPages: count,
                currentPage: page

            })
        })
        .catch(error=>{
            res.status(404).json({message: error})
        })
}))





module.exports = router


