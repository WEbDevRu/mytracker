const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('ua-parser-js');
const mongoose = require('mongoose')
const User = require('../../models/users')

router.post("/:counterId",  (req,res)=>{
    const counterId = req.params.counterId
    const referer = req.headers.referer
    let  ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const host = req.headers.host || "undefined"
    let user_agent = req.headers["user-agent"] || "undefined"
    let accept = req.headers.accept || "undefined"
    let languages = req.headers["accept-language"] || "undefined"
    let cookie = req.headers.cookie || "undefined"

    let ua = parser(req.headers['user-agent'])
    const browserName = ua.browser.name || "undefined"
    const browserVersion = ua.browser.version || "undefined"
    const browserMajor = ua.browser.major || "undefined"
    const os = ua.os.name || "undefined"
    const osVersion = ua.os.version || "undefined"
    const deviceVendor = ua.device.vendor || "undefined"
    const deviceModel = ua.device.model || "undefined"
    const deviceType = ua.device.type|| "undefined"
    const cpu = ua.cpu.architecture || "undefined"

    axios.get('http://ip-api.com/json/'+ip)
        .then(response => {
            let userInfo = {
                ip: ip,
                ipInfo: response.data,
                headers: {
                    host: host,
                    user_agent: user_agent,
                    accept: accept,
                    languages: languages,
                    cookie: cookie
                },
                device: {
                    browser:{
                        name: browserName,
                        version: browserVersion,
                        majorVersion: browserMajor
                    },
                    os:{
                        name: os,
                        version: osVersion
                    },
                    device:{
                        vendor: deviceVendor,
                        model: deviceModel,
                        type: deviceType
                    },
                    cpu:{
                        architecture: cpu
                    }
                }
            }
            const user = new User(
                {
                    _id:  mongoose.Types.ObjectId(),
                    counterId: counterId,
                    sessions: [{entryTime: new Date()}],
                    lastSession: new Date(),
                    sessionsNumber: 1,
                    referer: referer,
                    data: userInfo
                })
            user.save().then(doc=>{
                res.status(200).json({
                    tysId: doc._id
                })
            })



        })
        .catch(error => {
           res.status(500).json({error: error})
        });
})

router.put("/end/:counterId",(req,res)=>{
    User.findOne({_id: req.body.tysId, counterId: req.params.counterId}).then(doc =>{
        let sessionsArr = doc.sessions
        console.log(Object.keys(sessionsArr[sessionsArr.length - 1])[0])
        if(Object.keys(sessionsArr[sessionsArr.length - 1])[0] === 'goAwayTime'){
            sessionsArr[sessionsArr.length - 1] = {goAwayTime: new Date()}
            User.findOneAndUpdate({_id: req.body.tysId, counterId: req.params.counterId}, {
                $set: {sessions: sessionsArr}}).then(doc =>{
                res.status(200).json({message: "goAwayTime sended"})

            })
        }
        else{
            User.findOneAndUpdate({_id: req.body.tysId, counterId: req.params.counterId}, {
                $push: {sessions: {goAwayTime: new Date()}}}).then(doc =>{
                res.status(200).json({message: "goAwayTime sended"})

            })
        }
    })

     .catch(error=>{
         res.status(505).json(error)
     })
})


router.put("/:counterId", (req,res)=>{
    User.findOneAndUpdate({_id: req.body.tysId, counterId: req.params.counterId}, {
        $push: {sessions: {entryTime: new Date()}}, $set: {lastSession: new Date()}, $inc:{sessionsNumber: 1}}).then(doc =>{
        res.status(200).json({message: "entryTime sended"})

    }).catch(error=>{
        res.status(500).json({error: error})
    })

})



module.exports = router
