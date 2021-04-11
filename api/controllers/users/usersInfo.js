const User = require('../../models/users');

const Counter = require('../../models/counters')


exports.get_counter_users  = (req, res)=>{
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
                res.status(200).json({usersPage: "no users", totalDocs: 0})
            }
        })
        .catch(error=>{
            res.status(404).json({message: "counter not found"})
        })
}


exports.get_user_byId  = (req, res)=>{
    User.findOne({_id: req.params.tysId})
        .then(doc=>{
        res.status(200).json(doc)
    })
        .catch(error=>{
            res.status(404).json({error: "tysId does not exists"})
        })
}


exports.get_profile_users = (req,res)=>{
    let { page = 1, limit = 5 } = req.query
    if(limit > 20){
        limit = 20
    }

    Counter.find({profileId: req.userData.userId}).then(docs=>{

        if(docs.length > 0){

            let countersId = docs.map((counter)=>(counter._id))
            User
                .find({counterId: countersId})
                .sort({lastSession: -1})
                .then(docs=>{

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
            res.status(200).json({message: "you do not have counters"})
        }
    }).catch(error=>{
        res.status(500).json({error: error})
    })
}




exports.get_summary_graphic = (req, res)=>{

    Counter
        .find({profileId: req.userData.userId})
        .then(counters=>{
            if(counters.length > 0) {
                let countersId = counters.map((counter)=>(counter._id))

                let graphicArr = []

                let countUsersInHour = (hour) =>{
                    let currentMilleSeconds = new Date().getMinutes()*60*1000 + new Date().getSeconds()*1000 + new Date().getMilliseconds()
                    let toTime = 0
                    let fromTime = 0
                    if(hour === 0){
                        toTime = Date.now()
                    }
                    else{
                        toTime = Date.now() - currentMilleSeconds - 60*60*1000*(hour - 1)
                    }
                    if(hour === 0){
                        fromTime = Date.now() - currentMilleSeconds
                    }
                    else{
                        fromTime = Date.now() - 60*60*1000*hour - currentMilleSeconds
                    }
                    let pushGraphicArr = (usersCount) =>{
                        graphicArr.push({usersCount: usersCount, hour: new Date(fromTime)})
                    }

                    return User
                        .find({counterId: countersId, lastSession: {$gte: fromTime, $lt: toTime}})
                        .then((users)=>{

                            pushGraphicArr(users.length)
                        })
                }

                let arrayOfPromises = []

                for(let hour = 0; hour < 48; hour++){
                    arrayOfPromises.push(countUsersInHour(hour))
                }

                Promise.all(arrayOfPromises).then(()=>{

                        graphicArr = graphicArr.sort((hour1, hour2)=>{
                            if (hour1.hour > hour2.hour) {
                                return 1;
                            }
                            if (hour1.hour < hour2.hour) {
                                return -1;
                            }
                            return 0
                        })
                        res.status(200).json({graphicArr: graphicArr})
                    }
                )
            }
            else{
                let graphicArr = []
                for(let hour = 0; hour < 48; hour++){
                    let currentMilleSeconds = new Date().getMinutes()*60*1000 + new Date().getSeconds()*1000 + new Date().getMilliseconds()
                    let d = new Date(Date.now() - hour*60*60*1000 - currentMilleSeconds)
                    graphicArr.push({time:d, users: 0})
                }
                res.status(200).json({graphicArr: graphicArr})
            }
        })

}


exports.get_summary = (req, res) => {
    Counter.find({profileId: req.userData.userId})
        .then(counters=>{
            if(counters.length > 0){
                let countersId = counters.map((counter)=>(counter._id))
                let d = new Date()
                let hours24Ago = Date.parse(d) - 24*60*60*1000
                User
                    .find({counterId: countersId, lastSession: {$gt: hours24Ago}})
                    .sort({lastSession: -1})
                    .then(docs=>{
                        let clicks = 0
                        docs.forEach((user, i, arr)=>{
                            user.sessions.forEach((item, i, arr)=>{
                                if(item.entryTime){
                                    if(Date.parse(item.entryTime) > Date.parse(d) - 24*60*60*1000){
                                        clicks++
                                    }
                                }
                            })
                        })
                        res.status(200).json({users: docs.length, clicks: clicks})
                    })

            }
            else{
                res.status(200).json({users: 0, clicks: 0})
            }

        })
        .catch(error=>{
            res.status(500).json({error: error})
        })
}



