const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const usersRoutes = require('./api/routes/users')
const countersRoutes = require('./api/routes/counters')
app.use(morgan('dev'))
app.use('/users',usersRoutes)
app.use('/counters',countersRoutes)


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