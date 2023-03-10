require('dotenv').config()
const express = require('express')
const app = express();
const path = require('path')
const { logger } = require('./middleware/logger')
const { errorHandler } = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')
const cors = require('cors')

const PORT = process.env.PORT || 3500

connectDB()

//logea requests y crea un archivo de logs.
app.use(logger)

app.use(express.json())

app.use(cookieParser())

app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.use('/users', require('./routes/userRoutes'))
app.use('/fields', require('./routes/fieldRoutes'))

app.all('*', (req, res) => {
    res.status(400)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: "404 Not Found" })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`)
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
