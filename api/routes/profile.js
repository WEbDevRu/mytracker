const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')
const Profile = require('../models/profile');
const ProfileInfo = require('../models/profileInfo/profileInfo');
const checkAuth = require('../middleware/check-auth')

router.post('/signup', (req,res,next) =>{

    Profile.find().or([{'email': req.body.email},{'login': req.body.login}])
        .exec()
        .then(user =>{
            if(user.length >= 1){
                console.log('1')
                for(let i = 0; i <= user.length+1; i++){

                    if(user[i].email == req.body.email){
                        return res.status(409).json({
                            message: "Mail exists"
                        })
                    }
                    else if (user[i].login == req.body.login){
                        return res.status(409).json({
                            message: "Login exists"
                        })
                    }
                }

            }

            else{
                bcrypt.hash(req.body.password, 10, (err,hash)=>{
                    if(err){
                        return res.status(500).json({
                            error:err
                        });
                    }
                    else{
                        const userId = mongoose.Types.ObjectId();
                        const profile = new Profile({
                            _id: userId,
                            email: req.body.email,
                            login: req.body.login,
                            regDate: new Date(),
                            password: hash
                        })
                        const newProfileInfo = new ProfileInfo(
                            {
                                _id: userId,
                                name: "",
                                soName: "",
                                company: "",
                                description: ""

                            })
                        profile
                            .save()
                        newProfileInfo.save()
                            .then(result =>{
                                res.status(201).json({
                                    message: "user created"
                                })
                            })
                            .catch(err=>{
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }

                })
            }
        })
})

router.post("/login", (req, res, next) => {
    Profile.find({email: req.body.email})
        .exec()
        .then(user=>{
            if(user.length < 1){
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err,result)=>{
                if(err){
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result){
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        'jerjg',
                        {
                            expiresIn: '1h'
                        }
                    )
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Auth failed'
                })
            })
        })
})


router.get("/me", checkAuth, (req,res)=>{
    Profile
        .findOne({email:req.userData.email})
        .limit(1)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            res.status(200).json({
                userId: docs._id,
                email: docs.email,
                login: docs.login,
                regDate: docs.regDate,


            })
        })

})



module.exports = router