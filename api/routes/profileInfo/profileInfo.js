const express = require('express');
const router = express.Router();
const ProfileInfo = require('../../models/profileInfo/profileInfo');
const checkAuth = require('../../middleware/check-auth')
const multer = require('multer')
const sharp = require('sharp');


const storage = multer.diskStorage({

    destination: (req, file, cb) =>{
        cb(null, './static/');
    },
    filename: (req, file, cb) =>{
        cb(null, req.userData.userId + '.' + file.originalname.split('.').pop())
        console.log(file)
    }

})

const fileFilter = (req, file, cb) =>{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){

        cb(null, true)
    }
    else {
        cb(new Error('Only png, jpeg, jpg allowed'))
    }
}


const upload = multer({
    storage: storage,
    limits : {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter

}).fields([{
    name: 'avatarImage',
    maxCount: 1
}
])

router.post("/avatar",  checkAuth, (req, res, next)=>{
    upload(req,res,(err)=>{
        if(err){
            return res.status(400).json({error: err.message})
        }
        next()
    })


})

router.post("/avatar", checkAuth,  (req,res)=>{
    sharp(req.files.avatarImage[0].path)
        .resize({ fit: sharp.fit.cover, width: 300, height: 300 })
        .toFormat("jpg")
        .png({ quality: 100 })
        .toFile('static/'+req.userData.userId+'_min.jpg')
        .then(
        ProfileInfo
            .findOneAndUpdate({_id:req.userData.userId}, {avatar: 'static/'+req.userData.userId+'_min.jpg'}))
        .then(
            res.status(200).json({message: "avatar uploaded", avatar: 'static/'+req.userData.userId+'_min.jpg'})
        ).catch(error => res.status(500).json({error: error})

        )
})

router.get("/avatar", checkAuth,  (req,res)=>{
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
                res.status(200).json({avatar: docs.avatar})
        })
        .catch(error=>{
            res.status(500).json({message: error})
        })
})

router.put("/", checkAuth, (req,res)=>{
    let newInfo = req.body;
    ProfileInfo
        .findOneAndUpdate({_id:req.userData.userId}, req.body)
        .exec((err, product) =>{
            if(err){
                return res.status(500).json({err: err.message})
            }
            else{
                if(product){
                    res.json({newInfo, message: 'Successfully updated'})
                }
                else{
                    return res.status(500).json({error: "No one find"})
                }

            }


        });
})



router.get("/", checkAuth, (req,res)=>{
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
            if(docs){
                res.status(200).json(docs)
            }
            else{
                res.status(404).json({message:'Profile info not found'})
            }
        })
})


router.get("/userid/:userId",  (req,res)=>{
    ProfileInfo
        .findOne({_id: req.params.userId})
        .then(docs =>{
            if(docs){
                res.status(200).json({
                    company: docs.company,
                    description: docs.description,
                    name: docs.name,
                    soName: docs.soName
                })
            }
            else{
                res.status(404).json({message:'Profile info not found'})
            }
        })
})


router.get("/list",  (async (req,res)=>{
    let { page = 1, limit = 5 } = req.query
    if(limit > 20){
        limit = 20
    }
    const count = await ProfileInfo.countDocuments();
    ProfileInfo
        .find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            res.status(200).json({
                items: docs,
                totalPages: count,
                currentPage: page

            })
        })
        .catch()
}))

router.get("/friendslist", checkAuth, (async (req,res)=>{
    let { page = 1, limit = 5 } = req.query
    if(limit > 20){
        limit = 20
    }
    const count = await ProfileInfo.countDocuments();
    ProfileInfo
        .find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({_id:-1})
        .exec()
        .then(docs =>{
            let newdocs = docs.map((doc) => {
                let friendStatus = undefined
                if (req.userData.userId === doc._id){
                    friendStatus = "It is you"
                }
                else if(doc.friends.indexOf(req.userData.userId) !== -1){
                    friendStatus = "Your friend"
                }
                else if(doc.proposals.indexOf(req.userData.userId)!== -1){
                    friendStatus = "proposal sent"
                }
                else {
                    friendStatus = "plain user"
                }

                return {
                    _id: doc._id,
                    name: doc.name,
                    soName: doc.soName,
                    company : doc.company,
                    description: doc.description,
                    friendStatus: friendStatus
                }
            })
            res.status(200).json({

                items: newdocs,
                totalPages: count,
                currentPage: page

            })
        })
        .catch(error=>{
            res.status(404).json({message: error})
        })
}))


// Эндпоинт для пинга заявок

router.get("/your_proposals", checkAuth, (req,res)=>{
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
            if(docs.proposals.length > 0 ){
                ProfileInfo.find({_id: docs.proposals}).then(docs=>{
                    let proposals = docs.map((proposal) => {return {
                        userId: proposal._id,
                        name: proposal.name,
                        soName: proposal.soName,
                        company: proposal.company,
                        description: proposal.description
                    }})
                    console.log(docs)
                    res.status(200).json({proposals})
                })

            }
            else{
                res.status(200).json({proposals: "no proposals"})
            }
        })
})


router.get("/friends", checkAuth, (req,res)=>{
    let { page = 1, limit = 2 } = req.query
    if (limit > 20){
        limit = 20
    }
    ProfileInfo
        .findOne({_id:req.userData.userId})
        .then(docs =>{
            if(docs.friends.length > 0 ){
                ProfileInfo.find({_id: docs.friends}).then(docs=>{
                    let friends = docs.map((friend) => {return {
                        userId: friend._id,
                        name: friend.name,
                        soName: friend.soName,
                        company: friend.company,
                        description: friend.description
                    }})
                    let friendsPage = friends.slice(page*limit - limit, page*limit)

                    if(page > docs.length/limit+1){
                        friendsPage = "that is all"
                    }
                    res.status(200).json({friendsPage, totalDocs: docs.length, currentPage: page})
                })

            }
            else{
                res.status(200).json({friendsPage: "no friends"})
            }
        })
})





module.exports = router


