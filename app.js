

const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose =require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();

})
const countersRoutes = require('./api/routes/counters')
const authRoutes = require('./api/routes/auth')
const sharetgRoutes = require('./api/routes/sharetg')
const profileRoutes = require('./api/routes/profile')
const pixelRoutes = require('./api/routes/pixel')
const usersRoutes = require('./api/routes/users')
app.use('/static', express.static('./static'))
app.use(morgan('dev'))
app.use('/counters',countersRoutes)
app.use('/auth',authRoutes)
app.use('/sharetg', sharetgRoutes)
app.use('/profile', profileRoutes)
app.use('/pixel', pixelRoutes)
app.use('/users', usersRoutes)
mongoose.connect(
    'mongodb+srv://nikrainev:wa46067820@cluster0.drt1e.mongodb.net/Cluster0?retryWrites=true&w=majority'
    ,
    {
        useNewUrlParser: true
    })




app.use((req, res , next) => {

        const error = new Error('Not found');
        error.status = 404;
        next(error);
    }
)

app.use((error, req, res, next) => {
    res.status(error.status || 505)
    res.json({
        error:{
            message: error.message
        }
    })
})
module.exports = app;

