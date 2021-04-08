const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Auth = require('../../models/auth');
const emailTemplate = require('./regestrationEmail')
const jwt = require('jsonwebtoken')
const Profile = require('../../models/profile')

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
                            password: hash,
                            stage: 'confirm email'
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
                                    from: '"Трекер регистрация" <noreply@trackyour.site>',
                                    to: user.email,
                                    subject: 'Письмо для подтверждения почты, trackyour.site',
                                    text: '',
                                    html: emailTemplate.regEmail(token)
                                })
                            })
                            .then((mail)=>{
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

exports.confirm_email = async (req, res) =>{

    try{
        const decoded = jwt.verify(req.params.confirm_token, 'jerjg')
        if(decoded.type === 'registration') {


            Auth
                .findOneAndUpdate({_id: decoded.userId, stage: "confirm email"}, {stage: "additional_information"})
                .exec((err, user) =>{
                    if(err){
                        res.status(500).json({error: err})
                    }
                    else if(user){
                        const newProfile = new Profile({
                            _id: decoded.userId,
                            name: "",
                            soName: "",
                            company: "",
                            description: "",
                            avatar: 'none'})
                        newProfile
                            .save()
                            .catch(error=>{

                            })

                        res.status(200).json({message: "email confirmed"})
                    }
                    else{
                        res.status(400).json({error: "false stage"})
                    }
                })
        }
        else{
            res.status(500).json({error: "incorrect token"})
        }
    }
    catch (err){
        if(err.message === 'jwt expired'){
            res.status(200).json({message: 'jwt expired'})
        }
        else{
            res.status(500).json({error: "incorrect token"})
        }
    }






}

exports.send_email =  (req, res) =>{
    Auth.findOne({_id: req.userData.userId, stage: 'confirm email'})
        .then(result=>{
            console.log(result)
            if(result){
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
                        userId: req.userData._id,
                        type: 'registration'
                    },
                    'jerjg',
                    {
                        expiresIn: '1h'
                    }
                )

                transporter.sendMail({
                    from: '"Трекер регистрация" <noreply@trackyour.site>',
                    to: req.userData.email,
                    subject: 'Письмо для подтверждения почты, trackyour.site',
                    text: '',
                    html: emailTemplate.regEmail(token)
                }).then(
                    res.status(200).json({message: 'mail sent'})
                ).catch(error=>{
                    res.status(500).json({error: error})
                })
            }
            else{
                res.status(400).json({error: "false stage"})
            }

        })


}

exports.add_info = (req, res) =>{

    if(req.body.name && req.body.soName && req.body.name.length > 1 && req.body.soName.length >1){
        Auth
            .findOneAndUpdate({_id: req.userData.userId, stage: "additional_information"}, {stage: "registered"})
            .exec((err, user) =>{
                if(err){
                    res.status(500).json({error: err})
                }
                else if(user){
                    Profile.findOneAndUpdate({_id: req.userData.userId}, {
                        name: req.body.name,
                        soName: req.body.soName,
                        company: req.body.company || '',
                        description: req.body.description || ''
                    }).exec((err, product) =>{
                        if(err){
                            res.status(500).json({err: err.message})
                        }
                        if(product){

                            res.status(200).json({ message: 'Successfully'})

                        }

                    })


                }
                else{
                    res.status(400).json({error: "false stage"})
                }
            })
    }
    else{
        res.status(400).json({message: "name and soname are required"})
    }
}

















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