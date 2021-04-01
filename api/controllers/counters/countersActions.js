const Counter = require('../../models/counters');
const mongoose = require('mongoose');
exports.post_counter = (req, res, next) => {
    const counter = new Counter(
        {
            _id:  mongoose.Types.ObjectId(),
            profileId: req.userData.userId,
            name: req.body.name,
            domen: req.body.domen,
            dayusers: 0,
            allusers: 0,
            status: "checking"

        })
    counter.save()
        .then(
            res.status(200).json({
                message: "Counter posted",
                newCounter: counter,
                pixelCode: "<script>\n" +
                    "\tlet script = document.createElement('script');\n" +
                    "\tscript.src = \"https://trackyour.site/scripts/pixel.js\"\n" +
                    "\tdocument.head.append(script);\n" +
                    "\tscript.onload = () => {\n" +
                    "  \t\ttrackerInit("+"'"+counter._id+"'"+")\n" +
                    "\t}\t\n" +
                    "</script>"
            }))
        .catch(error =>{
            res.status(500).json({
                message: error
            })
        })

}