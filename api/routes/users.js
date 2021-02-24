const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/users');
const checkAuth = require('../middleware/check-auth')
const Counter = require('../models/counters')
router.get("/counter/:counterId", (req, res)=>{
    let { page = 1, limit = 5 } = req.query
    if(limit > 20){
        limit = 20
    }
    User.find({counterId: req.params.counterId})
        .sort({lastSession: -1})
        .then(docs=>{
        if(docs.length >0){
          let users = docs.map((user)=>({
              tysId: user._id,
              date: user.lastSession,
              sessionsNumber: user.sessionsNumber,
              country: user.data.ipInfo.countryCode,
              city: user.data.ipInfo.city,
              os: user.data.device.os.name,
              referrer: user.referer
          }))
            let usersPage = users.slice(page*limit - limit, page*limit)

            if(page > docs.length/limit+1){
                usersPage = "that is all"
            }
            res.status(200).json({usersPage, totalDocs: docs.length, currentPage: page})
        }
        else{
            res.status(200).json({proposals: "no users"})
        }
    })
})

router.get("/user/:tysId", (req, res)=>{
  User.findOne({_id: req.params.tysId}).then(doc=>{
          res.status(200).json(doc)
  })
      .catch(error=>{
          res.status(404).json({error: "tysId does not exists"})
      })
})


router.get("/profile", checkAuth, (req,res)=>{
    let { page = 1, limit = 5 } = req.query
    if(limit > 20){
        limit = 20
    }

     Counter.find({profileId: req.userData.userId}).then(docs=>{

         if(docs.length > 0){

             let countersId = docs.map((counter)=>(counter._id))
             User.find({counterId: countersId}).then(docs=>{

                if(docs.length > 0){

                    let users = docs.map((user)=>({
                        tysId: user._id,
                        date: user.lastSession,
                        sessionsNumber: user.sessionsNumber,
                        country: user.data.ipInfo.countryCode,
                        city: user.data.ipInfo.city,
                        os: user.data.device.os.name,
                        referrer: user.referer
                    }))
                    let usersPage = users.slice(page*limit - limit, page*limit)

                    if(page > docs.length/limit+1){
                        usersPage = "that is all"
                    }
                    res.status(200).json({usersPage, totalDocs: docs.length, currentPage: page})
                }
                else{
                    res.status(200).json({users: "no users"})
                }

             })

         }
         else{
             res.status(404).json({message: "you do not have counters"})
         }
     }).catch(error=>{
             res.status(500).json({error: error})
         })
})


module.exports = router