const Counter = require('../../models/counters');
const Profile = require('../../models/profile');
const User = require('../../models/users')
const Auth = require('../../models/auth')


let getCounterWithUsers = (counters) =>{
    // получаю количество  пользователей
    let countersId = counters.map(counter =>(counter._id))
    let date = new Date()
    let dayBeginTime = date.getHours()*60*60*1000 + date.getMinutes()*60*1000 +
        date.getSeconds()*1000 + date.getMilliseconds()
    dayBeginTime =  Date.now() - dayBeginTime
    let countersWithUsers = [...counters]

    return User
        .find({counterId: countersId, lastSession: {$gte: dayBeginTime}})
        .then(users =>{

            countersWithUsers.forEach((counter, counterIndex) =>{
                users.forEach((user)=>{
                    if(counter._id.toString() === user.counterId.toString()){
                        console.log(countersWithUsers[counterIndex].dayusers)
                        countersWithUsers[counterIndex].dayusers = ++countersWithUsers[counterIndex].dayusers

                    }
                })
            })

            return countersWithUsers
        })
}

exports.get_profile_counters = (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await Counter.countDocuments({"profileId": req.userData.userId});
    Counter
        .find({"profileId": req.userData.userId})
        .limit(limit*1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .then(counters =>{
            return counters
        })
        .then(counters=>{
            let counterWithLogin = [...counters]
           return Auth
                .findOne({_id: req.userData.userId})
                .then(user=>{
                    return counterWithLogin.map((item) =>({
                        login: user.login,
                        ...item._doc
                    }))

                })
        })
        .then(counters =>{
            return getCounterWithUsers(counters)
        })
        .then(counters =>{
            res.status(200).json({
                items: counters,
                totalDocs: count,
                currentPage: page
            })
        })
        .catch(error =>{
            res.status(500).json({
                error: error
            })
        })
})




exports.get_friends_counters = (async (req, res, next) => {
    const {page = 1, limit = 5} = req.query
    const count = await Counter.countDocuments({"profileId": req.userData.userId})
    Profile
        .findOne({"_id": req.userData.userId})
        .then(user=>{
            return Counter
                .find({profileId: user.friends})
                .limit(limit*1)
                .skip((page - 1) * limit)
                .sort({_id:-1})
                .then(friendsCounters =>{

                    return friendsCounters
            })
        })
        .then(friendsCounters =>{

            // получаю login пользователя по profileId
            let arrayPromises = []
            friendsCounters.forEach((counter) =>{
                let getUserNick = (counter) =>{

                    return Auth.findOne({_id: counter.profileId})
                        .then(user =>{
                            let counterWithLogin = {...counter._doc}
                            counterWithLogin.login = user.login
                            delete counterWithLogin.profileId
                            return counterWithLogin
                        })
                        .catch(error =>{
                            console.log(error)
                        })
                }

                arrayPromises.push(getUserNick(counter))
            })
            return Promise.all(arrayPromises).then(counters => (counters))
        })
        .then(counters =>{

            return getCounterWithUsers(counters)

        })
        .then(counters=>{
            res.status(200).json({
                items: counters,
                totalDocs: count,
                currentPage: page
            })
        })
        .catch(error =>{
            res.status(500).json({
                error: error
            })
        })
})




exports.get_counter_byId = (req, res) => {

    Counter
        .findOne({profileId: req.userData.userId, _id: req.params.counterId})
        .exec()
        .then(doc =>{
            if(doc){

                getCounterWithUsers([doc]).then(counter=>{
                   console.log(counter)
                    res.status(200).json({
                        _id: counter._id,
                        name: counter.name,
                        domen: counter.domen,
                        dayusers: counter.dayusers,
                        allusers: counter.allusers,
                        pixelCode: "<script>\n" +
                            "\tlet script = document.createElement('script');\n" +
                            "\tscript.src = \"https://trackyour.site/scripts/pixel.js\"\n" +
                            "\tdocument.head.append(script);\n" +
                            "\tscript.onload = () => {\n" +
                            "  \t\ttrackerInit("+"'"+doc._id+"'"+")\n" +
                            "\t}\t\n" +
                            "</script>"
                    })
                })

            }
            else{
                res.status(404).json({message: "you do not have such a counter"})
            }

        })
        .catch(err =>{
            res.status(500).json(err)
        })

}