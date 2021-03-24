
const Auth = require('../../models/auth');
exports.get_auth_info = (req,res)=>{
    Auth
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

}