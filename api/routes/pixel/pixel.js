const express = require('express');
const router = express.Router();
const Counter = require('../../models/counters');
const axios = require('axios');
const parser = require('ua-parser-js');

router.get("/:counterId",  (req,res)=>{
    const counterId = req.params.counterId

    /*let  ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null); */
    let ip = "::ffff:178.71.204.208"

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

            Counter
                .findOneAndUpdate({_id: counterId}, {$addToSet :{users: userInfo}})


            res.status(200).json(userInfo)

            console.log(response.data)
        })
        .catch(error => {
            console.log(error);
        });




})

module.exports = router
