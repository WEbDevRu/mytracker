const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Auth = require('../../models/auth');
const regEmail = require('./regestrationEmail')

exports.post_signup_info = (req,res,next) =>{
    Auth.find().or([{'email': req.body.email},{'login': req.body.login}])
        .exec()
        .then(user =>{
            if(user.length >= 1){

                for(let i = 0; i <= user.length+1; i++){

                    if(user[i].email === req.body.email){
                        return res.status(409).json({
                            message: "Mail exists"
                        })
                    }
                    else if (user[i].login === req.body.login){
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
                        const profile = new Auth({
                            _id: userId,
                            email: req.body.email,
                            login: req.body.login,
                            regDate: new Date(),
                            password: hash
                        })
                        profile
                            .save()
                            .then( async (user)=>  {
                                let transporter = nodemailer.createTransport({
                                    host: 'mail.jino.ru',
                                    port: 587,
                                    secure: false,
                                    auth: {
                                        user: 'noreply@trackyour.site',
                                        pass: 'wa46067820',
                                    },
                                })

                                const token = jwt.sign(
                                    {
                                        userId: user._id,
                                        type: 'registration'
                                    },
                                    'jerjg',
                                    {
                                        expiresIn: '1h'
                                    }
                                )


                                return await transporter.sendMail({
                                    from: 'noreply@trackyour.site',
                                    to: user.email,
                                    subject: 'trackyour.site Registration',
                                    text: 'This message was sent from Node js server.',
                                    html: regEmail
                                })
                            })
                            .then((mail)=>{
                                console.log(mail)
                                res.status(201).json({
                                    message: "user created"
                                })
                                })
                            .catch(err=>{
                                res.status(500).json({
                                    error: err
                                })
                            })





                    }

                })
            }
        })
}







/*const newProfile = new Profile(
    {
        _id: userId,
        name: "",
        soName: "",
        company: "",
        description: "",
        avatar: 'none'

    }) */












exports.post_login_info = (req, res, next) => {
    Auth.find({email: req.body.email})
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
}