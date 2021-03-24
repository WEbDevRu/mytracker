const Profile = require('../../models/profile');


exports.deny_proposal = (req,res)=>{
    if(req.params.userId !== req.userData.userId){
        Profile
            .findOneAndUpdate({_id:req.params.userId}, {$addToSet :{proposals: req.userData.userId}})
            .then(doc=>{
                res.status(200).json({message: "proposal sended"})
            })
            .catch(error=> {
                res.status(500).json({message: error})
            })
    }
    else{
        res.status(500).json({message: "Can not friends with youself"})
    }
}

exports.cancel_proposal = (req,res)=>{
    Profile
        .findOneAndUpdate({_id:req.params.userId}, {$pull :{proposals: req.userData.userId}})
        .then(doc=>{
            res.status(200).json({message: "proposal deleted"})
        })
        .catch(error=> {
            res.status(500).json({message: error})
        })
}


exports.accept_friendship = (req,res)=>{
    Profile
        .findOne({_id: req.userData.userId}).then(docs =>{
            // Проверяем что такая завявка есть
            if(docs.proposals.indexOf(req.params.friendId) != -1){
                Profile
                    .findOneAndUpdate({_id: req.params.friendId}, {$addToSet: {friends: req.userData.userId},
                        $push: {newFriends: {accepted: req.userData.userId}}}).then(doc=>{
                    Profile
                        .findOneAndUpdate({_id: req.userData.userId}, {$addToSet: {friends: req.params.friendId}, $pull: {proposals: req.params.friendId}})
                        .then(doc=>{
                            res.status(200).json({message: "Friend added"})
                        })
                }).catch(error=>{
                    res.status(500).json({message: "Something go wrong"})
                })
            }
            else{
                res.status(404).json({message: "You have not this proposal"})
            }
        }
    )
}

exports.deny_friendship = (req,res)=>{
    Profile.findOne({_id: req.userData.userId}).then(docs =>{
            // Проверяем что такая завявка есть
            if(docs.proposals.indexOf(req.params.friendId) !== -1){


                Profile
                    .findOneAndUpdate({_id: req.userData.userId}, {$pull: {proposals: req.params.friendId}}).then(doc=>{
                    Profile
                        .findOneAndUpdate({_id: req.params.friendId}, {$addToSet: {newFriends: {denied: req.userData.userId}}}).then(doc=>{
                        res.status(200).json({message: "Proposal denied"})
                    })
                }).catch(error=>{
                    res.status(500).json({message: "Something go wrong"})
                })


            }
            else{
                res.status(404).json({message: "You have not this proposal"})
            }
        }
    )

}

exports.delete_notification = (req,res)=>{
    Profile
        .findOneAndUpdate({_id:req.userData.userId}, {$pullAll :{newFriends: [{denied: req.params.friendId}, {accepted: req.params.friendId}]}})
        .then(doc=>{
            res.status(200).json({message: "notification deleted"})
        })
        .catch(error=> {
            res.status(500).json({message: error})
        })
}

exports.delete_friend = (req,res)=>{

    Profile.findOne({_id: req.userData.userId}).then(docs => {
        if (docs.friends.indexOf(req.params.friendId) !== -1) {
            Profile
                .findOneAndUpdate({_id:req.userData.userId}, {$pull: {friends: req.params.friendId}})
                .then(doc=>{
                    Profile
                        .findOneAndUpdate({_id:req.params.friendId}, {$pull: {friends: req.userData.userId}}).then(doc=>{

                        res.status(200).json({message: "friend deleted"})
                    })
                }).catch(error=>{
                res.status(500).json({message: "Something go wrong"})
            })

        }
        else{
            res.status(404).json({message: "You have not this friend"})
        }
    }).catch(error=> {
        res.status(500).json({message: "error"})
    })

}