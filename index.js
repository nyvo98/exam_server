import http from 'http'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './common/connectDB'
// routes
import User from './routes/user'
import Question from './routes/question'
import Test from './routes/test'
import Subject from './routes/subject'

import i18n from 'i18n'

require('dotenv').config()

// Setup server express
const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(cookieParser())

// route
app.use('/api/user', User)
app.use('/api/test', Test)
app.use('/api/question', Question)
app.use('/api/subject', Subject)

// error handler
app.use(function (err, req, res, next) {
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload)
  }
})

i18n.configure({
  locales: ['en', 'vi'],
  directory: './locales'
})
const server = http.createServer(app)

// Database connection

connectDatabase()
server.listen(process.env.PORT)

console.log('Starting Load: Exam server started at port ' + process.env.PORT)
