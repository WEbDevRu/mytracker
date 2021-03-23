const Counter = require('../../models/counters');
const Profile = require('../../models/profile');
const User = require('../../models/users')

exports.get_profile_counters = (async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query
    const count = await Counter.countDocuments({"profileId": req.userData.userId});
    Counter
        .find({"profileId": req.userData.userId})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .then(counters =>{
            return counters
        })
        .then(counters=>{
            // получаю login пользователя по profileId
            let arrayPromises = []
            let countersId = counters.map(counter =>(counter._id))
            console.log(countersId)


            counters.forEach((counter) =>{
                let getUserNick = (counter) =>{

                    return Profile.findOne({_id: counter.profileId})
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
            // получаю количество  пользователей
            let countersId = counters.map(counter =>(counter._id))
            return User
                .find({counterId: countersId})
                .then(users =>{

                    let countersWithUsers = [...counters]
                    countersWithUsers.forEach((counter, counterIndex) =>{
                        users.forEach((user) =>{
                            if(counter._id.toString() === user.counterId.toString()){
                                countersWithUsers[counterIndex].allusers = ++countersWithUsers[counterIndex].allusers
                                let date = new Date()
                                if(Date.now() - Date.parse(user.lastSession) < date.getHours()*60*60*1000 + date.getMinutes()*60*1000 +
                                    date.getSeconds()*1000 + date.getMilliseconds()){
                                    countersWithUsers[counterIndex].dayusers = ++countersWithUsers[counterIndex].dayusers
                                }
                            }
                        })
                    })
                    return countersWithUsers
                })

        })
        .then(counters =>{
            res.status(200).json({
                items: counters,
                totalPages: count,
                currentPage: page
            })
        })
        .catch(error =>{
            res.status(500).json({
                message: error
            })
        })
})

exports.get_counter_byId = (req, res, next) => {
    Counter.findOne({profileId: req.userData.userId, _id: req.params.counterId})
        .exec()
        .then(doc =>{
            if(doc){
                res.status(200).json({
                    _id: doc._id,
                    name: doc.name,
                    domen: doc.domen,
                    dayusers: doc.dayusers,
                    allusers: doc.allusers,
                    status: doc.status,
                    pixelCode: "<script>\n" +
                        "\tlet script = document.createElement('script');\n" +
                        "\tscript.src = \"https://trackyour.site/scripts/pixel.js\"\n" +
                        "\tdocument.head.append(script);\n" +
                        "\tscript.onload = () => {\n" +
                        "  \t\ttrackerInit("+"'"+doc._id+"'"+")\n" +
                        "\t}\t\n" +
                        "</script>"
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